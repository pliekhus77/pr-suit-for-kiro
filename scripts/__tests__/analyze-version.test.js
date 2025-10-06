/* eslint-env jest, node */
/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * Unit tests for version analysis script
 * 
 * Tests cover:
 * - Major version bump detection (BREAKING CHANGE)
 * - Minor version bump detection (feat:)
 * - Patch version bump detection (fix:, chore:)
 * - Edge cases (multiple commit types, no conventional commits)
 */

const {
  parseConventionalCommit,
  getVersionBumpType,
  analyzeCommits,
  calculateNextVersion
} = require('../analyze-version');

describe('parseConventionalCommit', () => {
  describe('valid conventional commits', () => {
    test('should parse basic feat commit', () => {
      const result = parseConventionalCommit('feat: add new feature');
      expect(result).toEqual({
        type: 'feat',
        scope: null,
        breaking: false,
        description: 'add new feature'
      });
    });

    test('should parse fix commit', () => {
      const result = parseConventionalCommit('fix: resolve bug');
      expect(result).toEqual({
        type: 'fix',
        scope: null,
        breaking: false,
        description: 'resolve bug'
      });
    });

    test('should parse commit with scope', () => {
      const result = parseConventionalCommit('feat(api): add endpoint');
      expect(result).toEqual({
        type: 'feat',
        scope: 'api',
        breaking: false,
        description: 'add endpoint'
      });
    });

    test('should parse commit with breaking change marker', () => {
      const result = parseConventionalCommit('feat!: breaking change');
      expect(result).toEqual({
        type: 'feat',
        scope: null,
        breaking: true,
        description: 'breaking change'
      });
    });

    test('should parse commit with scope and breaking marker', () => {
      const result = parseConventionalCommit('feat(api)!: breaking change');
      expect(result).toEqual({
        type: 'feat',
        scope: 'api',
        breaking: true,
        description: 'breaking change'
      });
    });

    test('should detect BREAKING CHANGE in commit body', () => {
      const message = 'feat: new feature\n\nBREAKING CHANGE: this breaks things';
      const result = parseConventionalCommit(message);
      expect(result.breaking).toBe(true);
    });

    test('should detect BREAKING-CHANGE in commit body', () => {
      const message = 'feat: new feature\n\nBREAKING-CHANGE: this breaks things';
      const result = parseConventionalCommit(message);
      expect(result.breaking).toBe(true);
    });

    test('should parse chore commit', () => {
      const result = parseConventionalCommit('chore: update dependencies');
      expect(result).toEqual({
        type: 'chore',
        scope: null,
        breaking: false,
        description: 'update dependencies'
      });
    });

    test('should parse docs commit', () => {
      const result = parseConventionalCommit('docs: update README');
      expect(result).toEqual({
        type: 'docs',
        scope: null,
        breaking: false,
        description: 'update README'
      });
    });

    test('should parse refactor commit', () => {
      const result = parseConventionalCommit('refactor: simplify logic');
      expect(result).toEqual({
        type: 'refactor',
        scope: null,
        breaking: false,
        description: 'simplify logic'
      });
    });

    test('should parse test commit', () => {
      const result = parseConventionalCommit('test: add unit tests');
      expect(result).toEqual({
        type: 'test',
        scope: null,
        breaking: false,
        description: 'add unit tests'
      });
    });

    test('should parse style commit', () => {
      const result = parseConventionalCommit('style: format code');
      expect(result).toEqual({
        type: 'style',
        scope: null,
        breaking: false,
        description: 'format code'
      });
    });

    test('should parse perf commit', () => {
      const result = parseConventionalCommit('perf: optimize query');
      expect(result).toEqual({
        type: 'perf',
        scope: null,
        breaking: false,
        description: 'optimize query'
      });
    });

    test('should parse build commit', () => {
      const result = parseConventionalCommit('build: update webpack config');
      expect(result).toEqual({
        type: 'build',
        scope: null,
        breaking: false,
        description: 'update webpack config'
      });
    });

    test('should parse ci commit', () => {
      const result = parseConventionalCommit('ci: update GitHub Actions');
      expect(result).toEqual({
        type: 'ci',
        scope: null,
        breaking: false,
        description: 'update GitHub Actions'
      });
    });
  });

  describe('non-conventional commits', () => {
    test('should handle commit without type', () => {
      const result = parseConventionalCommit('just a regular commit message');
      expect(result).toEqual({
        type: null,
        scope: null,
        breaking: false,
        description: 'just a regular commit message'
      });
    });

    test('should handle commit with invalid format', () => {
      const result = parseConventionalCommit('feat add feature without colon');
      expect(result).toEqual({
        type: null,
        scope: null,
        breaking: false,
        description: 'feat add feature without colon'
      });
    });

    test('should handle empty commit message', () => {
      const result = parseConventionalCommit('');
      expect(result).toEqual({
        type: null,
        scope: null,
        breaking: false,
        description: ''
      });
    });

    test('should handle commit with only type', () => {
      const result = parseConventionalCommit('feat:');
      // When there's no space after colon, it doesn't match the regex
      expect(result).toEqual({
        type: null,
        scope: null,
        breaking: false,
        description: 'feat:'
      });
    });
  });

  describe('edge cases', () => {
    test('should handle commit with extra whitespace', () => {
      const result = parseConventionalCommit('feat:   add feature with spaces  ');
      expect(result).toEqual({
        type: 'feat',
        scope: null,
        breaking: false,
        description: 'add feature with spaces'
      });
    });

    test('should handle commit with multiline description', () => {
      const message = 'feat: add feature\n\nThis is a longer description\nwith multiple lines';
      const result = parseConventionalCommit(message);
      expect(result.type).toBe('feat');
      expect(result.description).toBe('add feature');
    });

    test('should handle commit with special characters in description', () => {
      const result = parseConventionalCommit('feat: add feature with @#$%^&*()');
      expect(result.description).toBe('add feature with @#$%^&*()');
    });

    test('should handle commit with numbers in scope', () => {
      const result = parseConventionalCommit('feat(api-v2): add endpoint');
      expect(result.scope).toBe('api-v2');
    });

    test('should handle uppercase type (should normalize to lowercase)', () => {
      const result = parseConventionalCommit('FEAT: add feature');
      expect(result.type).toBe('feat');
    });

    test('should handle mixed case type', () => {
      const result = parseConventionalCommit('Feat: add feature');
      expect(result.type).toBe('feat');
    });
  });
});

