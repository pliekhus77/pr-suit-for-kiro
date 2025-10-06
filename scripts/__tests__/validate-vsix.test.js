/* eslint-env node, jest */
/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * Unit tests for VSIX validation script
 * 
 * Tests all validation functions with mocked file system operations
 * to ensure proper validation of VSIX packages without requiring
 * actual VSIX files.
 */

// Create manual mocks
const mockFs = {
  existsSync: jest.fn(),
  statSync: jest.fn(),
  readFileSync: jest.fn(),
  mkdirSync: jest.fn(),
  rmSync: jest.fn()
};

const mockExecSync = jest.fn();

// Mock the modules before requiring the module under test
jest.mock('fs', () => mockFs);
jest.mock('child_process', () => ({
  execSync: mockExecSync
}));

// Import functions to test
const {
  fileExists,
  getFileSize,
  formatBytes,
  validateFileSize,
  listVsixContents,
  validateVsixStructure,
  extractPackageJson,
  validateManifestVersion,
  MAX_VSIX_SIZE_BYTES,
  REQUIRED_FILES
} = require('../validate-vsix');

describe('VSIX Validation Script', () => {
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('fileExists', () => {
    it('should return true when file exists', () => {
      mockFs.existsSync.mockReturnValue(true);
      
      const result = fileExists('/path/to/file.vsix');
      
      expect(result).toBe(true);
      expect(mockFs.existsSync).toHaveBeenCalledWith('/path/to/file.vsix');
    });

    it('should return false when file does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);
      
      const result = fileExists('/path/to/missing.vsix');
      
      expect(result).toBe(false);
    });

    it('should return false when fs.existsSync throws error', () => {
      mockFs.existsSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });
      
      const result = fileExists('/path/to/file.vsix');
      
      expect(result).toBe(false);
    });
  });

  describe('getFileSize', () => {
    it('should return file size in bytes', () => {
      const mockStats = { size: 1024000 };
      mockFs.statSync.mockReturnValue(mockStats);
      
      const result = getFileSize('/path/to/file.vsix');
      
      expect(result).toBe(1024000);
      expect(mockFs.statSync).toHaveBeenCalledWith('/path/to/file.vsix');
    });

    it('should throw error when fs.statSync fails', () => {
      mockFs.statSync.mockImplementation(() => {
        throw new Error('File not found');
      });
      
      expect(() => getFileSize('/path/to/missing.vsix')).toThrow('Failed to get file size');
    });
  });

  describe('formatBytes', () => {
    it('should format 0 bytes', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
    });

    it('should format bytes', () => {
      expect(formatBytes(500)).toBe('500 Bytes');
    });

    it('should format kilobytes', () => {
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(2048)).toBe('2 KB');
    });

    it('should format megabytes', () => {
      expect(formatBytes(1048576)).toBe('1 MB');
      expect(formatBytes(5242880)).toBe('5 MB');
    });

    it('should format gigabytes', () => {
      expect(formatBytes(1073741824)).toBe('1 GB');
    });

    it('should format with decimals', () => {
      expect(formatBytes(1536)).toBe('1.5 KB');
      expect(formatBytes(1572864)).toBe('1.5 MB');
    });
  });

  describe('validateFileSize', () => {
    it('should pass validation for file within size limit', () => {
      const mockStats = { size: 10485760 }; // 10 MB
      mockFs.statSync.mockReturnValue(mockStats);
      
      const result = validateFileSize('/path/to/file.vsix');
      
      expect(result.valid).toBe(true);
      expect(result.size).toBe(10485760);
      expect(result.message).toContain('10 MB');
      expect(result.message).toContain('within');
    });

    it('should fail validation for file exceeding size limit', () => {
      const mockStats = { size: MAX_VSIX_SIZE_BYTES + 1 };
      mockFs.statSync.mockReturnValue(mockStats);
      
      const result = validateFileSize('/path/to/large.vsix');
      
      expect(result.valid).toBe(false);
      expect(result.size).toBe(MAX_VSIX_SIZE_BYTES + 1);
      expect(result.message).toContain('exceeds maximum allowed size');
    });

    it('should pass validation for file exactly at size limit', () => {
      const mockStats = { size: MAX_VSIX_SIZE_BYTES };
      mockFs.statSync.mockReturnValue(mockStats);
      
      const result = validateFileSize('/path/to/file.vsix');
      
      expect(result.valid).toBe(true);
      expect(result.size).toBe(MAX_VSIX_SIZE_BYTES);
    });
  });

  describe('listVsixContents', () => {
    const originalPlatform = process.platform;

    afterEach(() => {
      // Restore original platform
      Object.defineProperty(process, 'platform', {
        value: originalPlatform,
        configurable: true
      });
    });

    it('should list contents on Unix-like systems', () => {
      Object.defineProperty(process, 'platform', {
        value: 'linux',
        configurable: true
      });

      const mockOutput = `Archive:  test.vsix
  Length      Date    Time    Name
---------  ---------- -----   ----
      256  2024-01-01 12:00   extension.vsixmanifest
     1024  2024-01-01 12:00   extension/package.json
     2048  2024-01-01 12:00   extension/extension.js
---------                     -------
     3328                     3 files`;

      mockExecSync.mockReturnValue(mockOutput);
      
      const result = listVsixContents('/path/to/file.vsix');
      
      expect(result).toEqual([
        'extension.vsixmanifest',
        'extension/package.json',
        'extension/extension.js'
      ]);
      expect(mockExecSync).toHaveBeenCalledWith(
        'unzip -l "/path/to/file.vsix"',
        { encoding: 'utf8' }
      );
    });

    it('should list contents on Windows', () => {
      Object.defineProperty(process, 'platform', {
        value: 'win32',
        configurable: true
      });

      const mockOutput = `extension.vsixmanifest
extension/package.json
extension/extension.js`;

      mockExecSync.mockReturnValue(mockOutput);
      
      const result = listVsixContents('/path/to/file.vsix');
      
      expect(result).toEqual([
        'extension.vsixmanifest',
        'extension/package.json',
        'extension/extension.js'
      ]);
    });

    it('should throw error when unzip command fails', () => {
      Object.defineProperty(process, 'platform', {
        value: 'linux',
        configurable: true
      });

      mockExecSync.mockImplementation(() => {
        throw new Error('unzip not found');
      });
      
      expect(() => listVsixContents('/path/to/file.vsix')).toThrow('Failed to list VSIX contents');
    });
  });

  describe('validateVsixStructure', () => {
    it('should pass validation when all required files are present', () => {
      const mockContents = [
        'extension.vsixmanifest',
        'extension/package.json',
        'extension/extension.js',
        'extension/README.md'
      ];

      mockExecSync.mockReturnValue(mockContents.map((f, i) => 
        `     ${1024}  2024-01-01 12:00   ${f}`
      ).join('\n'));
      
      const result = validateVsixStructure('/path/to/file.vsix');
      
      expect(result.valid).toBe(true);
      expect(result.missingFiles).toEqual([]);
      expect(result.message).toContain('VSIX structure is valid');
      expect(result.message).toContain('4 files found');
    });

    it('should fail validation when required files are missing', () => {
      const mockContents = [
        'extension/extension.js',
        'extension/README.md'
      ];

      mockExecSync.mockReturnValue(mockContents.map((f, i) => 
        `     ${1024}  2024-01-01 12:00   ${f}`
      ).join('\n'));
      
      const result = validateVsixStructure('/path/to/file.vsix');
      
      expect(result.valid).toBe(false);
      expect(result.missingFiles).toEqual(REQUIRED_FILES);
      expect(result.message).toContain('missing required files');
    });

    it('should fail validation when only some required files are missing', () => {
      const mockContents = [
        'extension.vsixmanifest',
        'extension/extension.js'
      ];

      mockExecSync.mockReturnValue(mockContents.map((f, i) => 
        `     ${1024}  2024-01-01 12:00   ${f}`
      ).join('\n'));
      
      const result = validateVsixStructure('/path/to/file.vsix');
      
      expect(result.valid).toBe(false);
      expect(result.missingFiles).toContain('extension/package.json');
      expect(result.message).toContain('missing required files');
    });

    it('should handle errors when listing contents fails', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Command failed');
      });
      
      const result = validateVsixStructure('/path/to/file.vsix');
      
      expect(result.valid).toBe(false);
      expect(result.missingFiles).toEqual(REQUIRED_FILES);
      expect(result.message).toContain('Failed to validate VSIX structure');
    });
  });

  describe('extractPackageJson', () => {
    const originalPlatform = process.platform;

    afterEach(() => {
      Object.defineProperty(process, 'platform', {
        value: originalPlatform,
        configurable: true
      });
    });

    it('should extract package.json on Unix-like systems', () => {
      Object.defineProperty(process, 'platform', {
        value: 'linux',
        configurable: true
      });

      const mockPackageJson = {
        name: 'test-extension',
        version: '1.0.0',
        description: 'Test extension'
      };

      mockExecSync.mockReturnValue(JSON.stringify(mockPackageJson));
      
      const result = extractPackageJson('/path/to/file.vsix');
      
      expect(result).toEqual(mockPackageJson);
      expect(mockExecSync).toHaveBeenCalledWith(
        'unzip -p "/path/to/file.vsix" "extension/package.json"',
        { encoding: 'utf8' }
      );
    });

    it('should return null when extraction fails', () => {
      Object.defineProperty(process, 'platform', {
        value: 'linux',
        configurable: true
      });

      mockExecSync.mockImplementation(() => {
        throw new Error('Extraction failed');
      });
      
      const result = extractPackageJson('/path/to/file.vsix');
      
      expect(result).toBeNull();
    });

    it('should return null when package.json is invalid JSON', () => {
      Object.defineProperty(process, 'platform', {
        value: 'linux',
        configurable: true
      });

      mockExecSync.mockReturnValue('{ invalid json }');
      
      const result = extractPackageJson('/path/to/file.vsix');
      
      expect(result).toBeNull();
    });
  });

  describe('validateManifestVersion', () => {
    const originalPlatform = process.platform;

    beforeEach(() => {
      // Force Linux platform for consistent testing
      Object.defineProperty(process, 'platform', {
        value: 'linux',
        configurable: true
      });
    });

    afterEach(() => {
      Object.defineProperty(process, 'platform', {
        value: originalPlatform,
        configurable: true
      });
    });

    it('should pass validation when versions match', () => {
      const mockPackageJson = {
        name: 'test-extension',
        version: '1.0.0'
      };

      mockExecSync.mockReturnValue(JSON.stringify(mockPackageJson));
      
      const result = validateManifestVersion('/path/to/file.vsix', '1.0.0');
      
      expect(result.valid).toBe(true);
      expect(result.actualVersion).toBe('1.0.0');
      expect(result.message).toContain('Version matches: 1.0.0');
    });

    it('should fail validation when versions do not match', () => {
      const mockPackageJson = {
        name: 'test-extension',
        version: '1.0.0'
      };

      mockExecSync.mockReturnValue(JSON.stringify(mockPackageJson));
      
      const result = validateManifestVersion('/path/to/file.vsix', '2.0.0');
      
      expect(result.valid).toBe(false);
      expect(result.actualVersion).toBe('1.0.0');
      expect(result.message).toContain('Version mismatch');
      expect(result.message).toContain('expected 2.0.0');
      expect(result.message).toContain('found 1.0.0');
    });

    it('should pass validation when no expected version is provided', () => {
      const mockPackageJson = {
        name: 'test-extension',
        version: '1.0.0'
      };

      mockExecSync.mockReturnValue(JSON.stringify(mockPackageJson));
      
      const result = validateManifestVersion('/path/to/file.vsix', null);
      
      expect(result.valid).toBe(true);
      expect(result.actualVersion).toBe('1.0.0');
      expect(result.message).toContain('Version found: 1.0.0');
    });

    it('should fail validation when package.json extraction fails', () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Extraction failed');
      });
      
      const result = validateManifestVersion('/path/to/file.vsix', '1.0.0');
      
      expect(result.valid).toBe(false);
      expect(result.actualVersion).toBeNull();
      expect(result.message).toContain('Failed to extract package.json');
    });

    it('should fail validation when version is missing from package.json', () => {
      const mockPackageJson = {
        name: 'test-extension'
        // version is missing
      };

      mockExecSync.mockReturnValue(JSON.stringify(mockPackageJson));
      
      const result = validateManifestVersion('/path/to/file.vsix', '1.0.0');
      
      expect(result.valid).toBe(false);
      expect(result.actualVersion).toBeNull();
      expect(result.message).toContain('No version found in package.json');
    });

    it('should handle semantic versioning with pre-release tags', () => {
      const mockPackageJson = {
        name: 'test-extension',
        version: '1.0.0-beta.1'
      };

      mockExecSync.mockReturnValue(JSON.stringify(mockPackageJson));
      
      const result = validateManifestVersion('/path/to/file.vsix', '1.0.0-beta.1');
      
      expect(result.valid).toBe(true);
      expect(result.actualVersion).toBe('1.0.0-beta.1');
    });

    it('should handle semantic versioning with build metadata', () => {
      const mockPackageJson = {
        name: 'test-extension',
        version: '1.0.0+20240101'
      };

      mockExecSync.mockReturnValue(JSON.stringify(mockPackageJson));
      
      const result = validateManifestVersion('/path/to/file.vsix', '1.0.0+20240101');
      
      expect(result.valid).toBe(true);
      expect(result.actualVersion).toBe('1.0.0+20240101');
    });
  });

  describe('Edge cases', () => {
    const originalPlatform = process.platform;

    beforeEach(() => {
      // Force Linux platform for consistent testing
      Object.defineProperty(process, 'platform', {
        value: 'linux',
        configurable: true
      });
    });

    afterEach(() => {
      Object.defineProperty(process, 'platform', {
        value: originalPlatform,
        configurable: true
      });
    });

    it('should handle empty VSIX file', () => {
      mockFs.statSync.mockReturnValue({ size: 0 });
      
      const result = validateFileSize('/path/to/empty.vsix');
      
      expect(result.valid).toBe(true);
      expect(result.message).toContain('0 Bytes');
    });

    it('should handle VSIX with no files', () => {
      mockExecSync.mockReturnValue('Archive:  empty.vsix\n  Length      Date    Time    Name\n---------  ---------- -----   ----\n---------                     -------\n        0                     0 files');
      
      const result = validateVsixStructure('/path/to/empty.vsix');
      
      expect(result.valid).toBe(false);
      expect(result.missingFiles).toEqual(REQUIRED_FILES);
    });

    it('should handle package.json with extra fields', () => {
      const mockPackageJson = {
        name: 'test-extension',
        version: '1.0.0',
        description: 'Test',
        author: 'Test Author',
        license: 'MIT',
        engines: {
          vscode: '^1.85.0'
        }
      };

      mockExecSync.mockReturnValue(JSON.stringify(mockPackageJson));
      
      const result = validateManifestVersion('/path/to/file.vsix', '1.0.0');
      
      expect(result.valid).toBe(true);
      expect(result.actualVersion).toBe('1.0.0');
    });
  });
});
