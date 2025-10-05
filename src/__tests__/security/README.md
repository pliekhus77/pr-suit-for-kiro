# Security Tests

This directory contains security-focused tests for the Pragmatic Rhino SUIT extension.

## Test Coverage

### Input Validation Tests (`input-validation.test.ts`)

Comprehensive security tests covering:

#### 1. Path Traversal Attacks
- Tests for `../` path traversal attempts in framework IDs
- Tests for absolute path attempts (`/etc/passwd`)
- Tests for path traversal in fileName fields
- Tests for Windows-style path traversal (`..\\..\\`)
- Tests for null byte injection in file paths

**Purpose:** Ensure that malicious file paths cannot escape the intended directory structure and access sensitive system files.

#### 2. Search Query Injection Attacks
- Tests for regex special characters (`.`, `*`, `+`, `^`, `$`, etc.)
- Tests for ReDoS (Regular Expression Denial of Service) patterns
- Tests for SQL injection-like patterns (`' OR '1'='1`, `DROP TABLE`, etc.)
- Tests for command injection patterns (`; rm -rf /`, `| cat`, `` `whoami` ``, etc.)

**Purpose:** Ensure that search queries are treated as literal strings and cannot execute malicious code or cause performance issues.

#### 3. XSS (Cross-Site Scripting) Attempts
- Tests for script injection (`<script>alert("XSS")</script>`)
- Tests for event handler injection (`<img src=x onerror=alert("XSS")>`)
- Tests for SVG-based XSS (`<svg onload=alert("XSS")>`)
- Tests for JavaScript protocol (`javascript:alert("XSS")`)
- Tests for HTML entities in search queries

**Purpose:** Ensure that user-provided content is properly escaped and cannot execute malicious scripts in the UI.

#### 4. Buffer Overflow with Large Inputs
- Tests for very large framework IDs (10,000 characters)
- Tests for very large search queries (100,000 characters)
- Tests for very large file content (10MB)
- Tests for deeply nested JSON structures (100 levels)
- Tests for very long file names (1,000 characters)
- Tests for very long lines in validation (1MB single line)

**Purpose:** Ensure that the extension handles large inputs gracefully without crashes, memory exhaustion, or performance degradation.

#### 5. Unicode and Special Character Handling
- Tests for Unicode characters in framework IDs (Chinese, emoji)
- Tests for emoji in search queries
- Tests for zero-width characters (used for obfuscation)
- Tests for RTL (Right-to-Left) characters (Arabic, Hebrew)

**Purpose:** Ensure proper handling of international characters and prevent Unicode-based attacks.

#### 6. Malformed JSON Handling
- Tests for malformed JSON syntax
- Tests for JSON with circular references
- Tests for truncated JSON

**Purpose:** Ensure robust error handling when parsing potentially corrupted or malicious JSON data.

#### 7. Prototype Pollution Prevention
- Tests for `__proto__` injection
- Tests for `constructor` property manipulation

**Purpose:** Prevent prototype pollution attacks that could modify JavaScript object prototypes.

## Running Security Tests

```bash
# Run all security tests
npm test -- src/__tests__/security

# Run specific security test file
npm test -- src/__tests__/security/input-validation.test.ts

# Run with coverage
npm test -- src/__tests__/security --coverage
```

## Test Results Summary

All 27 security tests pass, covering:
- ✅ 5 path traversal attack scenarios
- ✅ 4 injection attack scenarios
- ✅ 3 XSS attack scenarios
- ✅ 6 buffer overflow scenarios
- ✅ 4 Unicode/special character scenarios
- ✅ 3 malformed JSON scenarios
- ✅ 2 prototype pollution scenarios

## Security Best Practices Validated

1. **Input Sanitization**: All user inputs are validated and sanitized
2. **Path Validation**: File paths are checked to prevent directory traversal
3. **Query Safety**: Search queries are treated as literal strings, not regex or code
4. **Size Limits**: Large inputs are handled gracefully with reasonable performance
5. **Encoding**: Unicode and special characters are properly handled
6. **Error Handling**: Malformed data results in clear errors, not crashes
7. **Prototype Safety**: Object prototype pollution is prevented

## Future Enhancements

Consider adding tests for:
- File upload validation (if implemented)
- Authentication/authorization bypass attempts
- Rate limiting and DoS protection
- Cryptographic operations (if implemented)
- Network request validation (if external APIs are used)

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [SABSA Security Framework](../../frameworks/sabsa-framework.md)
- [Security Strategy Guide](../../.kiro/steering/strategy-security.md)