describe('getVersionBumpType', () => {
  describe('breaking changes', () => {
    test('should return major for breaking feat', () => {
      expect(getVersionBumpType('feat', true)).toBe('major');
    });

    test('should return major for breaking fix', () => {
      expect(getVersionBumpType('fix', true)).toBe('major');
    });

    test('should return major for breaking chore', () => {
      expect(getVersionBumpType('chore', true)).toBe('major');
    });

    test('should return major for breaking change with any type', () => {
      expect(getVersionBumpType('docs', true)).toBe('major');
      expect(getVersionBumpType('style', true)).toBe('major');
      expect(getVersionBumpType('refactor', true)).toBe('major');
    });
  });

  describe('feature commits', () => {
    test('should return minor for feat', () => {
      expect(getVersionBumpType('feat', false)).toBe('minor');
    });

    test('should return minor for feature', () => {
      expect(getVersionBumpType('feature', false)).toBe('minor');
    });
  });

  describe('patch commits', () => {
    test('should return patch for fix', () => {
      expect(getVersionBumpType('fix', false)).toBe('patch');
    });

    test('should return patch for bugfix', () => {
      expect(getVersionBumpType('bugfix', false)).toBe('patch');
    });

    test('should return patch for chore', () => {
      expect(getVersionBumpType('chore', false)).toBe('patch');
    });

    test('should return patch for docs', () => {
      expect(getVersionBumpType('docs', false)).toBe('patch');
    });

    test('should return patch for style', () => {
      expect(getVersionBumpType('style', false)).toBe('patch');
    });

    test('should return patch for refactor', () => {
      expect(getVersionBumpType('refactor', false)).toBe('patch');
    });

    test('should return patch for perf', () => {
      expect(getVersionBumpType('perf', false)).toBe('patch');
    });

    test('should return patch for test', () => {
      expect(getVersionBumpType('test', false)).toBe('patch');
    });

    test('should return patch for build', () => {
      expect(getVersionBumpType('build', false)).toBe('patch');
    });

    test('should return patch for ci', () => {
      expect(getVersionBumpType('ci', false)).toBe('patch');
    });
  });

  describe('unknown commit types', () => {
    test('should return null for unknown type', () => {
      expect(getVersionBumpType('unknown', false)).toBeNull();
    });

    test('should return null for null type', () => {
      expect(getVersionBumpType(null, false)).toBeNull();
    });

    test('should return null for undefined type', () => {
      expect(getVersionBumpType(undefined, false)).toBeNull();
    });

    test('should return null for empty string type', () => {
      expect(getVersionBumpType('', false)).toBeNull();
    });
  });
});

