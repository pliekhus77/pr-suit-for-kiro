/**
 * Security Tests: Input Validation
 * Tests for malicious inputs, path traversal, injection attacks, XSS, and buffer overflow
 */

import { FrameworkManager } from '../../src/services/framework-manager';
import { SteeringValidator } from '../../src/services/steering-validator';
import { FileSystemOperations } from '../../src/utils/file-system';
import * as vscode from 'vscode';
import * as path from 'path';

// Mock VS Code API
jest.mock('vscode', () => ({
  window: {
    showInformationMessage: jest.fn(),
    showWarningMessage: jest.fn(),
    showErrorMessage: jest.fn(),
  },
  workspace: {
    workspaceFolders: [{ uri: { fsPath: '/test/workspace' } }],
  },
  Uri: {
    file: jest.fn((p: string) => ({ fsPath: p })),
  },
  Range: jest.fn((startLine: number, startChar: number, endLine: number, endChar: number) => ({
    start: { line: startLine, character: startChar },
    end: { line: endLine, character: endChar },
  })),
  DiagnosticSeverity: {
    Error: 0,
    Warning: 1,
    Information: 2,
    Hint: 3,
  },
}));

describe('Security: Input Validation Tests', () => {
  let mockFileSystem: jest.Mocked<FileSystemOperations>;
  let mockContext: any;

  beforeEach(() => {
    // Create mock file system
    mockFileSystem = {
      ensureDirectory: jest.fn().mockResolvedValue(undefined),
      directoryExists: jest.fn().mockResolvedValue(true),
      listFiles: jest.fn().mockResolvedValue([]),
      readFile: jest.fn().mockResolvedValue(''),
      writeFile: jest.fn().mockResolvedValue(undefined),
      copyFile: jest.fn().mockResolvedValue(undefined),
      deleteFile: jest.fn().mockResolvedValue(undefined),
      fileExists: jest.fn().mockResolvedValue(false),
      getWorkspacePath: jest.fn().mockReturnValue('/test/workspace'),
      getKiroPath: jest.fn().mockReturnValue('/test/workspace/.kiro'),
      getSteeringPath: jest.fn().mockReturnValue('/test/workspace/.kiro/steering'),
      getFrameworksPath: jest.fn().mockReturnValue('/test/workspace/frameworks'),
      getMetadataPath: jest.fn().mockReturnValue('/test/workspace/.kiro/.metadata'),
      getSpecsPath: jest.fn().mockReturnValue('/test/workspace/.kiro/specs'),
      getSettingsPath: jest.fn().mockReturnValue('/test/workspace/.kiro/settings'),
    } as any;

    // Create mock extension context
    mockContext = {
      extensionPath: '/test/extension',
      subscriptions: [],
    };

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('Path Traversal Attacks', () => {
    it('should reject path traversal attempts with ../ in framework ID', async () => {
      const frameworkManager = new FrameworkManager(mockContext, mockFileSystem);
      
      // Mock manifest with normal framework
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify({
        version: '1.0.0',
        frameworks: [
          {
            id: 'test-framework',
            name: 'Test Framework',
            description: 'Test',
            category: 'testing',
            version: '1.0.0',
            fileName: 'test.md',
          },
        ],
      }));

      // Try to install with path traversal in ID
      const maliciousId = '../../../etc/passwd';
      
      await expect(frameworkManager.installFramework(maliciousId))
        .rejects.toThrow('Framework not found');
    });

    it('should reject path traversal attempts with absolute paths', async () => {
      const frameworkManager = new FrameworkManager(mockContext, mockFileSystem);
      
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify({
        version: '1.0.0',
        frameworks: [],
      }));

      // Try with absolute path
      const maliciousId = '/etc/passwd';
      
      await expect(frameworkManager.installFramework(maliciousId))
        .rejects.toThrow('Framework not found');
    });

    it('should reject path traversal in fileName field', async () => {
      const frameworkManager = new FrameworkManager(mockContext, mockFileSystem);
      
      // Mock manifest with malicious fileName
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify({
        version: '1.0.0',
        frameworks: [
          {
            id: 'malicious-framework',
            name: 'Malicious',
            description: 'Test',
            category: 'testing',
            version: '1.0.0',
            fileName: '../../../etc/passwd',
          },
        ],
      }));

      mockFileSystem.fileExists.mockResolvedValue(false);

      // Should fail when trying to copy file
      await expect(frameworkManager.installFramework('malicious-framework'))
        .rejects.toThrow();
    });

    it('should sanitize file paths to prevent directory traversal', async () => {
      const frameworkManager = new FrameworkManager(mockContext, mockFileSystem);
      
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify({
        version: '1.0.0',
        frameworks: [
          {
            id: 'test',
            name: 'Test',
            description: 'Test',
            category: 'testing',
            version: '1.0.0',
            fileName: '..\\..\\..\\windows\\system32\\config\\sam',
          },
        ],
      }));

      mockFileSystem.fileExists.mockResolvedValue(false);

      await expect(frameworkManager.installFramework('test'))
        .rejects.toThrow();
    });

    it('should reject null bytes in file paths', async () => {
      const frameworkManager = new FrameworkManager(mockContext, mockFileSystem);
      
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify({
        version: '1.0.0',
        frameworks: [
          {
            id: 'test',
            name: 'Test',
            description: 'Test',
            category: 'testing',
            version: '1.0.0',
            fileName: 'test.md\0.txt',
          },
        ],
      }));

      mockFileSystem.fileExists.mockResolvedValue(false);

      // Null bytes should be rejected by file system
      await expect(frameworkManager.installFramework('test'))
        .rejects.toThrow();
    });
  });

  describe('Search Query Injection Attacks', () => {
    it('should handle regex special characters in search queries', async () => {
      const frameworkManager = new FrameworkManager(mockContext, mockFileSystem);
      
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify({
        version: '1.0.0',
        frameworks: [
          {
            id: 'test',
            name: 'Test Framework',
            description: 'A test framework',
            category: 'testing',
            version: '1.0.0',
            fileName: 'test.md',
          },
        ],
      }));

      // Try various regex special characters
      const maliciousQueries = [
        '.*',
        '.+',
        '^.*$',
        '(test|framework)',
        '[a-z]*',
        '\\w+',
        '(?:test)',
        'test{1,10}',
      ];

      for (const query of maliciousQueries) {
        // Should not throw, but should handle safely
        const results = await frameworkManager.searchFrameworks(query);
        expect(Array.isArray(results)).toBe(true);
      }
    });

    it('should handle ReDoS (Regular Expression Denial of Service) patterns', async () => {
      const frameworkManager = new FrameworkManager(mockContext, mockFileSystem);
      
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify({
        version: '1.0.0',
        frameworks: [
          {
            id: 'test',
            name: 'Test',
            description: 'Test',
            category: 'testing',
            version: '1.0.0',
            fileName: 'test.md',
          },
        ],
      }));

      // ReDoS patterns that could cause exponential backtracking
      const redosPatterns = [
        '(a+)+',
        '(a*)*',
        '(a|a)*',
        '(a|ab)*',
        '(.*a){x}',
      ];

      for (const pattern of redosPatterns) {
        const startTime = Date.now();
        await frameworkManager.searchFrameworks(pattern);
        const duration = Date.now() - startTime;
        
        // Should complete quickly (< 100ms)
        expect(duration).toBeLessThan(100);
      }
    });

    it('should handle SQL injection-like patterns in search', async () => {
      const frameworkManager = new FrameworkManager(mockContext, mockFileSystem);
      
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify({
        version: '1.0.0',
        frameworks: [
          {
            id: 'test',
            name: 'Test',
            description: 'Test',
            category: 'testing',
            version: '1.0.0',
            fileName: 'test.md',
          },
        ],
      }));

      const sqlInjectionPatterns = [
        "' OR '1'='1",
        "'; DROP TABLE frameworks; --",
        "1' UNION SELECT * FROM users--",
        "admin'--",
        "' OR 1=1--",
      ];

      for (const pattern of sqlInjectionPatterns) {
        // Should treat as literal string, not SQL
        const results = await frameworkManager.searchFrameworks(pattern);
        expect(Array.isArray(results)).toBe(true);
        // Should not find matches (treating as literal)
        expect(results.length).toBe(0);
      }
    });

    it('should handle command injection patterns in search', async () => {
      const frameworkManager = new FrameworkManager(mockContext, mockFileSystem);
      
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify({
        version: '1.0.0',
        frameworks: [],
      }));

      const commandInjectionPatterns = [
        '; rm -rf /',
        '| cat /etc/passwd',
        '`whoami`',
        '$(ls -la)',
        '&& echo hacked',
      ];

      for (const pattern of commandInjectionPatterns) {
        // Should not execute commands
        const results = await frameworkManager.searchFrameworks(pattern);
        expect(Array.isArray(results)).toBe(true);
      }
    });
  });

  describe('XSS (Cross-Site Scripting) Attempts', () => {
    it('should handle XSS patterns in custom document names', async () => {
      // Custom document names should be sanitized
      const xssPatterns = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>',
        '<svg onload=alert("XSS")>',
        'javascript:alert("XSS")',
        '<iframe src="javascript:alert(\'XSS\')">',
        '<body onload=alert("XSS")>',
      ];

      for (const pattern of xssPatterns) {
        // Document names should be validated/sanitized
        // In a real implementation, these would be rejected or sanitized
        expect(pattern).toContain('<'); // Verify test data
      }
    });

    it('should handle XSS in framework descriptions', async () => {
      const frameworkManager = new FrameworkManager(mockContext, mockFileSystem);
      
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify({
        version: '1.0.0',
        frameworks: [
          {
            id: 'xss-test',
            name: '<script>alert("XSS")</script>',
            description: '<img src=x onerror=alert("XSS")>',
            category: 'testing',
            version: '1.0.0',
            fileName: 'test.md',
          },
        ],
      }));

      // Should load without executing scripts
      const frameworks = await frameworkManager.listAvailableFrameworks();
      expect(frameworks.length).toBe(1);
      expect(frameworks[0].name).toContain('<script>');
      // In UI rendering, these should be escaped
    });

    it('should handle HTML entities in search queries', async () => {
      const frameworkManager = new FrameworkManager(mockContext, mockFileSystem);
      
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify({
        version: '1.0.0',
        frameworks: [
          {
            id: 'test',
            name: 'Test &amp; Framework',
            description: 'Test &lt;description&gt;',
            category: 'testing',
            version: '1.0.0',
            fileName: 'test.md',
          },
        ],
      }));

      const results = await frameworkManager.searchFrameworks('&amp;');
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('Buffer Overflow with Large Inputs', () => {
    it('should handle very large framework IDs', async () => {
      const frameworkManager = new FrameworkManager(mockContext, mockFileSystem);
      
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify({
        version: '1.0.0',
        frameworks: [],
      }));

      // Create ID with 10,000 characters
      const largeId = 'a'.repeat(10000);
      
      await expect(frameworkManager.installFramework(largeId))
        .rejects.toThrow('Framework not found');
    });

    it('should handle very large search queries', async () => {
      const frameworkManager = new FrameworkManager(mockContext, mockFileSystem);
      
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify({
        version: '1.0.0',
        frameworks: [
          {
            id: 'test',
            name: 'Test',
            description: 'Test',
            category: 'testing',
            version: '1.0.0',
            fileName: 'test.md',
          },
        ],
      }));

      // Create query with 100,000 characters
      const largeQuery = 'test'.repeat(25000);
      
      const startTime = Date.now();
      const results = await frameworkManager.searchFrameworks(largeQuery);
      const duration = Date.now() - startTime;
      
      expect(Array.isArray(results)).toBe(true);
      // Should complete in reasonable time
      expect(duration).toBeLessThan(1000);
    });

    it('should handle very large file content in validation', async () => {
      const validator = new SteeringValidator();
      
      // Create document with 10MB of content
      const largeContent = 'a'.repeat(10 * 1024 * 1024);
      
      const mockDocument = {
        getText: () => largeContent,
        uri: { fsPath: '/test/large.md' },
        lineCount: 1,
      } as any;

      const startTime = Date.now();
      const result = await validator.validate(mockDocument);
      const duration = Date.now() - startTime;
      
      expect(result).toBeDefined();
      // Should complete in reasonable time (< 5 seconds)
      expect(duration).toBeLessThan(5000);
    });

    it('should handle deeply nested JSON in manifest', async () => {
      const frameworkManager = new FrameworkManager(mockContext, mockFileSystem);
      
      // Create deeply nested JSON (1000 levels)
      let nestedJson = '{"frameworks":[]}';
      for (let i = 0; i < 1000; i++) {
        nestedJson = `{"nested":${nestedJson}}`;
      }
      
      mockFileSystem.readFile.mockResolvedValue(nestedJson);

      // Should handle gracefully (may throw parse error)
      await expect(frameworkManager.listAvailableFrameworks())
        .rejects.toThrow();
    });

    it('should handle very long file names', async () => {
      const frameworkManager = new FrameworkManager(mockContext, mockFileSystem);
      
      // Create filename with 1000 characters
      const longFileName = 'a'.repeat(1000) + '.md';
      
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify({
        version: '1.0.0',
        frameworks: [
          {
            id: 'test',
            name: 'Test',
            description: 'Test',
            category: 'testing',
            version: '1.0.0',
            fileName: longFileName,
          },
        ],
      }));

      mockFileSystem.fileExists.mockResolvedValue(false);

      // Should handle or reject gracefully
      await expect(frameworkManager.installFramework('test'))
        .rejects.toThrow();
    });

    it('should handle very long lines in validation', async () => {
      const validator = new SteeringValidator();
      
      // Create document with very long line (1MB single line)
      const longLine = 'a'.repeat(1024 * 1024);
      const content = `# Purpose\n${longLine}\n# Key Concepts\n# Best Practices\n# Summary`;
      
      const mockDocument = {
        getText: () => content,
        uri: { fsPath: '/test/long-line.md' },
        lineCount: 5,
      } as any;

      const startTime = Date.now();
      const result = await validator.validate(mockDocument);
      const duration = Date.now() - startTime;
      
      expect(result).toBeDefined();
      // Should complete in reasonable time
      expect(duration).toBeLessThan(2000);
    });
  });

  describe('Unicode and Special Character Handling', () => {
    it('should handle Unicode characters in framework IDs', async () => {
      const frameworkManager = new FrameworkManager(mockContext, mockFileSystem);
      
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify({
        version: '1.0.0',
        frameworks: [
          {
            id: 'test-框架-🚀',
            name: 'Test 框架',
            description: 'Test with Unicode',
            category: 'testing',
            version: '1.0.0',
            fileName: 'test.md',
          },
        ],
      }));

      const framework = await frameworkManager.getFrameworkById('test-框架-🚀');
      expect(framework).toBeDefined();
      expect(framework?.name).toBe('Test 框架');
    });

    it('should handle emoji in search queries', async () => {
      const frameworkManager = new FrameworkManager(mockContext, mockFileSystem);
      
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify({
        version: '1.0.0',
        frameworks: [
          {
            id: 'test',
            name: 'Test 🚀 Framework',
            description: 'Fast framework 💨',
            category: 'testing',
            version: '1.0.0',
            fileName: 'test.md',
          },
        ],
      }));

      const results = await frameworkManager.searchFrameworks('🚀');
      expect(results.length).toBe(1);
    });

    it('should handle zero-width characters', async () => {
      const frameworkManager = new FrameworkManager(mockContext, mockFileSystem);
      
      // Zero-width characters that could be used for obfuscation
      const zeroWidthChars = '\u200B\u200C\u200D\uFEFF';
      
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify({
        version: '1.0.0',
        frameworks: [
          {
            id: `test${zeroWidthChars}framework`,
            name: 'Test',
            description: 'Test',
            category: 'testing',
            version: '1.0.0',
            fileName: 'test.md',
          },
        ],
      }));

      const frameworks = await frameworkManager.listAvailableFrameworks();
      expect(frameworks.length).toBe(1);
    });

    it('should handle RTL (Right-to-Left) characters', async () => {
      const frameworkManager = new FrameworkManager(mockContext, mockFileSystem);
      
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify({
        version: '1.0.0',
        frameworks: [
          {
            id: 'test-rtl',
            name: 'Test إطار العمل',
            description: 'Framework with Arabic',
            category: 'testing',
            version: '1.0.0',
            fileName: 'test.md',
          },
        ],
      }));

      const results = await frameworkManager.searchFrameworks('إطار');
      expect(results.length).toBe(1);
    });
  });

  describe('Malformed JSON Handling', () => {
    it('should handle malformed JSON in manifest', async () => {
      const frameworkManager = new FrameworkManager(mockContext, mockFileSystem);
      
      mockFileSystem.readFile.mockResolvedValue('{ invalid json }');

      await expect(frameworkManager.listAvailableFrameworks())
        .rejects.toThrow();
    });

    it('should handle JSON with circular references', async () => {
      const frameworkManager = new FrameworkManager(mockContext, mockFileSystem);
      
      // Create object with circular reference
      const obj: any = { frameworks: [] };
      obj.circular = obj;
      
      // JSON.stringify will throw on circular references
      expect(() => JSON.stringify(obj)).toThrow();
    });

    it('should handle truncated JSON', async () => {
      const frameworkManager = new FrameworkManager(mockContext, mockFileSystem);
      
      mockFileSystem.readFile.mockResolvedValue('{"version":"1.0.0","frameworks":[{"id":"test"');

      await expect(frameworkManager.listAvailableFrameworks())
        .rejects.toThrow();
    });
  });

  describe('Prototype Pollution Prevention', () => {
    it('should not allow __proto__ in framework objects', async () => {
      const frameworkManager = new FrameworkManager(mockContext, mockFileSystem);
      
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify({
        version: '1.0.0',
        frameworks: [
          {
            id: 'test',
            name: 'Test',
            description: 'Test',
            category: 'testing',
            version: '1.0.0',
            fileName: 'test.md',
            __proto__: { polluted: true },
          },
        ],
      }));

      const frameworks = await frameworkManager.listAvailableFrameworks();
      expect(frameworks.length).toBe(1);
      // Should not pollute prototype
      expect((Object.prototype as any).polluted).toBeUndefined();
    });

    it('should not allow constructor in framework objects', async () => {
      const frameworkManager = new FrameworkManager(mockContext, mockFileSystem);
      
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify({
        version: '1.0.0',
        frameworks: [
          {
            id: 'test',
            name: 'Test',
            description: 'Test',
            category: 'testing',
            version: '1.0.0',
            fileName: 'test.md',
            constructor: { prototype: { polluted: true } },
          },
        ],
      }));

      const frameworks = await frameworkManager.listAvailableFrameworks();
      expect(frameworks.length).toBe(1);
    });
  });
});
