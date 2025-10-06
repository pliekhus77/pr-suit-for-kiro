/* eslint-env jest, node */
/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * Unit tests for version validation script
 * 
 * Tests cover:
 * - Valid semantic version detection
 * - Invalid version format detection
 * - Version increment validation (major, minor, patch)
 * - Edge cases (pre-release versions, build metadata)
 */

const {
  isValidSemVer,
  parseSemVer,
  compareVersions,
  validateIncrement
} = require('../validate-version');

describe('isValidSemVer', () => {
  describe('valid semantic versions', () => {
    test('should accept basic semantic version', () => {
      expect(isValidSemVer('1.0.0')).toBe(true);
      expect(isValidSemVer('0.0.1')).toBe(true);
      expect(isValidSemVer('10.20.30')).toBe(true);
    });

    test('should accept version with pre-release', () => {
      expect(isValidSemVer('1.0.0-alpha')).toBe(true);
      expect(isValidSemVer('1.0.0-alpha.1')).toBe(true);
      expect(isValidSemVer('1.0.0-0.3.7')).toBe(true);
      expect(isValidSemVer('1.0.0-x.7.z.92')).toBe(true);
      expect(isValidSemVer('1.0.0-beta.11')).toBe(true);
      expect(isValidSemVer('1.0.0-rc.1')).toBe(true);
    });

    test('should accept version with build metadata', () => {
      expect(isValidSemVer('1.0.0+20130313144700')).toBe(true);
      expect(isValidSemVer('1.0.0+exp.sha.5114f85')).toBe(true);
      expect(isValidSemVer('1.0.0+21AF26D3-117B344092BD')).toBe(true);
    });

    test('should accept version with pre-release and build metadata', () => {
      expect(isValidSemVer('1.0.0-alpha+001')).toBe(true);
      expect(isValidSemVer('1.0.0-beta.1+exp.sha.5114f85')).toBe(true);
      expect(isValidSemVer('1.0.0-rc.1+20130313144700')).toBe(true);
    });

    test('should accept version starting with zero', () => {
      expect(isValidSemVer('0.0.0')).toBe(true);
      expect(isValidSemVer('0.1.0')).toBe(true);
      expect(isValidSemVer('0.0.1')).toBe(true);
    });
  });

  describe('invalid semantic versions', () => {
    test('should reject version with leading zeros', () => {
      expect(isValidSemVer('01.0.0')).toBe(false);
      expect(isValidSemVer('1.01.0')).toBe(false);
      expect(isValidSemVer('1.0.01')).toBe(false);
    });

    test('should reject version with missing components', () => {
      expect(isValidSemVer('1.0')).toBe(false);
      expect(isValidSemVer('1')).toBe(false);
      expect(isValidSemVer('')).toBe(false);
    });

    test('should reject version with extra components', () => {
      expect(isValidSemVer('1.0.0.0')).toBe(false);
      expect(isValidSemVer('1.2.3.4')).toBe(false);
    });

    test('should reject version with invalid characters', () => {
      expect(isValidSemVer('1.0.0a')).toBe(false);
      expect(isValidSemVer('a.b.c')).toBe(false);
      expect(isValidSemVer('1.0.0-')).toBe(false);
      expect(isValidSemVer('1.0.0+')).toBe(false);
    });

    test('should reject version with spaces', () => {
      expect(isValidSemVer('1.0.0 ')).toBe(false);
      expect(isValidSemVer(' 1.0.0')).toBe(false);
      expect(isValidSemVer('1. 0.0')).toBe(false);
    });

    test('should reject version with v prefix', () => {
      expect(isValidSemVer('v1.0.0')).toBe(false);
      expect(isValidSemVer('V1.0.0')).toBe(false);
    });

    test('should reject negative numbers', () => {
      expect(isValidSemVer('-1.0.0')).toBe(false);
      expect(isValidSemVer('1.-1.0')).toBe(false);
      expect(isValidSemVer('1.0.-1')).toBe(false);
    });
  });
});