describe('analyzeCommits', () => {
  describe('empty commit list', () => {
    test('should return null bump for empty commits', () => {
      const result = analyzeCommits([]);
      expect(result).toEqual({
        bump: null,
        commits: [],
        summary: {
          total: 0,
          breaking: 0,
          features: 0,
          fixes: 0,
          other: 0
        }
      });
    });
  });

  describe('single commit analysis', () => {
    test('should analyze single feat commit', () => {
      const commits = [
        { sha: 'abc123', message: 'feat: add new feature' }
      ];
      const result = analyzeCommits(commits);
      
      expect(result.bump).toBe('minor');
      expect(result.commits).toHaveLength(1);
      expect(result.commits[0]).toMatchObject({
        sha: 'abc123',
        type: 'feat',
        breaking: false,
        bump: 'minor'
      });
      expect(result.summary).toEqual({
        total: 1,
        breaking: 0,
        features: 1,
        fixes: 0,
        other: 0
      });
    });

    test('should analyze single fix commit', () => {
      const commits = [
        { sha: 'def456', message: 'fix: resolve bug' }
      ];
      const result = analyzeCommits(commits);
      
      expect(result.bump).toBe('patch');
      expect(result.commits[0]).toMatchObject({
        type: 'fix',
        bump: 'patch'
      });
      expect(result.summary).toEqual({
        total: 1,
        breaking: 0,
        features: 0,
        fixes: 1,
        other: 0
      });
    });

    test('should analyze single breaking change commit', () => {
      const commits = [
        { sha: 'ghi789', message: 'feat!: breaking change' }
      ];
      const result = analyzeCommits(commits);
      
      expect(result.bump).toBe('major');
      expect(result.commits[0]).toMatchObject({
        type: 'feat',
        breaking: true,
        bump: 'major'
      });
      expect(result.summary).toEqual({
        total: 1,
        breaking: 1,
        features: 1,
        fixes: 0,
        other: 0
      });
    });

    test('should analyze non-conventional commit', () => {
      const commits = [
        { sha: 'jkl012', message: 'just a regular commit' }
      ];
      const result = analyzeCommits(commits);
      
      expect(result.bump).toBeNull();
      expect(result.commits[0]).toMatchObject({
        type: null,
        bump: null
      });
      expect(result.summary).toEqual({
        total: 1,
        breaking: 0,
        features: 0,
        fixes: 0,
        other: 1
      });
    });
  });

  describe('multiple commits analysis', () => {
    test('should prioritize major over minor and patch', () => {
      const commits = [
        { sha: 'a', message: 'fix: bug fix' },
        { sha: 'b', message: 'feat: new feature' },
        { sha: 'c', message: 'feat!: breaking change' }
      ];
      const result = analyzeCommits(commits);
      
      expect(result.bump).toBe('major');
      expect(result.summary).toEqual({
        total: 3,
        breaking: 1,
        features: 2,
        fixes: 1,
        other: 0
      });
    });

    test('should prioritize minor over patch', () => {
      const commits = [
        { sha: 'a', message: 'fix: bug fix' },
        { sha: 'b', message: 'chore: update deps' },
        { sha: 'c', message: 'feat: new feature' }
      ];
      const result = analyzeCommits(commits);
      
      expect(result.bump).toBe('minor');
      expect(result.summary).toEqual({
        total: 3,
        breaking: 0,
        features: 1,
        fixes: 1,
        other: 0
      });
    });

    test('should return patch for only patch commits', () => {
      const commits = [
        { sha: 'a', message: 'fix: bug fix' },
        { sha: 'b', message: 'chore: update deps' },
        { sha: 'c', message: 'docs: update README' }
      ];
      const result = analyzeCommits(commits);
      
      expect(result.bump).toBe('patch');
      expect(result.summary).toEqual({
        total: 3,
        breaking: 0,
        features: 0,
        fixes: 1,
        other: 0
      });
    });

    test('should handle mix of conventional and non-conventional commits', () => {
      const commits = [
        { sha: 'a', message: 'feat: new feature' },
        { sha: 'b', message: 'regular commit message' },
        { sha: 'c', message: 'fix: bug fix' }
      ];
      const result = analyzeCommits(commits);
      
      expect(result.bump).toBe('minor');
      expect(result.summary).toEqual({
        total: 3,
        breaking: 0,
        features: 1,
        fixes: 1,
        other: 1
      });
    });

    test('should return null for only non-conventional commits', () => {
      const commits = [
        { sha: 'a', message: 'regular commit 1' },
        { sha: 'b', message: 'regular commit 2' },
        { sha: 'c', message: 'regular commit 3' }
      ];
      const result = analyzeCommits(commits);
      
      expect(result.bump).toBeNull();
      expect(result.summary).toEqual({
        total: 3,
        breaking: 0,
        features: 0,
        fixes: 0,
        other: 3
      });
    });
  });

  describe('edge cases', () => {
    test('should handle multiple breaking changes', () => {
      const commits = [
        { sha: 'a', message: 'feat!: breaking 1' },
        { sha: 'b', message: 'fix!: breaking 2' },
        { sha: 'c', message: 'chore: regular' }
      ];
      const result = analyzeCommits(commits);
      
      expect(result.bump).toBe('major');
      expect(result.summary.breaking).toBe(2);
    });

    test('should handle commits with BREAKING CHANGE in body', () => {
      const commits = [
        { sha: 'a', message: 'feat: new feature\n\nBREAKING CHANGE: breaks API' }
      ];
      const result = analyzeCommits(commits);
      
      expect(result.bump).toBe('major');
      expect(result.commits[0].breaking).toBe(true);
    });

    test('should handle commits with scopes', () => {
      const commits = [
        { sha: 'a', message: 'feat(api): add endpoint' },
        { sha: 'b', message: 'fix(ui): resolve layout' }
      ];
      const result = analyzeCommits(commits);
      
      expect(result.bump).toBe('minor');
      expect(result.commits[0].scope).toBe('api');
      expect(result.commits[1].scope).toBe('ui');
    });

    test('should handle large number of commits', () => {
      const commits = Array.from({ length: 100 }, (_, i) => ({
        sha: `commit${i}`,
        message: i % 3 === 0 ? 'feat: feature' : i % 3 === 1 ? 'fix: fix' : 'chore: chore'
      }));
      const result = analyzeCommits(commits);
      
      expect(result.bump).toBe('minor');
      expect(result.summary.total).toBe(100);
      expect(result.commits).toHaveLength(100);
    });

    test('should handle commits with multiline messages', () => {
      const commits = [
        { 
          sha: 'a', 
          message: 'feat: add feature\n\nThis is a longer description\nwith multiple lines\n\nBREAKING CHANGE: breaks things' 
        }
      ];
      const result = analyzeCommits(commits);
      
      expect(result.bump).toBe('major');
      expect(result.commits[0].breaking).toBe(true);
    });
  });
});

