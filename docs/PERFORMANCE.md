# Extension Activation Performance

## Overview

This document describes the performance testing strategy and results for the Pragmatic Rhino SUIT extension activation.

## Performance Targets

| Metric | Target | Rationale |
|--------|--------|-----------|
| **Baseline Activation** | < 500ms | Fast startup for good UX |
| **With 10 Frameworks** | < 1000ms | Reasonable with typical usage |
| **With 50 Frameworks** | < 2000ms | Acceptable for large workspaces |
| **With 100 Frameworks** | < 3000ms | Stress test boundary |
| **Memory Increase (Baseline)** | < 50MB | Efficient memory usage |
| **Memory Increase (50 Frameworks)** | < 100MB | Reasonable for large workspaces |
| **Standard Deviation** | < 200ms | Consistent performance |

## Test Coverage

### 1. Baseline Performance
- **Test:** `Baseline: Extension activation time should be < 500ms`
- **Purpose:** Establish baseline activation time with minimal workspace
- **Success Criteria:** Activation completes in under 500ms

### 2. Scalability Tests
- **Test:** `Performance: Activation with 10 installed frameworks`
- **Purpose:** Test typical workspace with moderate framework usage
- **Success Criteria:** Activation completes in under 1000ms

- **Test:** `Performance: Activation with 50 installed frameworks`
- **Purpose:** Test large workspace with many frameworks
- **Success Criteria:** Activation completes in under 2000ms

- **Test:** `Stress Test: Activation with 100 frameworks`
- **Purpose:** Stress test to identify performance boundaries
- **Success Criteria:** Activation completes in under 3000ms

### 3. Resilience Tests
- **Test:** `Resilience: Activation with corrupted metadata should gracefully degrade`
- **Purpose:** Ensure extension activates even with corrupted metadata
- **Success Criteria:** 
  - Activation completes in under 1000ms
  - Extension remains active despite corruption
  - No crashes or unhandled errors

### 4. Memory Profiling
- **Test:** `Memory: Memory usage during activation should be reasonable`
- **Purpose:** Measure baseline memory consumption
- **Success Criteria:** Memory increase < 50MB

- **Test:** `Memory: Memory usage with 50 frameworks should be reasonable`
- **Purpose:** Measure memory consumption with large workspace
- **Success Criteria:** Memory increase < 100MB with 50 frameworks

### 5. Lazy Loading Verification
- **Test:** `Lazy Loading: Framework manifest should be loaded lazily`
- **Purpose:** Verify manifest is not loaded during activation
- **Success Criteria:**
  - Activation time < 500ms (manifest not loaded)
  - First browse command loads manifest
  - Second browse command uses cached manifest (faster)

### 6. Statistical Analysis
- **Test:** `Statistics: Activation time statistics across multiple runs`
- **Purpose:** Measure consistency and reliability
- **Success Criteria:**
  - Average activation time < 500ms
  - Standard deviation < 200ms (consistent performance)

### 7. Concurrent Operations
- **Test:** `Concurrent Operations: Activation should handle concurrent file operations`
- **Purpose:** Test activation under concurrent file system load
- **Success Criteria:** Activation completes in under 1000ms with concurrent operations

## Implementation Details

### Test File Location
`src/test/suite/activation-performance.test.ts`

### Key Test Helpers

#### `measureActivationTime()`
Measures the time taken to activate the extension:
```typescript
async function measureActivationTime(): Promise<number> {
  const startTime = Date.now();
  const extension = vscode.extensions.getExtension('pragmatic-rhino.pragmatic-rhino-suit');
  if (!extension.isActive) {
    await extension.activate();
  }
  return Date.now() - startTime;
}
```

#### `createTestFrameworks(count: number)`
Creates test framework files and metadata:
```typescript
async function createTestFrameworks(count: number): Promise<void> {
  // Creates framework files in .kiro/steering/
  // Updates installed-frameworks.json metadata
}
```

#### `corruptMetadata()`
Creates invalid metadata to test error handling:
```typescript
async function corruptMetadata(): Promise<void> {
  // Writes invalid JSON to installed-frameworks.json
}
```

#### `getMemoryUsage()`
Captures memory usage metrics:
```typescript
function getMemoryUsage(): { heapUsed: number; heapTotal: number; external: number } {
  const usage = process.memoryUsage();
  return {
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
    external: Math.round(usage.external / 1024 / 1024) // MB
  };
}
```

## Performance Optimization Strategies

### 1. Lazy Loading
- Framework manifest is NOT loaded during activation
- Manifest loads on first use (browse frameworks command)
- Subsequent uses leverage in-memory cache

### 2. Efficient File System Operations
- Minimal file system access during activation
- Batch operations where possible
- Use async/await for non-blocking I/O

### 3. Memory Management
- Cache frequently accessed data
- Avoid loading large files into memory unnecessarily
- Use streams for large file operations

### 4. Graceful Degradation
- Extension activates even with corrupted metadata
- Errors are logged but don't block activation
- User can still use extension features

## Running Performance Tests

### Prerequisites
- VS Code Extension Development Host
- Test workspace with `.kiro/` directory

### Commands
```bash
# Compile tests
npm run compile-tests

# Run all tests (includes performance tests)
npm run test:integration

# Run specific performance test suite
npm test -- --grep "Extension Activation Performance"
```

### Test Execution Time
- Full suite: ~5-10 minutes (includes stress tests)
- Individual tests: 10-60 seconds each
- Stress tests (100 frameworks): ~2 minutes

## Monitoring in Production

### Metrics to Track
1. **Activation Time**: Time from extension load to ready state
2. **Memory Usage**: Heap size after activation
3. **Framework Count**: Number of installed frameworks
4. **Error Rate**: Activation failures or errors

### Telemetry Points
- Extension activation start/end
- Framework manifest load time
- Tree view initialization time
- Command registration time

### Performance Alerts
- Activation time > 1000ms (warning)
- Activation time > 2000ms (critical)
- Memory increase > 100MB (warning)
- Activation failure (critical)

## Continuous Improvement

### Performance Regression Testing
- Run performance tests in CI/CD pipeline
- Compare results against baseline
- Fail build if performance degrades > 20%

### Profiling Tools
- VS Code Extension Profiler
- Node.js built-in profiler
- Chrome DevTools (for webviews)

### Optimization Opportunities
1. Further optimize manifest parsing
2. Implement incremental tree view updates
3. Add worker threads for CPU-intensive operations
4. Optimize file system watchers

## Results Summary

### Test Status
✅ All performance tests implemented and passing
✅ Baseline activation < 500ms
✅ Scalability tests (10, 50, 100 frameworks) passing
✅ Memory usage within acceptable limits
✅ Lazy loading verified
✅ Graceful degradation confirmed
✅ Concurrent operations handled correctly

### Key Findings
- Extension activates quickly even with many frameworks
- Lazy loading strategy is effective
- Memory usage scales linearly with framework count
- Graceful degradation works as expected
- Performance is consistent across multiple runs

### Recommendations
1. Continue monitoring activation time in production
2. Set up automated performance regression testing
3. Consider further optimizations if framework count exceeds 100
4. Implement telemetry to track real-world performance

## References
- [VS Code Extension Performance Best Practices](https://code.visualstudio.com/api/advanced-topics/extension-performance)
- [Node.js Performance Measurement APIs](https://nodejs.org/api/perf_hooks.html)
- [VS Code Extension Testing Guide](https://code.visualstudio.com/api/working-with-extensions/testing-extension)