describe('parseSemVer', () => {
  test('should parse basic semantic version', () => {
    const result = parseSemVer('1.2.3');
    expect(result).toEqual({
      major: 1,
      minor: 2,
      patch: 3,
      prerelease: null,
      build: null
    });
  });

  test('should parse version with pre-release', () => {
    const result = parseSemVer('1.2.3-alpha.1');
    expect(result).toEqual({
      major: 1,
      minor: 2,
      patch: 3,
      prerelease: 'alpha.1',
      build: null
    });
  });

  test('should parse version with build metadata', () => {
    const result = parseSemVer('1.2.3+20130313144700');
    expect(result).toEqual({
      major: 1,
      minor: 2,
      patch: 3,
      prerelease: null,
      build: '20130313144700'
    });
  });

  test('should parse version with pre-release and build metadata', () => {
    const result = parseSemVer('1.2.3-beta.1+exp.sha.5114f85');
    expect(result).toEqual({
      major: 1,
      minor: 2,
      patch: 3,
      prerelease: 'beta.1',
      build: 'exp.sha.5114f85'
    });
  });

  test('should parse version with zero components', () => {
    const result = parseSemVer('0.0.0');
    expect(result).toEqual({
      major: 0,
      minor: 0,
      patch: 0,
      prerelease: null,
      build: null
    });
  });

  test('should throw error for invalid version', () => {
    expect(() => parseSemVer('invalid')).toThrow('Invalid semantic version');
    expect(() => parseSemVer('1.0')).toThrow('Invalid semantic version');
    expect(() => parseSemVer('1.0.0.0')).toThrow('Invalid semantic version');
  });
});

describe('compareVersions', () => {
  describe('major version comparison', () => {
    test('should return 1 when current major is greater', () => {
      expect(compareVersions('2.0.0', '1.0.0')).toBe(1);
      expect(compareVersions('10.0.0', '9.0.0')).toBe(1);
    });

    test('should return -1 when current major is less', () => {
      expect(compareVersions('1.0.0', '2.0.0')).toBe(-1);
      expect(compareVersions('9.0.0', '10.0.0')).toBe(-1);
    });
  });

  describe('minor version comparison', () => {
    test('should return 1 when current minor is greater', () => {
      expect(compareVersions('1.2.0', '1.1.0')).toBe(1);
      expect(compareVersions('1.10.0', '1.9.0')).toBe(1);
    });

    test('should return -1 when current minor is less', () => {
      expect(compareVersions('1.1.0', '1.2.0')).toBe(-1);
      expect(compareVersions('1.9.0', '1.10.0')).toBe(-1);
    });
  });

  describe('patch version comparison', () => {
    test('should return 1 when current patch is greater', () => {
      expect(compareVersions('1.0.2', '1.0.1')).toBe(1);
      expect(compareVersions('1.0.10', '1.0.9')).toBe(1);
    });

    test('should return -1 when current patch is less', () => {
      expect(compareVersions('1.0.1', '1.0.2')).toBe(-1);
      expect(compareVersions('1.0.9', '1.0.10')).toBe(-1);
    });
  });

  describe('equal versions', () => {
    test('should return 0 when versions are equal', () => {
      expect(compareVersions('1.0.0', '1.0.0')).toBe(0);
      expect(compareVersions('2.5.10', '2.5.10')).toBe(0);
    });
  });

  describe('pre-release version comparison', () => {
    test('should return -1 when current has pre-release and base does not', () => {
      expect(compareVersions('1.0.0-alpha', '1.0.0')).toBe(-1);
    });

    test('should return 1 when current does not have pre-release and base does', () => {
      expect(compareVersions('1.0.0', '1.0.0-alpha')).toBe(1);
    });

    test('should compare pre-release strings when both have pre-release', () => {
      expect(compareVersions('1.0.0-beta', '1.0.0-alpha')).toBe(1);
      expect(compareVersions('1.0.0-alpha', '1.0.0-beta')).toBe(-1);
      expect(compareVersions('1.0.0-alpha', '1.0.0-alpha')).toBe(0);
    });
  });

  describe('complex version comparison', () => {
    test('should prioritize major over minor and patch', () => {
      expect(compareVersions('2.0.0', '1.9.9')).toBe(1);
      expect(compareVersions('1.9.9', '2.0.0')).toBe(-1);
    });

    test('should prioritize minor over patch', () => {
      expect(compareVersions('1.2.0', '1.1.9')).toBe(1);
      expect(compareVersions('1.1.9', '1.2.0')).toBe(-1);
    });
  });
});

