# Test Data Builders

This directory contains test data builders that provide a fluent API for creating test objects. Builders follow the Builder pattern and make test setup more readable and maintainable.

## Available Builders

### FrameworkBuilder

Creates `Framework` objects for testing framework-related functionality.

**Basic Usage:**
```typescript
import { FrameworkBuilder } from '../builders';

const framework = FrameworkBuilder.create()
  .withId('test-framework')
  .withName('Test Framework')
  .withVersion('1.0.0')
  .build();
```

**Preset Frameworks:**
```typescript
// Create common framework types
const tddBdd = FrameworkBuilder.create().asTddBddFramework().build();
const security = FrameworkBuilder.create().asSecurityFramework().build();
const c4Model = FrameworkBuilder.create().asC4ModelFramework().build();
const azure = FrameworkBuilder.create().asAzureFramework().build();
const devops = FrameworkBuilder.create().asDevOpsFramework().build();
```

**With Dependencies:**
```typescript
const framework = FrameworkBuilder.create()
  .withId('advanced-framework')
  .addDependency('tdd-bdd-strategy')
  .addDependency('security-strategy')
  .build();
```

### SteeringDocumentBuilder

Creates `SteeringItem` objects for testing steering document functionality.

**Basic Usage:**
```typescript
import { SteeringDocumentBuilder } from '../builders';

const steeringDoc = SteeringDocumentBuilder.create()
  .withLabel('custom-doc.md')
  .withCategory(SteeringCategory.Custom)
  .asCustom(true)
  .build();
```

**Preset Documents:**
```typescript
// Create common document types
const product = SteeringDocumentBuilder.create().asProductDocument().build();
const tech = SteeringDocumentBuilder.create().asTechnicalDocument().build();
const structure = SteeringDocumentBuilder.create().asStructureDocument().build();
const tddBdd = SteeringDocumentBuilder.create().asTddBddStrategy().build();
const security = SteeringDocumentBuilder.create().asSecurityStrategy().build();
```

**Category Nodes:**
```typescript
const categoryNode = SteeringDocumentBuilder.create()
  .asCategoryNode('Strategies (Installed)', SteeringCategory.Strategy)
  .build();
```

### ManifestBuilder

Creates `FrameworkManifest` objects for testing manifest loading and parsing.

**Basic Usage:**
```typescript
import { ManifestBuilder, FrameworkBuilder } from '../builders';

const manifest = ManifestBuilder.create()
  .withVersion('1.0.0')
  .addFramework(FrameworkBuilder.create().asTddBddFramework().build())
  .addFramework(FrameworkBuilder.create().asSecurityFramework().build())
  .build();
```

**Using Builder Pattern:**
```typescript
const manifest = ManifestBuilder.create()
  .addFrameworkFromBuilder(FrameworkBuilder.create().asTddBddFramework())
  .addFrameworkFromBuilder(FrameworkBuilder.create().asSecurityFramework())
  .build();
```

**Preset Manifests:**
```typescript
// All strategy frameworks
const fullManifest = ManifestBuilder.create()
  .withAllStrategyFrameworks()
  .build();

// Empty manifest
const emptyManifest = ManifestBuilder.create()
  .asEmpty()
  .build();

// Large manifest (for performance testing)
const largeManifest = ManifestBuilder.create()
  .asLarge(100)
  .build();

// Default manifest (static factory)
const defaultManifest = ManifestBuilder.createDefault().build();
```

**As JSON:**
```typescript
const manifestJson = ManifestBuilder.create()
  .withAllStrategyFrameworks()
  .buildAsJson(true); // pretty-printed
```

### MetadataBuilder

Creates `InstalledFrameworksMetadata` objects for testing installed framework tracking.

**Basic Usage:**
```typescript
import { MetadataBuilder } from '../builders';

const metadata = MetadataBuilder.create()
  .addInstalledFramework('tdd-bdd-strategy', '1.0.0', false)
  .addInstalledFramework('security-strategy', '1.0.0', true)
  .build();
```

