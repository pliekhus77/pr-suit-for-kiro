# Test Fixtures

This directory contains pre-built test data fixtures for testing the Framework Steering Management extension. Fixtures are static test data that can be used across multiple tests without needing to build them each time.

## Available Fixtures

### Steering Document Fixtures

#### `validSteeringDocument.md`
A complete, valid steering document with all required sections:
- Purpose
- Key Concepts
- Best Practices
- Anti-Patterns
- Summary

Use this fixture to test validation passes, file operations, and display functionality.

#### `invalidSteeringDocument.md`
A steering document missing required sections (no Purpose, no Summary).

Use this fixture to test validation failures and error handling.

#### `largeSteeringDocument.md`
A steering document larger than 1MB with extensive content.

Use this fixture to test performance with large files, memory handling, and rendering.

#### `customizedFramework.md`
A framework steering document that has been customized by the user (differs from library version).

Use this fixture to test customization detection and update warnings.

### Manifest Fixtures

#### `manifest-100-frameworks.json`
A manifest containing 100 frameworks for performance testing.

Use this fixture to test:
- Manifest loading performance
- Search performance with large datasets
- UI rendering with many items
- Memory usage

#### `manifest-corrupted.json`
A manifest with corrupted/invalid data:
- Invalid JSON structure
- Missing required fields
- Invalid version numbers
- Malformed framework entries

Use this fixture to test error handling and graceful degradation.

### Metadata Fixtures

#### `metadata-50-installed.json`
Metadata for a workspace with 50 installed frameworks.

Use this fixture to test:
- Tree view performance with many items
- Update detection across many frameworks
- Bulk operations
- Memory usage

### Workspace Fixtures

The `workspace-50-frameworks/` directory contains a complete workspace structure with 50 installed frameworks for integration testing.

## Usage

### In Unit Tests

```typescript
import * as fs from 'fs';
import * as path from 'path';

describe('SteeringValidator', () => {
  it('should validate a valid steering document', async () => {
    // Arrange
    const fixturePath = path.join(__dirname, '../fixtures/validSteeringDocument.md');
    const content = fs.readFileSync(fixturePath, 'utf-8');
    
    // Act
    const result = await validator.validateContent(content);
    
    // Assert
    expect(result.isValid).toBe(true);
  });
});
```

### In Integration Tests

```typescript
import * as fs from 'fs';
import * as path from 'path';

describe('Framework Installation', () => {
  it('should handle large steering documents', async () => {
    // Arrange
    const fixturePath = path.join(__dirname, '../fixtures/largeSteeringDocument.md');
    const content = fs.readFileSync(fixturePath, 'utf-8');
    
    // Act
    const startTime = Date.now();
    await frameworkManager.installFramework('large-framework', content);
    const duration = Date.now() - startTime;
    
    // Assert
    expect(duration).toBeLessThan(1000); // Should complete in < 1s
  });
});
```

### In BDD Tests

```typescript
Given('a workspace with 50 installed frameworks', function() {
  const fixturePath = path.join(__dirname, '../fixtures/metadata-50-installed.json');
  this.metadata = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));
});
```

## Fixture Maintenance

### When to Update Fixtures

- When validation rules change
- When manifest schema changes
- When metadata structure changes
- When adding new test scenarios

### How to Update Fixtures

1. Modify the fixture file directly
2. Run tests to ensure they still pass
3. Update this README if fixture purpose changes
4. Commit changes with clear description

### Creating New Fixtures

1. Create the fixture file in this directory
2. Document it in this README
3. Add usage examples
4. Reference it in relevant tests

## Best Practices

1. **Keep Fixtures Realistic**: Fixtures should represent real-world data
2. **Document Purpose**: Clearly document what each fixture tests
3. **Version Control**: Commit fixtures to version control
4. **Avoid Duplication**: Use builders for variations, fixtures for static data
5. **Performance**: Use fixtures for large data sets to avoid build overhead
6. **Isolation**: Each fixture should be independent and self-contained

## Related Documentation

- [Test Builders](../builders/README.md) - For dynamic test data
- [Testing Strategy](../../docs/TESTING.md) - Overall testing approach
- [BDD Tests](../bdd/README.md) - Behavior-driven testing