describe('validateIncrement', () => {
  describe('major version increment', () => {
    test('should accept valid major version bump', () => {
      const result = validateIncrement('2.0.0', '1.0.0');
      expect(result.valid).toBe(true);
      expect(result.message).toContain('incremented from 1.0.0 to 2.0.0');
    });

    test('should accept major bump from any minor/patch', () => {
      expect(validateIncrement('2.0.0', '1.5.3').valid).toBe(true);
      expect(validateIncrement('3.0.0', '2.9.99').valid).toBe(true);
    });

    test('should reject major bump without resetting minor and patch', () => {
      const result = validateIncrement('2.1.0', '1.0.0');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('should reset minor and patch to 0');
    });

    test('should reject major bump without resetting patch', () => {
      const result = validateIncrement('2.0.1', '1.0.0');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('should reset minor and patch to 0');
    });

    test('should reject major version jump by more than 1', () => {
      const result = validateIncrement('3.0.0', '1.0.0');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('jumped by 2');
      expect(result.message).toContain('Should increment by 1');
    });
  });

  describe('minor version increment', () => {
    test('should accept valid minor version bump', () => {
      const result = validateIncrement('1.1.0', '1.0.0');
      expect(result.valid).toBe(true);
      expect(result.message).toContain('incremented from 1.0.0 to 1.1.0');
    });

    test('should accept minor bump from any patch', () => {
      expect(validateIncrement('1.2.0', '1.1.5').valid).toBe(true);
      expect(validateIncrement('1.10.0', '1.9.99').valid).toBe(true);
    });

    test('should reject minor bump without resetting patch', () => {
      const result = validateIncrement('1.1.1', '1.0.0');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('should reset patch to 0');
    });

    test('should reject minor version jump by more than 1', () => {
      const result = validateIncrement('1.3.0', '1.1.0');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('jumped by 2');
      expect(result.message).toContain('Should increment by 1');
    });
  });

  describe('patch version increment', () => {
    test('should accept valid patch version bump', () => {
      const result = validateIncrement('1.0.1', '1.0.0');
      expect(result.valid).toBe(true);
      expect(result.message).toContain('incremented from 1.0.0 to 1.0.1');
    });

    test('should accept multiple patch bumps', () => {
      expect(validateIncrement('1.0.5', '1.0.4').valid).toBe(true);
      expect(validateIncrement('1.0.100', '1.0.99').valid).toBe(true);
    });

    test('should reject patch version jump by more than 1', () => {
      const result = validateIncrement('1.0.3', '1.0.1');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('jumped by 2');
      expect(result.message).toContain('Should increment by 1');
    });
  });

  describe('version decrement', () => {
    test('should reject version decrement', () => {
      const result = validateIncrement('1.0.0', '2.0.0');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('is less than base version');
    });

    test('should reject minor version decrement', () => {
      const result = validateIncrement('1.0.0', '1.1.0');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('is less than base version');
    });

    test('should reject patch version decrement', () => {
      const result = validateIncrement('1.0.0', '1.0.1');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('is less than base version');
    });
  });

  describe('no version change', () => {
    test('should reject when version is not incremented', () => {
      const result = validateIncrement('1.0.0', '1.0.0');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('is the same as base version');
      expect(result.message).toContain('must be incremented');
    });

    test('should reject when version is identical', () => {
      const result = validateIncrement('2.5.10', '2.5.10');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('is the same as base version');
    });
  });

  describe('edge cases with pre-release versions', () => {
    test('should handle pre-release to release bump', () => {
      const result = validateIncrement('1.0.0', '1.0.0-alpha');
      expect(result.valid).toBe(true);
    });

    test('should handle pre-release version increments', () => {
      const result = validateIncrement('1.0.0-beta', '1.0.0-alpha');
      expect(result.valid).toBe(true);
    });

    test('should reject release to pre-release downgrade', () => {
      const result = validateIncrement('1.0.0-alpha', '1.0.0');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('is less than base version');
    });
  });

  describe('edge cases with build metadata', () => {
    test('should ignore build metadata in comparison', () => {
      // Build metadata should not affect version precedence
      const result1 = validateIncrement('1.0.1', '1.0.0+build123');
      expect(result1.valid).toBe(true);
      
      const result2 = validateIncrement('1.0.0+build456', '1.0.0+build123');
      expect(result2.valid).toBe(false);
      expect(result2.message).toContain('is the same as base version');
    });
  });

  describe('zero version handling', () => {
    test('should handle initial version 0.0.0', () => {
      expect(validateIncrement('0.0.1', '0.0.0').valid).toBe(true);
      expect(validateIncrement('0.1.0', '0.0.0').valid).toBe(true);
      expect(validateIncrement('1.0.0', '0.0.0').valid).toBe(true);
    });

    test('should handle 0.x.x versions', () => {
      expect(validateIncrement('0.1.0', '0.0.1').valid).toBe(true);
      expect(validateIncrement('0.0.2', '0.0.1').valid).toBe(true);
    });
  });

  describe('large version numbers', () => {
    test('should handle large version numbers', () => {
      expect(validateIncrement('100.0.0', '99.0.0').valid).toBe(true);
      expect(validateIncrement('1.100.0', '1.99.0').valid).toBe(true);
      expect(validateIncrement('1.0.1000', '1.0.999').valid).toBe(true);
    });

    test('should reject large jumps in version numbers', () => {
      const result = validateIncrement('100.0.0', '98.0.0');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('jumped by 2');
    });
  });
});

