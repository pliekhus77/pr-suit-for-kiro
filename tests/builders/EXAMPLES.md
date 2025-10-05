# Test Data Builder Examples

This document provides practical examples of using the test data builders in various testing scenarios.

## Quick Start

```typescript
import { 
  FrameworkBuilder, 
  SteeringDocumentBuilder, 
  ManifestBuilder, 
  MetadataBuilder 
} from '../builders';
```

## Common Patterns

### 1. Creating a Simple Framework

```typescript
const framework = FrameworkBuilder.create()
  .withId('my-framework')
  .withName('My Framework')
  .withDescription('A custom framework for testing')
  .withVersion('1.0.0')
  .build();
```

### 2. Using Preset Frameworks

```typescript
// Create common frameworks quickly
const tddBdd = FrameworkBuilder.create().asTddBddFramework().build();
const security = FrameworkBuilder.create().asSecurityFramework().build();
const c4Model = FrameworkBuilder.create().asC4ModelFramework().build();
```

### 3. Building a Complete Manifest

```typescript
const manifest = ManifestBuilder.create()
  .withVersion('1.0.0')
  .addFrameworkFromBuilder(FrameworkBuilder.create().asTddBddFramework())
  .addFrameworkFromBuilder(FrameworkBuilder.create().asSecurityFramework())
  .addFrameworkFromBuilder(FrameworkBuilder.create().asC4ModelFramework())
  .build();
```

### 4. Creating Installed Framework Metadata

```typescript
const metadata = MetadataBuilder.create()
  .withTddBddInstalled()
  .withSecurityInstalled(true) // customized
  .withC4ModelInstalled()
  .build();
```

## Testing Scenarios

### Scenario 1: Testing Framework Installation

```typescript
describe('Framework Installation', () => {
  it('should install a framework successfully', async () => {
    // Arrange
    const framework = FrameworkBuilder.create()
      .asTddBddFramework()
      .build();
    
    const manifest = ManifestBuilder.create()
      .addFramework(framework)
      .build();
    
    // Mock the manifest loading
    mockFileSystem.readFile.mockResolvedValue(
      JSON.stringify(manifest)
    );
    
    // Act
    await frameworkManager.installFramework('tdd-bdd-strategy');
    
    // Assert
    expect(mockFileSystem.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('strategy-tdd-bdd.md'),
      expect.any(String)
    );
  });
});
```

### Scenario 2: Testing Update Detection

```typescript
describe('Framework Updates', () => {
  it('should detect outdated frameworks', async () => {
    // Arrange
    const manifest = ManifestBuilder.create()
      .addFrameworkFromBuilder(
        FrameworkBuilder.create()
          .asTddBddFramework()
          .withVersion('2.0.0') // Latest version
      )
      .build();
    
    const metadata = MetadataBuilder.create()
      .addOutdatedFramework('tdd-bdd-strategy', '1.0.0') // Installed version
      .build();
    
    // Mock file system
    mockFileSystem.readFile
      .mockResolvedValueOnce(JSON.stringify(manifest))
      .mockResolvedValueOnce(JSON.stringify(metadata));
    
    // Act
    const updates = await frameworkManager.checkForUpdates();
    
    // Assert
    expect(updates).toHaveLength(1);
    expect(updates[0].frameworkId).toBe('tdd-bdd-strategy');
    expect(updates[0].currentVersion).toBe('1.0.0');
    expect(updates[0].latestVersion).toBe('2.0.0');
  });
});
```

### Scenario 3: Testing Customization Detection

```typescript
describe('Framework Customization', () => {
  it('should detect customized frameworks', async () => {
    // Arrange
    const metadata = MetadataBuilder.create()
      .withMixedCustomization()
      .build();
    
    mockFileSystem.readFile.mockResolvedValue(
      JSON.stringify(metadata)
    );
    
    // Act
    const customized = await frameworkManager.getCustomizedFrameworks();
    
    // Assert
    expect(customized.length).toBeGreaterThan(0);
    expect(customized.every(f => f.customized)).toBe(true);
  });
});
```

### Scenario 4: Testing Tree View Population

```typescript
describe('Steering Tree View', () => {
  it('should populate tree with steering documents', async () => {
    // Arrange
    const documents = [
      SteeringDocumentBuilder.create().asProductDocument().build(),
      SteeringDocumentBuilder.create().asTechnicalDocument().build(),
      SteeringDocumentBuilder.create().asTddBddStrategy().build(),
      SteeringDocumentBuilder.create().asSecurityStrategy().build()
    ];
    
    // Mock file system to return these documents
    mockFileSystem.listFiles.mockResolvedValue(
      documents.map(d => d.resourceUri)
    );
    
    // Act
    const treeItems = await treeProvider.getChildren();
    
    // Assert
    expect(treeItems).toHaveLength(4);
  });
});
```

### Scenario 5: Testing Large Data Sets (Performance)

```typescript
describe('Performance Tests', () => {
  it('should handle large manifest efficiently', async () => {
    // Arrange
    const largeManifest = ManifestBuilder.create()
      .asLarge(100) // 100 frameworks
      .build();
    
    mockFileSystem.readFile.mockResolvedValue(
      JSON.stringify(largeManifest)
    );
    
    // Act
    const startTime = Date.now();
    const frameworks = await frameworkManager.listAvailableFrameworks();
    const duration = Date.now() - startTime;
    
    // Assert
    expect(frameworks).toHaveLength(100);
    expect(duration).toBeLessThan(1000); // Should complete in < 1 second
  });
});
```