**Preset Installations:**
```typescript
// Individual frameworks
const metadata = MetadataBuilder.create()
  .withTddBddInstalled()
  .withSecurityInstalled(true) // customized
  .withC4ModelInstalled()
  .build();

// Recommended frameworks
const recommended = MetadataBuilder.create()
  .withRecommendedFrameworks()
  .build();

// All strategy frameworks
const allFrameworks = MetadataBuilder.create()
  .withAllStrategyFrameworks()
  .build();
```

**Customization States:**
```typescript
// Mixed customization
const mixed = MetadataBuilder.create()
  .withMixedCustomization()
  .build();

// Outdated frameworks
const outdated = MetadataBuilder.create()
  .withOutdatedFrameworks()
  .build();

// Custom dates
const custom = MetadataBuilder.create()
  .addCustomizedFramework(
    'tdd-bdd-strategy',
    '1.0.0',
    '2025-01-01T00:00:00Z',
    '2025-01-15T10:30:00Z'
  )
  .build();
```

**As JSON:**
```typescript
const metadataJson = MetadataBuilder.create()
  .withRecommendedFrameworks()
  .buildAsJson(true); // pretty-printed
```

## Design Patterns

### Fluent API

All builders use a fluent API that returns `this` from each method, allowing method chaining:

```typescript
const framework = FrameworkBuilder.create()
  .withId('test')
  .withName('Test')
  .withVersion('1.0.0')
  .build();
```

### Static Factory Methods

All builders provide a static `create()` method for instantiation:

```typescript
const builder = FrameworkBuilder.create();
```

Some builders also provide preset factory methods:

```typescript
const manifest = ManifestBuilder.createDefault();
const metadata = MetadataBuilder.createDefault();
```

### Immutable Builds

The `build()` method returns a copy of the internal object, not a reference. This ensures that modifying the built object doesn't affect the builder:

```typescript
const builder = FrameworkBuilder.create().withId('test');
const framework1 = builder.build();
const framework2 = builder.withVersion('2.0.0').build();

// framework1 is not affected by the version change
```

## Testing Examples

### Unit Test Example

```typescript
import { FrameworkBuilder } from '../builders';

describe('FrameworkManager', () => {
  it('should install framework', async () => {
    // Arrange
    const framework = FrameworkBuilder.create()
      .asTddBddFramework()
      .build();
    
    // Act
    await frameworkManager.installFramework(framework.id);
    
    // Assert
    expect(await frameworkManager.isInstalled(framework.id)).toBe(true);
  });
});
```

### Integration Test Example

```typescript
import { ManifestBuilder, MetadataBuilder } from '../builders';

describe('Framework Updates', () => {
  it('should detect outdated frameworks', async () => {
    // Arrange
    const manifest = ManifestBuilder.create()
      .withAllStrategyFrameworks()
      .build();
    
    const metadata = MetadataBuilder.create()
      .withOutdatedFrameworks()
      .build();
    
    // Act
    const updates = await frameworkManager.checkForUpdates();
    
    // Assert
    expect(updates).toHaveLength(2);
  });
});
```

### BDD Test Example

```typescript
import { FrameworkBuilder } from '../builders';

Given('a framework is available', function() {
  this.framework = FrameworkBuilder.create()
    .asTddBddFramework()
    .build();
  
  this.manifest = ManifestBuilder.create()
    .addFramework(this.framework)
    .build();
});
```

## Best Practices

1. **Use Preset Methods**: When testing with common frameworks, use preset methods like `asTddBddFramework()` instead of manually setting all properties.

2. **Chain Methods**: Take advantage of the fluent API to make test setup more readable.

3. **Build Once**: Call `build()` only when you need the final object. You can continue chaining methods on the builder after building.

4. **Static Factories**: Use static factory methods like `ManifestBuilder.createDefault()` for common scenarios.

5. **Test Data Isolation**: Each builder creates a new object, so you don't need to worry about test data pollution.

## Adding New Builders

When adding a new builder:

1. Create a new file in `tests/builders/`
2. Implement the builder class with:
   - Constructor with default values
   - Fluent methods that return `this`
   - Preset methods for common scenarios
   - `build()` method that returns a copy
   - Static `create()` factory method
3. Export the builder in `index.ts`
4. Document usage in this README

## Related Documentation

- [Testing Strategy](../../docs/TESTING.md)
- [Framework Models](../../src/models/framework.ts)
- [Steering Models](../../src/models/steering.ts)
