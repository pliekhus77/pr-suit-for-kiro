/* eslint-env jest, node */
/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * Unit tests for update-version.js
 * 
 * Tests version update logic including:
 * - Semantic version validation
 * - JSON file reading/writing
 * - package.json updates
 * - package-lock.json updates
 * - Error handling
 */

// Mock fs module before requiring the module under test
jest.mock('fs');

const fs = require('fs');
const path = require('path');
const {
  isValidSemanticVersion,
  readJsonFile,
  writeJsonFile,
  updatePackageJson,
  updatePackageLock
} = require('../update-version');

describe('update-version', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isValidSemanticVersion', () => {
    it('should validate standard semantic versions', () => {
      expect(isValidSemanticVersion('1.0.0')).toBe(true);
      expect(isValidSemanticVersion('0.0.1')).toBe(true);
      expect(isValidSemanticVersion('10.20.30')).toBe(true);
      expect(isValidSemanticVersion('999.999.999')).toBe(true);
    });

    it('should validate pre-release versions', () => {
      expect(isValidSemanticVersion('1.0.0-alpha')).toBe(true);
      expect(isValidSemanticVersion('1.0.0-alpha.1')).toBe(true);
      expect(isValidSemanticVersion('1.0.0-beta.2')).toBe(true);
      expect(isValidSemanticVersion('1.0.0-rc.1')).toBe(true);
      expect(isValidSemanticVersion('1.0.0-0.3.7')).toBe(true);
    });

    it('should validate versions with build metadata', () => {
      expect(isValidSemanticVersion('1.0.0+build.1')).toBe(true);
      expect(isValidSemanticVersion('1.0.0+20130313144700')).toBe(true);
      expect(isValidSemanticVersion('1.0.0-beta+exp.sha.5114f85')).toBe(true);
    });

    it('should reject invalid version formats', () => {
      expect(isValidSemanticVersion('1')).toBe(false);
      expect(isValidSemanticVersion('1.0')).toBe(false);
      expect(isValidSemanticVersion('v1.0.0')).toBe(false);
      expect(isValidSemanticVersion('1.0.0.0')).toBe(false);
      expect(isValidSemanticVersion('01.0.0')).toBe(false); // Leading zeros
      expect(isValidSemanticVersion('1.0.0-')).toBe(false); // Trailing dash
      expect(isValidSemanticVersion('1.0.0+')).toBe(false); // Trailing plus
      expect(isValidSemanticVersion('')).toBe(false);
      expect(isValidSemanticVersion('invalid')).toBe(false);
    });
  });

  describe('readJsonFile', () => {
    it('should read and parse valid JSON file', () => {
      const mockData = { name: 'test', version: '1.0.0' };
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(mockData));

      const result = readJsonFile('/path/to/file.json');

      expect(result).toEqual(mockData);
      expect(fs.existsSync).toHaveBeenCalledWith('/path/to/file.json');
      expect(fs.readFileSync).toHaveBeenCalledWith('/path/to/file.json', 'utf8');
    });

    it('should throw error if file does not exist', () => {
      fs.existsSync.mockReturnValue(false);

      expect(() => readJsonFile('/nonexistent/file.json'))
        .toThrow('File not found: /nonexistent/file.json');
    });

    it('should throw error if JSON is invalid', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('{ invalid json }');

      expect(() => readJsonFile('/path/to/invalid.json'))
        .toThrow(/Failed to parse JSON/);
    });
  });

  describe('writeJsonFile', () => {
    it('should write JSON with proper formatting', () => {
      const mockData = { name: 'test', version: '1.0.0' };
      fs.writeFileSync.mockImplementation(() => {});

      writeJsonFile('/path/to/file.json', mockData);

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        '/path/to/file.json',
        JSON.stringify(mockData, null, 2) + '\n',
        'utf8'
      );
    });

    it('should write JSON with custom indentation', () => {
      const mockData = { name: 'test' };
      fs.writeFileSync.mockImplementation(() => {});

      writeJsonFile('/path/to/file.json', mockData, 4);

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        '/path/to/file.json',
        JSON.stringify(mockData, null, 4) + '\n',
        'utf8'
      );
    });

    it('should throw error if write fails', () => {
      const mockData = { name: 'test' };
      fs.writeFileSync.mockImplementation(() => {
        throw new Error('Write failed');
      });

      expect(() => writeJsonFile('/path/to/file.json', mockData))
        .toThrow(/Failed to write JSON/);
    });
  });

  describe('updatePackageJson', () => {
    it('should update package.json version', () => {
      const mockPackageJson = {
        name: 'test-package',
        version: '1.0.0',
        description: 'Test package'
      };

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));
      fs.writeFileSync.mockImplementation(() => {});

      const result = updatePackageJson('/path/to/package.json', '1.1.0');

      expect(result).toEqual({
        oldVersion: '1.0.0',
        newVersion: '1.1.0'
      });

      // Verify the updated content
      const writeCall = fs.writeFileSync.mock.calls[0];
      const writtenContent = JSON.parse(writeCall[1]);
      expect(writtenContent.version).toBe('1.1.0');
      expect(writtenContent.name).toBe('test-package');
    });

    it('should throw error if package.json has no version field', () => {
      const mockPackageJson = {
        name: 'test-package',
        description: 'Test package'
      };

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      expect(() => updatePackageJson('/path/to/package.json', '1.0.0'))
        .toThrow('package.json does not contain a version field');
    });

    it('should preserve other package.json fields', () => {
      const mockPackageJson = {
        name: 'test-package',
        version: '1.0.0',
        description: 'Test package',
        author: 'Test Author',
        dependencies: {
          'some-dep': '^1.0.0'
        }
      };

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));
      fs.writeFileSync.mockImplementation(() => {});

      updatePackageJson('/path/to/package.json', '2.0.0');

      const writeCall = fs.writeFileSync.mock.calls[0];
      const writtenContent = JSON.parse(writeCall[1]);
      expect(writtenContent.name).toBe('test-package');
      expect(writtenContent.description).toBe('Test package');
      expect(writtenContent.author).toBe('Test Author');
      expect(writtenContent.dependencies).toEqual({ 'some-dep': '^1.0.0' });
    });
  });

  describe('updatePackageLock', () => {
    it('should update package-lock.json version (npm v7+ format)', () => {
      const mockPackageLock = {
        name: 'test-package',
        version: '1.0.0',
        lockfileVersion: 2,
        packages: {
          '': {
            name: 'test-package',
            version: '1.0.0'
          }
        }
      };

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageLock));
      fs.writeFileSync.mockImplementation(() => {});

      // Suppress console.log for cleaner test output
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      updatePackageLock('/path/to/package-lock.json', '1.1.0', 'test-package');

      const writeCall = fs.writeFileSync.mock.calls[0];
      const writtenContent = JSON.parse(writeCall[1]);
      expect(writtenContent.version).toBe('1.1.0');
      expect(writtenContent.packages[''].version).toBe('1.1.0');

      consoleSpy.mockRestore();
    });

    it('should update package-lock.json with named package entry', () => {
      const mockPackageLock = {
        name: 'test-package',
        version: '1.0.0',
        lockfileVersion: 2,
        packages: {
          '': {
            name: 'test-package',
            version: '1.0.0'
          },
          'test-package': {
            version: '1.0.0'
          }
        }
      };

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageLock));
      fs.writeFileSync.mockImplementation(() => {});

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      updatePackageLock('/path/to/package-lock.json', '2.0.0', 'test-package');

      const writeCall = fs.writeFileSync.mock.calls[0];
      const writtenContent = JSON.parse(writeCall[1]);
      expect(writtenContent.version).toBe('2.0.0');
      expect(writtenContent.packages[''].version).toBe('2.0.0');
      expect(writtenContent.packages['test-package'].version).toBe('2.0.0');

      consoleSpy.mockRestore();
    });

    it('should skip update if package-lock.json does not exist', () => {
      fs.existsSync.mockReturnValue(false);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      updatePackageLock('/path/to/package-lock.json', '1.1.0', 'test-package');

      expect(fs.readFileSync).not.toHaveBeenCalled();
      expect(fs.writeFileSync).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Warning: package-lock.json not found')
      );

      consoleSpy.mockRestore();
    });

    it('should handle package-lock.json without packages field', () => {
      const mockPackageLock = {
        name: 'test-package',
        version: '1.0.0',
        lockfileVersion: 1
      };

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageLock));
      fs.writeFileSync.mockImplementation(() => {});

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      updatePackageLock('/path/to/package-lock.json', '1.1.0', 'test-package');

      const writeCall = fs.writeFileSync.mock.calls[0];
      const writtenContent = JSON.parse(writeCall[1]);
      expect(writtenContent.version).toBe('1.1.0');

      consoleSpy.mockRestore();
    });

    it('should preserve other package-lock.json fields', () => {
      const mockPackageLock = {
        name: 'test-package',
        version: '1.0.0',
        lockfileVersion: 2,
        requires: true,
        packages: {
          '': {
            name: 'test-package',
            version: '1.0.0',
            dependencies: {
              'some-dep': '^1.0.0'
            }
          }
        },
        dependencies: {
          'some-dep': {
            version: '1.0.0'
          }
        }
      };

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(mockPackageLock));
      fs.writeFileSync.mockImplementation(() => {});

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      updatePackageLock('/path/to/package-lock.json', '2.0.0', 'test-package');

      const writeCall = fs.writeFileSync.mock.calls[0];
      const writtenContent = JSON.parse(writeCall[1]);
      expect(writtenContent.lockfileVersion).toBe(2);
      expect(writtenContent.requires).toBe(true);
      expect(writtenContent.dependencies).toEqual({
        'some-dep': { version: '1.0.0' }
      });

      consoleSpy.mockRestore();
    });
  });
});
