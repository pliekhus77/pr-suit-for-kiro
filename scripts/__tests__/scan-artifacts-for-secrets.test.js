/**
 * Unit tests for scan-artifacts-for-secrets.js
 */

const fs = require('fs');
const path = require('path');
const { scanTextFile, SECRET_PATTERNS } = require('../scan-artifacts-for-secrets');

describe('scan-artifacts-for-secrets', () => {
  let readFileSyncSpy;
  
  beforeEach(() => {
    readFileSyncSpy = jest.spyOn(fs, 'readFileSync');
  });
  
  afterEach(() => {
    readFileSyncSpy.mockRestore();
  });

  describe('SECRET_PATTERNS', () => {
    it('should have patterns for common secret types', () => {
      expect(SECRET_PATTERNS).toBeDefined();
      expect(Array.isArray(SECRET_PATTERNS)).toBe(true);
      expect(SECRET_PATTERNS.length).toBeGreaterThan(0);
      
      const patternNames = SECRET_PATTERNS.map(p => p.name);
      expect(patternNames).toContain('GitHub Personal Access Token');
      expect(patternNames).toContain('AWS Access Key');
      expect(patternNames).toContain('Private Key');
    });

    it('should have severity levels for all patterns', () => {
      SECRET_PATTERNS.forEach(pattern => {
        expect(pattern.severity).toBeDefined();
        expect(['critical', 'high', 'medium', 'low']).toContain(pattern.severity);
      });
    });
  });

  describe('scanTextFile', () => {
    it('should detect GitHub PAT in file content', () => {
      const content = 'export TOKEN=ghp_1234567890abcdefghijklmnopqrstuv123456';
      readFileSyncSpy.mockReturnValue(content);
      
      const findings = scanTextFile('/fake/path.txt', 'path.txt');
      
      expect(findings.length).toBeGreaterThan(0);
      const githubPat = findings.find(f => f.type === 'GitHub Personal Access Token');
      expect(githubPat).toBeDefined();
      expect(githubPat.severity).toBe('critical');
    });

    it('should detect AWS access key in file content', () => {
      const content = 'AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE';
      readFileSyncSpy.mockReturnValue(content);
      
      const findings = scanTextFile('/fake/path.txt', 'path.txt');
      
      expect(findings.length).toBeGreaterThan(0);
      const awsKey = findings.find(f => f.type === 'AWS Access Key');
      expect(awsKey).toBeDefined();
      expect(awsKey.severity).toBe('critical');
    });

    it('should detect private key in file content', () => {
      const content = '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA...';
      readFileSyncSpy.mockReturnValue(content);
      
      const findings = scanTextFile('/fake/path.txt', 'path.txt');
      
      expect(findings.length).toBeGreaterThan(0);
      const privateKey = findings.find(f => f.type === 'Private Key');
      expect(privateKey).toBeDefined();
      expect(privateKey.severity).toBe('critical');
    });

    it('should skip false positives in test files', () => {
      const content = 'const mockToken = "ghp_1234567890abcdefghijklmnopqrstuv123456"; // test mock';
      readFileSyncSpy.mockReturnValue(content);
      
      const findings = scanTextFile('/fake/test.txt', 'test.txt');
      
      // Should be filtered out as false positive
      expect(findings.length).toBe(0);
    });

    it('should skip placeholder values', () => {
      const content = 'TOKEN=your-token-here';
      readFileSyncSpy.mockReturnValue(content);
      
      const findings = scanTextFile('/fake/path.txt', 'path.txt');
      
      expect(findings.length).toBe(0);
    });

    it('should provide line and column information', () => {
      const content = 'line 1\nline 2\nTOKEN=ghp_1234567890abcdefghijklmnopqrstuv123456\nline 4';
      readFileSyncSpy.mockReturnValue(content);
      
      const findings = scanTextFile('/fake/path.txt', 'path.txt');
      
      expect(findings.length).toBeGreaterThan(0);
      const finding = findings[0];
      expect(finding.line).toBe(3);
      expect(finding.column).toBeGreaterThan(0);
    });

    it('should mask secret values in findings', () => {
      const content = 'TOKEN=ghp_1234567890abcdefghijklmnopqrstuv123456';
      readFileSyncSpy.mockReturnValue(content);
      
      const findings = scanTextFile('/fake/path.txt', 'path.txt');
      
      expect(findings.length).toBeGreaterThan(0);
      const finding = findings[0];
      expect(finding.value).toContain('***');
      expect(finding.value).not.toBe('ghp_1234567890abcdefghijklmnopqrstuv123456');
    });

    it('should provide context around the finding', () => {
      const content = 'export TOKEN=ghp_1234567890abcdefghijklmnopqrstuv123456';
      readFileSyncSpy.mockReturnValue(content);
      
      const findings = scanTextFile('/fake/path.txt', 'path.txt');
      
      expect(findings.length).toBeGreaterThan(0);
      const finding = findings[0];
      expect(finding.context).toBeDefined();
      expect(finding.context).toContain('export TOKEN=');
    });

    it('should handle empty files', () => {
      readFileSyncSpy.mockReturnValue('');
      
      const findings = scanTextFile('/fake/empty.txt', 'empty.txt');
      
      expect(findings).toEqual([]);
    });

    it('should handle files with no secrets', () => {
      const content = 'This is a normal file\nwith no secrets\njust regular content';
      readFileSyncSpy.mockReturnValue(content);
      
      const findings = scanTextFile('/fake/clean.txt', 'clean.txt');
      
      expect(findings).toEqual([]);
    });

    it('should detect multiple secrets in one file', () => {
      const content = `
        AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
        GITHUB_TOKEN=ghp_1234567890abcdefghijklmnopqrstuv123456
        API_KEY=sk_test_1234567890abcdefghijklmnopqrstuvwxyzABCDEF
      `;
      readFileSyncSpy.mockReturnValue(content);
      
      const findings = scanTextFile('/fake/multi.txt', 'multi.txt');
      
      expect(findings.length).toBeGreaterThanOrEqual(2);
    });
  });
});