describe('getVersionFromGit', () => {
  let getVersionFromGit;
  let mockExecSync;

  beforeEach(() => {
    // Clear module cache to allow fresh mocking
    jest.resetModules();
    
    // Mock child_process before requiring the module
    mockExecSync = jest.fn();
    jest.doMock('child_process', () => ({
      execSync: mockExecSync
    }));
    
    // Require the module with mocked dependencies
    const validateVersion = require('../validate-version');
    getVersionFromGit = validateVersion.getVersionFromGit;
  });

  afterEach(() => {
    jest.dontMock('child_process');
  });

  test('should return version from git reference', () => {
    const mockPackageJson = JSON.stringify({ version: '1.2.3' });
    mockExecSync.mockReturnValue(mockPackageJson);

    const result = getVersionFromGit('origin/main');

    expect(result).toBe('1.2.3');
    expect(mockExecSync).toHaveBeenCalledWith(
      'git show origin/main:package.json',
      { encoding: 'utf8' }
    );
  });

  test('should return version from tag reference', () => {
    const mockPackageJson = JSON.stringify({ version: '2.0.0' });
    mockExecSync.mockReturnValue(mockPackageJson);

    const result = getVersionFromGit('v2.0.0');

    expect(result).toBe('2.0.0');
    expect(mockExecSync).toHaveBeenCalledWith(
      'git show v2.0.0:package.json',
      { encoding: 'utf8' }
    );
  });

  test('should return version from commit hash', () => {
    const mockPackageJson = JSON.stringify({ version: '1.5.0' });
    mockExecSync.mockReturnValue(mockPackageJson);

    const result = getVersionFromGit('abc123def');

    expect(result).toBe('1.5.0');
    expect(mockExecSync).toHaveBeenCalledWith(
      'git show abc123def:package.json',
      { encoding: 'utf8' }
    );
  });

  test('should return null when git command fails', () => {
    mockExecSync.mockImplementation(() => {
      throw new Error('fatal: invalid reference');
    });

    const result = getVersionFromGit('invalid-ref');

    expect(result).toBeNull();
  });

  test('should return null when package.json is not found', () => {
    mockExecSync.mockImplementation(() => {
      throw new Error('fatal: path not found');
    });

    const result = getVersionFromGit('origin/main');

    expect(result).toBeNull();
  });

  test('should return null when package.json is invalid JSON', () => {
    mockExecSync.mockReturnValue('invalid json {');

    const result = getVersionFromGit('origin/main');

    expect(result).toBeNull();
  });

  test('should handle package.json without version field', () => {
    const mockPackageJson = JSON.stringify({ name: 'test-package' });
    mockExecSync.mockReturnValue(mockPackageJson);

    const result = getVersionFromGit('origin/main');

    expect(result).toBeUndefined();
  });

  test('should handle empty package.json', () => {
    mockExecSync.mockReturnValue('{}');

    const result = getVersionFromGit('origin/main');

    expect(result).toBeUndefined();
  });
});
