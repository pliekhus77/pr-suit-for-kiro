/* eslint-env node, jest */
/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * Unit tests for verify-deployment.js
 * 
 * Tests marketplace deployment verification functionality including:
 * - Marketplace API response parsing
 * - Version number validation
 * - Error handling for marketplace unavailability
 * - HTTP request mocking
 */

const { EventEmitter } = require('events');

// Create manual mock for https
const mockHttpsRequest = jest.fn();

// Mock the https module before requiring the module under test
jest.mock('https', () => ({
  request: mockHttpsRequest
}));

// Import functions to test
const {
  queryMarketplace,
  extractExtensionInfo,
  verifyDeployment,
  formatDate,
  formatNumber,
  MAX_RETRIES,
  RETRY_DELAY_MS
} = require('../verify-deployment');

describe('verify-deployment', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('queryMarketplace', () => {
    
    it('should successfully query marketplace API', async () => {
      const mockResponse = {
        results: [{
          extensions: [{
            publisher: { publisherName: 'pragmatic-rhino' },
            extensionName: 'pragmatic-rhino-suit',
            displayName: 'Pragmatic Rhino SUIT',
            versions: [{ version: '1.0.0' }]
          }]
        }]
      };

      const mockReq = createMockRequest();
      mockHttpsRequest.mockImplementation((options, callback) => {
        const mockRes = new EventEmitter();
        mockRes.statusCode = 200;
        
        // Call callback immediately with response
        callback(mockRes);
        
        // Emit data after callback
        setImmediate(() => {
          mockRes.emit('data', JSON.stringify(mockResponse));
          mockRes.emit('end');
        });
        
        return mockReq;
      });

      const result = await queryMarketplace('pragmatic-rhino.pragmatic-rhino-suit');
      
      expect(result).toEqual(mockResponse);
      expect(mockHttpsRequest).toHaveBeenCalledTimes(1);
    });

    it('should reject with error for invalid extension ID format', async () => {
      await expect(queryMarketplace('invalid-id'))
        .rejects
        .toThrow('Invalid extension ID format: invalid-id. Expected format: publisher.extension-name');
    });

    it('should reject with error for missing publisher', async () => {
      await expect(queryMarketplace('.extension-name'))
        .rejects
        .toThrow('Invalid extension ID format');
    });

    it('should reject with error for missing extension name', async () => {
      await expect(queryMarketplace('publisher.'))
        .rejects
        .toThrow('Invalid extension ID format');
    });

    it('should reject with error for non-200 status code', async () => {
      setupHttpsRequest(404, 'Not Found');

      await expect(queryMarketplace('pragmatic-rhino.pragmatic-rhino-suit'))
        .rejects
        .toThrow('Marketplace API returned status 404: Not Found');
    });

    it('should reject with error for invalid JSON response', async () => {
      setupHttpsRequest(200, 'invalid json');

      await expect(queryMarketplace('pragmatic-rhino.pragmatic-rhino-suit'))
        .rejects
        .toThrow('Failed to parse marketplace response');
    });

    it('should reject with error for network failure', async () => {
      setupHttpsRequestError(new Error('Network error'));

      await expect(queryMarketplace('pragmatic-rhino.pragmatic-rhino-suit'))
        .rejects
        .toThrow('Marketplace API request failed: Network error');
    });

    it('should send correct request headers', async () => {
      const mockResponse = { results: [] };
      setupHttpsRequest(200, JSON.stringify(mockResponse));

      await queryMarketplace('pragmatic-rhino.pragmatic-rhino-suit');

      const requestOptions = mockHttpsRequest.mock.calls[0][0];
      expect(requestOptions.headers['Content-Type']).toBe('application/json');
      expect(requestOptions.headers['Accept']).toBe('application/json;api-version=3.0-preview.1');
      expect(requestOptions.method).toBe('POST');
    });

    it('should send correct request body', async () => {
      const mockResponse = { results: [] };
      const mockRequest = setupHttpsRequest(200, JSON.stringify(mockResponse));

      await queryMarketplace('pragmatic-rhino.pragmatic-rhino-suit');

      const writtenData = mockRequest.write.mock.calls[0][0];
      const requestBody = JSON.parse(writtenData);
      
      expect(requestBody.filters).toHaveLength(1);
      expect(requestBody.filters[0].criteria).toContainEqual({
        filterType: 7,
        value: 'pragmatic-rhino-suit'
      });
    });
  });

  describe('extractExtensionInfo', () => {
    
    it('should extract extension info from valid response', () => {
      const response = {
        results: [{
          extensions: [{
            publisher: { publisherName: 'pragmatic-rhino' },
            extensionName: 'pragmatic-rhino-suit',
            displayName: 'Pragmatic Rhino SUIT',
            versions: [{ version: '1.0.0' }],
            publishedDate: '2024-01-01T00:00:00Z',
            lastUpdated: '2024-01-15T00:00:00Z',
            shortDescription: 'Test extension',
            statistics: [
              { statisticName: 'install', value: 100 },
              { statisticName: 'downloadCount', value: 250 }
            ]
          }]
        }]
      };

      const info = extractExtensionInfo(response, 'pragmatic-rhino.pragmatic-rhino-suit');

      expect(info).toEqual({
        extensionId: 'pragmatic-rhino.pragmatic-rhino-suit',
        displayName: 'Pragmatic Rhino SUIT',
        version: '1.0.0',
        publisher: 'pragmatic-rhino',
        publishedDate: '2024-01-01T00:00:00Z',
        lastUpdated: '2024-01-15T00:00:00Z',
        shortDescription: 'Test extension',
        installCount: 100,
        downloadCount: 250
      });
    });

    it('should return null for empty results', () => {
      const response = { results: [] };
      const info = extractExtensionInfo(response, 'pragmatic-rhino.pragmatic-rhino-suit');
      expect(info).toBeNull();
    });

    it('should return null for missing results', () => {
      const response = {};
      const info = extractExtensionInfo(response, 'pragmatic-rhino.pragmatic-rhino-suit');
      expect(info).toBeNull();
    });

    it('should return null for empty extensions array', () => {
      const response = {
        results: [{
          extensions: []
        }]
      };
      const info = extractExtensionInfo(response, 'pragmatic-rhino.pragmatic-rhino-suit');
      expect(info).toBeNull();
    });

    it('should return null when extension not found', () => {
      const response = {
        results: [{
          extensions: [{
            publisher: { publisherName: 'other-publisher' },
            extensionName: 'other-extension',
            versions: [{ version: '1.0.0' }]
          }]
        }]
      };
      const info = extractExtensionInfo(response, 'pragmatic-rhino.pragmatic-rhino-suit');
      expect(info).toBeNull();
    });

    it('should handle case-insensitive extension matching', () => {
      const response = {
        results: [{
          extensions: [{
            publisher: { publisherName: 'Pragmatic-Rhino' },
            extensionName: 'Pragmatic-Rhino-SUIT',
            displayName: 'Test',
            versions: [{ version: '1.0.0' }]
          }]
        }]
      };
      const info = extractExtensionInfo(response, 'pragmatic-rhino.pragmatic-rhino-suit');
      expect(info).not.toBeNull();
      expect(info.extensionId).toBe('Pragmatic-Rhino.Pragmatic-Rhino-SUIT');
    });

    it('should handle missing version information', () => {
      const response = {
        results: [{
          extensions: [{
            publisher: { publisherName: 'pragmatic-rhino' },
            extensionName: 'pragmatic-rhino-suit',
            displayName: 'Test',
            versions: []
          }]
        }]
      };
      const info = extractExtensionInfo(response, 'pragmatic-rhino.pragmatic-rhino-suit');
      expect(info).not.toBeNull();
      expect(info.version).toBeNull();
    });

    it('should handle missing statistics', () => {
      const response = {
        results: [{
          extensions: [{
            publisher: { publisherName: 'pragmatic-rhino' },
            extensionName: 'pragmatic-rhino-suit',
            displayName: 'Test',
            versions: [{ version: '1.0.0' }]
          }]
        }]
      };
      const info = extractExtensionInfo(response, 'pragmatic-rhino.pragmatic-rhino-suit');
      expect(info).not.toBeNull();
      expect(info.installCount).toBe(0);
      expect(info.downloadCount).toBe(0);
    });

    it('should handle partial statistics', () => {
      const response = {
        results: [{
          extensions: [{
            publisher: { publisherName: 'pragmatic-rhino' },
            extensionName: 'pragmatic-rhino-suit',
            displayName: 'Test',
            versions: [{ version: '1.0.0' }],
            statistics: [
              { statisticName: 'install', value: 50 }
            ]
          }]
        }]
      };
      const info = extractExtensionInfo(response, 'pragmatic-rhino.pragmatic-rhino-suit');
      expect(info.installCount).toBe(50);
      expect(info.downloadCount).toBe(0);
    });
  });

  describe('verifyDeployment', () => {
    
    beforeEach(() => {
      // Mock sleep to speed up tests - need to return a timer ID
      jest.spyOn(global, 'setTimeout').mockImplementation((cb) => {
        cb();
        return 1; // Return a fake timer ID
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should verify successful deployment with correct version', async () => {
      const mockResponse = {
        results: [{
          extensions: [{
            publisher: { publisherName: 'pragmatic-rhino' },
            extensionName: 'pragmatic-rhino-suit',
            displayName: 'Test',
            versions: [{ version: '1.0.0' }]
          }]
        }]
      };
      setupHttpsRequest(200, JSON.stringify(mockResponse));

      const result = await verifyDeployment('pragmatic-rhino.pragmatic-rhino-suit', '1.0.0');

      expect(result.success).toBe(true);
      expect(result.info.version).toBe('1.0.0');
      expect(result.message).toContain('Extension is live with version 1.0.0');
    });

    it('should fail when extension not found', async () => {
      const mockResponse = { results: [] };
      setupHttpsRequest(200, JSON.stringify(mockResponse));

      const result = await verifyDeployment('pragmatic-rhino.pragmatic-rhino-suit', '1.0.0');

      expect(result.success).toBe(false);
      expect(result.info).toBeNull();
      expect(result.message).toContain('Extension not found on marketplace');
    });

    it('should fail when version mismatches', async () => {
      const mockResponse = {
        results: [{
          extensions: [{
            publisher: { publisherName: 'pragmatic-rhino' },
            extensionName: 'pragmatic-rhino-suit',
            displayName: 'Test',
            versions: [{ version: '0.9.0' }]
          }]
        }]
      };
      setupHttpsRequest(200, JSON.stringify(mockResponse));

      const result = await verifyDeployment('pragmatic-rhino.pragmatic-rhino-suit', '1.0.0');

      expect(result.success).toBe(false);
      expect(result.info.version).toBe('0.9.0');
      expect(result.message).toContain('Version mismatch: expected 1.0.0, found 0.9.0');
    });

    it('should fail when version information is missing', async () => {
      const mockResponse = {
        results: [{
          extensions: [{
            publisher: { publisherName: 'pragmatic-rhino' },
            extensionName: 'pragmatic-rhino-suit',
            displayName: 'Test',
            versions: []
          }]
        }]
      };
      setupHttpsRequest(200, JSON.stringify(mockResponse));

      const result = await verifyDeployment('pragmatic-rhino.pragmatic-rhino-suit', '1.0.0');

      expect(result.success).toBe(false);
      expect(result.message).toContain('version information is missing');
    });

    it('should retry on marketplace unavailability', async () => {
      // First call fails, second succeeds
      let callCount = 0;
      mockHttpsRequest.mockImplementation((options, callback) => {
        callCount++;
        const mockReq = createMockRequest();
        
        if (callCount === 1) {
          // Simulate error on first call
          setImmediate(() => {
            mockReq.emit('error', new Error('Network timeout'));
          });
        } else {
          // Succeed on second call
          const mockResponse = {
            results: [{
              extensions: [{
                publisher: { publisherName: 'pragmatic-rhino' },
                extensionName: 'pragmatic-rhino-suit',
                displayName: 'Test',
                versions: [{ version: '1.0.0' }]
              }]
            }]
          };
          
          const mockRes = new EventEmitter();
          mockRes.statusCode = 200;
          callback(mockRes);
          setImmediate(() => {
            mockRes.emit('data', JSON.stringify(mockResponse));
            mockRes.emit('end');
          });
        }
        
        return mockReq;
      });

      const result = await verifyDeployment('pragmatic-rhino.pragmatic-rhino-suit', '1.0.0');

      expect(result.success).toBe(true);
      expect(mockHttpsRequest).toHaveBeenCalledTimes(2);
    });

    it('should fail after max retries', async () => {
      setupHttpsRequestError(new Error('Network error'));

      const result = await verifyDeployment('pragmatic-rhino.pragmatic-rhino-suit', '1.0.0');

      expect(result.success).toBe(false);
      expect(result.message).toContain(`Verification failed after ${MAX_RETRIES} attempts`);
      expect(mockHttpsRequest).toHaveBeenCalledTimes(MAX_RETRIES + 1); // Initial + retries
    });

    it('should retry when extension not found initially', async () => {
      let callCount = 0;
      mockHttpsRequest.mockImplementation((options, callback) => {
        callCount++;
        const mockReq = createMockRequest();
        
        const mockResponse = callCount === 1
          ? { results: [] } // Not found on first call
          : { // Found on second call
              results: [{
                extensions: [{
                  publisher: { publisherName: 'pragmatic-rhino' },
                  extensionName: 'pragmatic-rhino-suit',
                  displayName: 'Test',
                  versions: [{ version: '1.0.0' }]
                }]
              }]
            };
        
        const mockRes = new EventEmitter();
        mockRes.statusCode = 200;
        callback(mockRes);
        setImmediate(() => {
          mockRes.emit('data', JSON.stringify(mockResponse));
          mockRes.emit('end');
        });
        
        return mockReq;
      });

      const result = await verifyDeployment('pragmatic-rhino.pragmatic-rhino-suit', '1.0.0');

      expect(result.success).toBe(true);
      expect(mockHttpsRequest).toHaveBeenCalledTimes(2);
    });

    it('should retry when version mismatches initially', async () => {
      let callCount = 0;
      mockHttpsRequest.mockImplementation((options, callback) => {
        callCount++;
        const mockReq = createMockRequest();
        
        const version = callCount === 1 ? '0.9.0' : '1.0.0';
        const mockResponse = {
          results: [{
            extensions: [{
              publisher: { publisherName: 'pragmatic-rhino' },
              extensionName: 'pragmatic-rhino-suit',
              displayName: 'Test',
              versions: [{ version }]
            }]
          }]
        };
        
        const mockRes = new EventEmitter();
        mockRes.statusCode = 200;
        callback(mockRes);
        setImmediate(() => {
          mockRes.emit('data', JSON.stringify(mockResponse));
          mockRes.emit('end');
        });
        
        return mockReq;
      });

      const result = await verifyDeployment('pragmatic-rhino.pragmatic-rhino-suit', '1.0.0');

      expect(result.success).toBe(true);
      expect(mockHttpsRequest).toHaveBeenCalledTimes(2);
    });
  });

  describe('formatDate', () => {
    
    it('should format valid ISO date string', () => {
      const result = formatDate('2024-01-15T10:30:00Z');
      expect(result).toBe('2024-01-15');
    });

    it('should format date with milliseconds', () => {
      const result = formatDate('2024-01-15T10:30:00.123Z');
      expect(result).toBe('2024-01-15');
    });

    it('should return N/A for null', () => {
      const result = formatDate(null);
      expect(result).toBe('N/A');
    });

    it('should return N/A for undefined', () => {
      const result = formatDate(undefined);
      expect(result).toBe('N/A');
    });

    it('should return N/A for empty string', () => {
      const result = formatDate('');
      expect(result).toBe('N/A');
    });

    it('should return original string for invalid date', () => {
      const result = formatDate('invalid-date');
      expect(result).toBe('invalid-date');
    });

    it('should handle different date formats', () => {
      const result = formatDate('2024-12-31T23:59:59Z');
      expect(result).toBe('2024-12-31');
    });
  });

  describe('formatNumber', () => {
    
    it('should format number with commas', () => {
      const result = formatNumber(1000);
      expect(result).toBe('1,000');
    });

    it('should format large numbers', () => {
      const result = formatNumber(1234567);
      expect(result).toBe('1,234,567');
    });

    it('should format zero', () => {
      const result = formatNumber(0);
      expect(result).toBe('0');
    });

    it('should format single digit', () => {
      const result = formatNumber(5);
      expect(result).toBe('5');
    });

    it('should return 0 for non-number', () => {
      const result = formatNumber('not a number');
      expect(result).toBe('0');
    });

    it('should return 0 for null', () => {
      const result = formatNumber(null);
      expect(result).toBe('0');
    });

    it('should return 0 for undefined', () => {
      const result = formatNumber(undefined);
      expect(result).toBe('0');
    });

    it('should format decimal numbers', () => {
      const result = formatNumber(1234.56);
      expect(result).toBe('1,234.56');
    });
  });

  describe('constants', () => {
    
    it('should have correct MAX_RETRIES value', () => {
      expect(MAX_RETRIES).toBe(3);
    });

    it('should have correct RETRY_DELAY_MS value', () => {
      expect(RETRY_DELAY_MS).toBe(2000);
    });
  });
});

// Helper functions for mocking

function createMockRequest() {
  const mockReq = new EventEmitter();
  mockReq.write = jest.fn();
  mockReq.end = jest.fn();
  return mockReq;
}

function createMockResponse(statusCode, data) {
  const mockRes = new EventEmitter();
  mockRes.statusCode = statusCode;
  
  // Simulate data emission synchronously in next tick
  setImmediate(() => {
    mockRes.emit('data', data);
    mockRes.emit('end');
  });
  
  return mockRes;
}

function setupHttpsRequest(statusCode, responseData) {
  const mockReq = createMockRequest();
  
  mockHttpsRequest.mockImplementation((options, callback) => {
    const mockRes = new EventEmitter();
    mockRes.statusCode = statusCode;
    
    // Call callback immediately
    callback(mockRes);
    
    // Emit data after callback
    setImmediate(() => {
      mockRes.emit('data', responseData);
      mockRes.emit('end');
    });
    
    return mockReq;
  });
  
  return mockReq;
}

function setupHttpsRequestError(error) {
  const mockReq = createMockRequest();
  
  mockHttpsRequest.mockImplementation(() => {
    // Emit error after returning the request object
    setImmediate(() => {
      mockReq.emit('error', error);
    });
    return mockReq;
  });
  
  return mockReq;
}