### Scenario 6: Testing Error Handling

```typescript
describe('Error Handling', () => {
  it('should handle corrupted manifest gracefully', async () => {
    // Arrange
    const corruptedManifest = ManifestBuilder.create()
      .asCorrupted()
      .build();
    
    mockFileSystem.readFile.mockResolvedValue(
      JSON.stringify(corruptedManifest)
    );
    
    // Act & Assert
    await expect(frameworkManager.loadManifest())
      .rejects
      .toThrow('Invalid manifest');
  });
});
```

## BDD Testing Examples

### Example 1: Framework Installation Flow

```typescript
import { FrameworkBuilder, ManifestBuilder } from '../builders';

Given('a framework is available in the library', function() {
  this.framework = FrameworkBuilder.create()
    .asTddBddFramework()
    .build();
  
  this.manifest = ManifestBuilder.create()
    .addFramework(this.framework)
    .build();
  
  // Mock file system
  this.mockFileSystem.readFile.mockResolvedValue(
    JSON.stringify(this.manifest)
  );
});

When('I install the framework', async function() {
  await this.frameworkManager.installFramework(this.framework.id);
});

Then('the framework should be installed', async function() {
  const installed = await this.frameworkManager.isInstalled(this.framework.id);
  expect(installed).toBe(true);
});
```

### Example 2: Workspace Initialization

```typescript
import { MetadataBuilder } from '../builders';

Given('I have a new workspace', function() {
  this.workspacePath = '/test/workspace';
  this.mockFileSystem.directoryExists.mockResolvedValue(false);
});

When('I initialize the workspace with recommended frameworks', async function() {
  await this.workspaceManager.initialize({
    installRecommended: true
  });
});

Then('the recommended frameworks should be installed', async function() {
  const expectedMetadata = MetadataBuilder.create()
    .withRecommendedFrameworks()
    .build();
  
  expect(this.mockFileSystem.writeFile).toHaveBeenCalledWith(
    expect.stringContaining('installed-frameworks.json'),
    expect.stringContaining('tdd-bdd-strategy')
  );
});
```

## Advanced Patterns

### Pattern 1: Chaining Multiple Builders

```typescript
// Create a complete test scenario with all related data
const testScenario = {
  manifest: ManifestBuilder.create()
    .withAllStrategyFrameworks()
    .build(),
  
  metadata: MetadataBuilder.create()
    .withRecommendedFrameworks()
    .build(),
  
  documents: [
    SteeringDocumentBuilder.create().asTddBddStrategy().build(),
    SteeringDocumentBuilder.create().asC4ModelStrategy().build()
  ]
};
```

### Pattern 2: Reusing Builder Configurations

```typescript
// Create a base builder configuration
const baseFramework = FrameworkBuilder.create()
  .withVersion('1.0.0')
  .withCategory(FrameworkCategory.Testing);

// Create variations
const framework1 = baseFramework.withId('test-1').build();
const framework2 = baseFramework.withId('test-2').build();
```

### Pattern 3: Dynamic Test Data Generation

```typescript
// Generate test data based on test parameters
function createTestFrameworks(count: number) {
  return Array.from({ length: count }, (_, i) =>
    FrameworkBuilder.create()
      .withId(`framework-${i}`)
      .withName(`Framework ${i}`)
      .build()
  );
}

// Use in tests
const frameworks = createTestFrameworks(10);
const manifest = ManifestBuilder.create()
  .withFrameworks(frameworks)
  .build();
```

## Tips and Best Practices

1. **Use Preset Methods**: Always prefer preset methods like `asTddBddFramework()` over manually setting all properties.

2. **Build Once, Use Many Times**: You can call `build()` multiple times on the same builder to create multiple objects.

3. **Combine Builders**: Use builders together to create complete test scenarios.

4. **Static Factories**: Use `ManifestBuilder.createDefault()` and `MetadataBuilder.createDefault()` for common scenarios.

5. **JSON Output**: Use `buildAsJson()` when you need to mock file system reads.

6. **Immutability**: Remember that `build()` returns a copy, so you can safely modify the built object without affecting the builder.

## Common Mistakes to Avoid

❌ **Don't forget to call `build()`**
```typescript
const framework = FrameworkBuilder.create().asTddBddFramework(); // Wrong!
const framework = FrameworkBuilder.create().asTddBddFramework().build(); // Correct
```

❌ **Don't reuse built objects across tests**
```typescript
// Wrong - shared state between tests
const sharedFramework = FrameworkBuilder.create().build();

test('test 1', () => {
  sharedFramework.version = '2.0.0'; // Mutates shared object
});

test('test 2', () => {
  expect(sharedFramework.version).toBe('1.0.0'); // Fails!
});

// Correct - create new object for each test
test('test 1', () => {
  const framework = FrameworkBuilder.create().build();
  framework.version = '2.0.0';
});

test('test 2', () => {
  const framework = FrameworkBuilder.create().build();
  expect(framework.version).toBe('1.0.0'); // Passes
});
```

❌ **Don't mix builder patterns**
```typescript
// Inconsistent - mixing direct object creation with builders
const manifest = {
  version: '1.0.0',
  frameworks: [
    FrameworkBuilder.create().build() // Builder
    { id: 'test', name: 'Test', ... } // Direct object
  ]
};

// Consistent - use builders for everything
const manifest = ManifestBuilder.create()
  .addFrameworkFromBuilder(FrameworkBuilder.create())
  .build();
```