describe('calculateNextVersion', () => {
  describe('major version bumps', () => {
    test('should increment major and reset minor and patch', () => {
      expect(calculateNextVersion('1.2.3', 'major')).toBe('2.0.0');
    });

    test('should increment major from 0.x.x', () => {
      expect(calculateNextVersion('0.5.10', 'major')).toBe('1.0.0');
    });

    test('should increment major from large version', () => {
      expect(calculateNextVersion('99.88.77', 'major')).toBe('100.0.0');
    });

    test('should handle major bump from x.0.0', () => {
      expect(calculateNextVersion('5.0.0', 'major')).toBe('6.0.0');
    });
  });

  describe('minor version bumps', () => {
    test('should increment minor and reset patch', () => {
      expect(calculateNextVersion('1.2.3', 'minor')).toBe('1.3.0');
    });

    test('should increment minor from x.0.x', () => {
      expect(calculateNextVersion('1.0.5', 'minor')).toBe('1.1.0');
    });

    test('should increment minor from 0.0.x', () => {
      expect(calculateNextVersion('0.0.5', 'minor')).toBe('0.1.0');
    });

    test('should handle large minor version', () => {
      expect(calculateNextVersion('1.99.10', 'minor')).toBe('1.100.0');
    });
  });

  describe('patch version bumps', () => {
    test('should increment patch only', () => {
      expect(calculateNextVersion('1.2.3', 'patch')).toBe('1.2.4');
    });

    test('should increment patch from x.x.0', () => {
      expect(calculateNextVersion('1.2.0', 'patch')).toBe('1.2.1');
    });

    test('should increment patch from 0.0.0', () => {
      expect(calculateNextVersion('0.0.0', 'patch')).toBe('0.0.1');
    });

    test('should handle large patch version', () => {
      expect(calculateNextVersion('1.2.999', 'patch')).toBe('1.2.1000');
    });
  });

  describe('error handling', () => {
    test('should throw error for invalid version format', () => {
      expect(() => calculateNextVersion('invalid', 'patch')).toThrow('Invalid version format');
    });

    test('should throw error for version with only major.minor', () => {
      expect(() => calculateNextVersion('1.2', 'patch')).toThrow('Invalid version format');
    });

    test('should throw error for version with only major', () => {
      expect(() => calculateNextVersion('1', 'patch')).toThrow('Invalid version format');
    });

    test('should throw error for invalid bump type', () => {
      expect(() => calculateNextVersion('1.2.3', 'invalid')).toThrow('Invalid bump type');
    });

    test('should throw error for null bump type', () => {
      expect(() => calculateNextVersion('1.2.3', null)).toThrow('Invalid bump type');
    });

    test('should throw error for undefined bump type', () => {
      expect(() => calculateNextVersion('1.2.3', undefined)).toThrow('Invalid bump type');
    });
  });

  describe('edge cases', () => {
    test('should handle version with pre-release (ignores pre-release)', () => {
      // Note: The function only handles major.minor.patch, pre-release is ignored
      expect(calculateNextVersion('1.2.3-alpha', 'patch')).toBe('1.2.4');
    });

    test('should handle version with build metadata (ignores metadata)', () => {
      expect(calculateNextVersion('1.2.3+build123', 'patch')).toBe('1.2.4');
    });

    test('should handle version starting with zeros', () => {
      expect(calculateNextVersion('0.0.0', 'major')).toBe('1.0.0');
      expect(calculateNextVersion('0.0.0', 'minor')).toBe('0.1.0');
      expect(calculateNextVersion('0.0.0', 'patch')).toBe('0.0.1');
    });

    test('should handle very large version numbers', () => {
      expect(calculateNextVersion('999.999.999', 'major')).toBe('1000.0.0');
      expect(calculateNextVersion('999.999.999', 'minor')).toBe('999.1000.0');
      expect(calculateNextVersion('999.999.999', 'patch')).toBe('999.999.1000');
    });
  });
});
