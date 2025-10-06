/* eslint-env jest, node */
/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * Unit tests for generate-changelog.js
 * 
 * Tests changelog generation including:
 * - Changelog entry generation from commits
 * - Grouping by commit type (feat, fix, chore)
 * - Markdown formatting
 * - Edge cases (empty commits, malformed messages)
 */

// Mock fs module before requiring the module under test
jest.mock('fs');

const fs = require('fs');
const {
  parseConventionalCommit,
  groupCommitsByType,
  formatChangelogEntry,
  generateChangelogMarkdown,
  readExistingChangelog,
  createChangelogTemplate,
  insertChangelogEntry,
  writeChangelog
} = require('../generate-changelog');

describe('generate-changelog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('parseConventionalCommit', () => {
    it('should parse basic feat commit', () => {
      const result = parseConventionalCommit('feat: add new feature');
      expect(result).toMatchObject({
        type: 'feat',
        scope: null,
        breaking: false,
        description: 'add new feature'
      });
    });

    it('should parse commit with scope', () => {
      const result = parseConventionalCommit('fix(api): resolve bug');
      expect(result).toMatchObject({
        type: 'fix',
        scope: 'api',
        breaking: false,
        description: 'resolve bug'
      });
    });

    it('should parse breaking change with marker', () => {
      const result = parseConventionalCommit('feat!: breaking change');
      expect(result).toMatchObject({
        type: 'feat',
        breaking: true,
        description: 'breaking change'
      });
    });

    it('should detect BREAKING CHANGE in body', () => {
      const message = 'feat: new feature\n\nBREAKING CHANGE: this breaks things';
      const result = parseConventionalCommit(message);
      expect(result.breaking).toBe(true);
      expect(result.body).toContain('BREAKING CHANGE');
    });

    it('should handle non-conventional commit', () => {
      const result = parseConventionalCommit('just a regular commit');
      expect(result).toMatchObject({
        type: null,
        scope: null,
        breaking: false,
        description: 'just a regular commit'
      });
    });

    it('should parse multiline commit message', () => {
      const message = 'feat: add feature\n\nThis is a longer description\nwith multiple lines';
      const result = parseConventionalCommit(message);
      expect(result.type).toBe('feat');
      expect(result.body).toContain('longer description');
    });
  });

  describe('groupCommitsByType', () => {
    it('should group commits by type', () => {
      const commits = [
        { sha: 'abc123', message: 'feat: new feature' },
        { sha: 'def456', message: 'fix: bug fix' },
        { sha: 'ghi789', message: 'chore: update deps' }
      ];

      const groups = groupCommitsByType(commits);

      expect(groups.features).toHaveLength(1);
      expect(groups.fixes).toHaveLength(1);
      expect(groups.other).toHaveLength(1);
      expect(groups.breaking).toHaveLength(0);
    });

    it('should group breaking changes separately', () => {
      const commits = [
        { sha: 'abc123', message: 'feat!: breaking feature' },
        { sha: 'def456', message: 'feat: normal feature' }
      ];

      const groups = groupCommitsByType(commits);

      expect(groups.breaking).toHaveLength(1);
      expect(groups.features).toHaveLength(1);
      expect(groups.breaking[0].sha).toBe('abc123');
    });

    it('should include short SHA in entries', () => {
      const commits = [
        { sha: 'abcdef1234567890', message: 'feat: new feature' }
      ];

      const groups = groupCommitsByType(commits);

      expect(groups.features[0].shortSha).toBe('abcdef1');
    });

    it('should handle empty commit list', () => {
      const groups = groupCommitsByType([]);

      expect(groups.breaking).toHaveLength(0);
      expect(groups.features).toHaveLength(0);
      expect(groups.fixes).toHaveLength(0);
      expect(groups.other).toHaveLength(0);
    });

    it('should group multiple commits of same type', () => {
      const commits = [
        { sha: 'a', message: 'feat: feature 1' },
        { sha: 'b', message: 'feat: feature 2' },
        { sha: 'c', message: 'feat: feature 3' }
      ];

      const groups = groupCommitsByType(commits);

      expect(groups.features).toHaveLength(3);
    });

    it('should handle commits with scopes', () => {
      const commits = [
        { sha: 'a', message: 'feat(api): add endpoint' },
        { sha: 'b', message: 'fix(ui): resolve layout' }
      ];

      const groups = groupCommitsByType(commits);

      expect(groups.features[0].scope).toBe('api');
      expect(groups.fixes[0].scope).toBe('ui');
    });
  });

  describe('formatChangelogEntry', () => {
    it('should format entry with scope', () => {
      const entry = {
        sha: 'abcdef1234567890',
        shortSha: 'abcdef1',
        scope: 'api',
        description: 'add new endpoint'
      };

      const formatted = formatChangelogEntry(entry, true);

      expect(formatted).toBe('- **api**: add new endpoint ([abcdef1](../../commit/abcdef1234567890))');
    });

    it('should format entry without scope', () => {
      const entry = {
        sha: 'abcdef1234567890',
        shortSha: 'abcdef1',
        scope: null,
        description: 'add new feature'
      };

      const formatted = formatChangelogEntry(entry, true);

      expect(formatted).toBe('- add new feature ([abcdef1](../../commit/abcdef1234567890))');
    });

    it('should format entry without scope when includeScope is false', () => {
      const entry = {
        sha: 'abcdef1234567890',
        shortSha: 'abcdef1',
        scope: 'api',
        description: 'add new endpoint'
      };

      const formatted = formatChangelogEntry(entry, false);

      expect(formatted).toBe('- add new endpoint ([abcdef1](../../commit/abcdef1234567890))');
    });

    it('should handle special characters in description', () => {
      const entry = {
        sha: 'abc123',
        shortSha: 'abc123',
        scope: null,
        description: 'fix: resolve issue with "quotes" and <brackets>'
      };

      const formatted = formatChangelogEntry(entry);

      expect(formatted).toContain('fix: resolve issue with "quotes" and <brackets>');
    });
  });

  describe('generateChangelogMarkdown', () => {
    it('should generate changelog with all sections', () => {
      const groups = {
        breaking: [
          { sha: 'a', shortSha: 'a', description: 'breaking change', body: 'BREAKING CHANGE: details' }
        ],
        features: [
          { sha: 'b', shortSha: 'b', description: 'new feature' }
        ],
        fixes: [
          { sha: 'c', shortSha: 'c', description: 'bug fix' }
        ],
        other: []
      };

      const markdown = generateChangelogMarkdown('1.2.3', groups, '2024-01-15');

      expect(markdown).toContain('## [1.2.3] - 2024-01-15');
      expect(markdown).toContain('### ⚠ BREAKING CHANGES');
      expect(markdown).toContain('### Added');
      expect(markdown).toContain('### Fixed');
      expect(markdown).toContain('breaking change');
      expect(markdown).toContain('new feature');
      expect(markdown).toContain('bug fix');
    });

    it('should omit empty sections', () => {
      const groups = {
        breaking: [],
        features: [
          { sha: 'a', shortSha: 'a', description: 'new feature' }
        ],
        fixes: [],
        other: []
      };

      const markdown = generateChangelogMarkdown('1.0.0', groups, '2024-01-15');

      expect(markdown).toContain('### Added');
      expect(markdown).not.toContain('### ⚠ BREAKING CHANGES');
      expect(markdown).not.toContain('### Fixed');
    });

    it('should include significant other changes', () => {
      const groups = {
        breaking: [],
        features: [],
        fixes: [],
        other: [
          { sha: 'a', shortSha: 'a', type: 'docs', description: 'update README' },
          { sha: 'b', shortSha: 'b', type: 'perf', description: 'improve performance' },
          { sha: 'c', shortSha: 'c', type: 'chore', description: 'update deps' }
        ]
      };

      const markdown = generateChangelogMarkdown('1.0.0', groups, '2024-01-15');

      expect(markdown).toContain('### Changed');
      expect(markdown).toContain('update README');
      expect(markdown).toContain('improve performance');
      expect(markdown).not.toContain('update deps'); // chore is not significant
    });

    it('should format date correctly', () => {
      const groups = {
        breaking: [],
        features: [{ sha: 'a', shortSha: 'a', description: 'feature' }],
        fixes: [],
        other: []
      };

      const markdown = generateChangelogMarkdown('2.0.0', groups, '2024-12-31');

      expect(markdown).toContain('## [2.0.0] - 2024-12-31');
    });

    it('should handle empty groups', () => {
      const groups = {
        breaking: [],
        features: [],
        fixes: [],
        other: []
      };

      const markdown = generateChangelogMarkdown('1.0.0', groups, '2024-01-15');

      expect(markdown).toContain('## [1.0.0] - 2024-01-15');
      expect(markdown).not.toContain('###');
    });

    it('should include breaking change details from body', () => {
      const groups = {
        breaking: [
          {
            sha: 'a',
            shortSha: 'a',
            description: 'breaking change',
            body: 'BREAKING CHANGE: API endpoint removed'
          }
        ],
        features: [],
        fixes: [],
        other: []
      };

      const markdown = generateChangelogMarkdown('2.0.0', groups, '2024-01-15');

      expect(markdown).toContain('API endpoint removed');
    });
  });

  describe('readExistingChangelog', () => {
    it('should read existing changelog file', () => {
      const mockContent = '# Changelog\n\n## [1.0.0] - 2024-01-01\n';
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(mockContent);

      const content = readExistingChangelog('/path/to/CHANGELOG.md');

      expect(content).toBe(mockContent);
      expect(fs.existsSync).toHaveBeenCalledWith('/path/to/CHANGELOG.md');
      expect(fs.readFileSync).toHaveBeenCalledWith('/path/to/CHANGELOG.md', 'utf8');
    });

    it('should create template if file does not exist', () => {
      fs.existsSync.mockReturnValue(false);

      const content = readExistingChangelog('/path/to/CHANGELOG.md');

      expect(content).toContain('# Changelog');
      expect(content).toContain('Keep a Changelog');
      expect(content).toContain('Semantic Versioning');
    });

    it('should create template if read fails', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation(() => {
        throw new Error('Read failed');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const content = readExistingChangelog('/path/to/CHANGELOG.md');

      expect(content).toContain('# Changelog');
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('createChangelogTemplate', () => {
    it('should create valid changelog template', () => {
      const template = createChangelogTemplate();

      expect(template).toContain('# Changelog');
      expect(template).toContain('Keep a Changelog');
      expect(template).toContain('Semantic Versioning');
      expect(template).toContain('keepachangelog.com');
      expect(template).toContain('semver.org');
    });
  });

  describe('insertChangelogEntry', () => {
    it('should insert entry before first version', () => {
      const existing = '# Changelog\n\n## [1.0.0] - 2024-01-01\n\n- Initial release\n';
      const newEntry = '## [1.1.0] - 2024-01-15\n\n- New feature\n';

      const updated = insertChangelogEntry(existing, newEntry);

      expect(updated).toContain('## [1.1.0] - 2024-01-15');
      expect(updated.indexOf('## [1.1.0]')).toBeLessThan(updated.indexOf('## [1.0.0]'));
    });

    it('should append to end if no versions exist', () => {
      const existing = '# Changelog\n\nAll notable changes...\n';
      const newEntry = '## [1.0.0] - 2024-01-01\n\n- Initial release\n';

      const updated = insertChangelogEntry(existing, newEntry);

      expect(updated).toContain('## [1.0.0] - 2024-01-01');
      expect(updated).toContain('All notable changes');
    });

    it('should handle empty existing changelog', () => {
      const existing = '';
      const newEntry = '## [1.0.0] - 2024-01-01\n\n- Initial release\n';

      const updated = insertChangelogEntry(existing, newEntry);

      expect(updated).toContain('## [1.0.0] - 2024-01-01');
    });

    it('should preserve existing versions', () => {
      const existing = '# Changelog\n\n## [1.0.0] - 2024-01-01\n\n- Old feature\n';
      const newEntry = '## [1.1.0] - 2024-01-15\n\n- New feature\n';

      const updated = insertChangelogEntry(existing, newEntry);

      expect(updated).toContain('## [1.1.0]');
      expect(updated).toContain('## [1.0.0]');
      expect(updated).toContain('Old feature');
      expect(updated).toContain('New feature');
    });
  });

  describe('writeChangelog', () => {
    it('should write changelog to file', () => {
      fs.writeFileSync.mockImplementation(() => {});

      const content = '# Changelog\n\n## [1.0.0] - 2024-01-01\n';
      writeChangelog('/path/to/CHANGELOG.md', content);

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        '/path/to/CHANGELOG.md',
        content,
        'utf8'
      );
    });

    it('should throw error if write fails', () => {
      fs.writeFileSync.mockImplementation(() => {
        throw new Error('Write failed');
      });

      expect(() => writeChangelog('/path/to/CHANGELOG.md', 'content'))
        .toThrow('Failed to write CHANGELOG.md');
    });
  });

  describe('edge cases', () => {
    it('should handle commits with empty messages', () => {
      const commits = [
        { sha: 'a', message: '' }
      ];

      const groups = groupCommitsByType(commits);

      expect(groups.other).toHaveLength(1);
    });

    it('should handle commits with only whitespace', () => {
      const commits = [
        { sha: 'a', message: '   \n\n   ' }
      ];

      const groups = groupCommitsByType(commits);

      expect(groups.other).toHaveLength(1);
    });

    it('should handle malformed conventional commits', () => {
      const commits = [
        { sha: 'a', message: 'feat add feature without colon' },
        { sha: 'b', message: 'fix:' },
        { sha: 'c', message: ':no type' }
      ];

      const groups = groupCommitsByType(commits);

      expect(groups.other).toHaveLength(3);
    });

    it('should handle very long commit messages', () => {
      const longMessage = 'feat: ' + 'a'.repeat(1000);
      const commits = [
        { sha: 'a', message: longMessage }
      ];

      const groups = groupCommitsByType(commits);

      expect(groups.features).toHaveLength(1);
      expect(groups.features[0].description).toHaveLength(1000);
    });

    it('should handle special characters in commit messages', () => {
      const commits = [
        { sha: 'a', message: 'feat: add "quotes" and <brackets> and & ampersands' }
      ];

      const groups = groupCommitsByType(commits);

      expect(groups.features[0].description).toContain('"quotes"');
      expect(groups.features[0].description).toContain('<brackets>');
      expect(groups.features[0].description).toContain('& ampersands');
    });

    it('should handle Unicode characters in commit messages', () => {
      const commits = [
        { sha: 'a', message: 'feat: add 中文 support' },
        { sha: 'b', message: 'fix: resolve 🐛 bug' }
      ];

      const groups = groupCommitsByType(commits);

      expect(groups.features[0].description).toContain('中文');
      expect(groups.fixes[0].description).toContain('🐛');
    });
  });
});
