const fs = require('fs');
const path = require('path');

let content = `# Large Steering Document for Performance Testing

## Purpose

This is a very large steering document (>1MB) used for performance testing. It contains extensive content to test how the extension handles large files.

The purpose of this document is to provide a realistic test case for performance validation. Large documents can reveal performance bottlenecks in parsing, rendering, and validation logic.

`;

// Generate 100 sections with extensive content
for (let i = 0; i < 100; i++) {
  content += `## Section ${i + 1}: Performance Testing Content

### Subsection ${i + 1}.1: Introduction

This section contains extensive content for performance testing. The goal is to create a document that exceeds 1MB in size to test how the extension handles large steering documents.

`;

  // Add 10 detailed subsections per section
  for (let j = 0; j < 10; j++) {
    content += `#### Detail ${i + 1}.${j + 1}

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

**Example Code Block:**

\`\`\`typescript
function exampleFunction${i}_${j}() {
  const data = {
    id: ${i * 10 + j},
    name: 'Example ${i}.${j}',
    description: 'This is example code for section ${i + 1}, detail ${j + 1}',
    timestamp: new Date().toISOString(),
    metadata: {
      section: ${i + 1},
      detail: ${j + 1},
      category: 'performance-testing'
    }
  };
  return processData(data);
}
\`\`\`

**Best Practice ${i + 1}.${j + 1}:**
Always validate input data before processing. Use type checking and runtime validation to ensure data integrity. This prevents errors and improves system reliability.

**Anti-Pattern ${i + 1}.${j + 1}:**
Don't skip validation assuming data is always correct. This leads to runtime errors and security vulnerabilities.

`;
  }

  content += `### Subsection ${i + 1}.2: Key Concepts

1. **Concept A**: Understanding the fundamentals of performance optimization
2. **Concept B**: Implementing efficient algorithms and data structures
3. **Concept C**: Monitoring and measuring performance metrics
4. **Concept D**: Identifying and resolving performance bottlenecks
5. **Concept E**: Scaling applications for high load scenarios

### Subsection ${i + 1}.3: Implementation Guidelines

\`\`\`typescript
interface PerformanceMetrics${i} {
  responseTime: number;
  throughput: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
}

class PerformanceMonitor${i} {
  private metrics: PerformanceMetrics${i}[] = [];
  
  recordMetric(metric: PerformanceMetrics${i}): void {
    this.metrics.push(metric);
    if (this.metrics.length > 1000) {
      this.metrics.shift();
    }
  }
  
  getAverageResponseTime(): number {
    return this.metrics.reduce((sum, m) => sum + m.responseTime, 0) / this.metrics.length;
  }
}
\`\`\`

`;
}

content += `
## Summary

This large steering document has been generated for performance testing purposes. It contains extensive content across multiple sections to ensure the document exceeds 1MB in size. The extension should handle this document efficiently without performance degradation.

### Key Takeaways

1. Performance testing requires realistic data sizes
2. Large documents should load and render efficiently
3. Validation should complete in reasonable time
4. Memory usage should remain stable
5. User experience should not degrade with large files

## Additional Resources

- Performance Testing Best Practices
- Large File Handling Strategies
- Memory Management Techniques
- Optimization Patterns
- Profiling and Benchmarking Tools
`;

const outputPath = path.join(__dirname, 'largeSteeringDocument.md');
fs.writeFileSync(outputPath, content);

const sizeInMB = (content.length / 1024 / 1024).toFixed(2);
console.log(`Generated large steering document: ${sizeInMB} MB`);
console.log(`File location: ${outputPath}`);
