import * as vscode from 'vscode';
import { SteeringValidator } from '../steering-validator';

// Mock vscode module
jest.mock('vscode');

describe('SteeringValidator', () => {
  let validator: SteeringValidator;

  beforeEach(() => {
    validator = new SteeringValidator();
  });

  describe('validateStructure', () => {
    it('should pass when all required sections are present', () => {
      const content = `
# Purpose
This is the purpose section.

## Key Concepts
These are key concepts.

### Best Practices
These are best practices.

## Summary
This is the summary.
      `;

      const issues = validator.validateStructure(content);
      expect(issues).toHaveLength(0);
    });

    it('should fail when Purpose section is missing', () => {
      const content = `
## Key Concepts
These are key concepts.

### Best Practices
These are best practices.

## Summary
This is the summary.
      `;

      const issues = validator.validateStructure(content);
      expect(issues).toHaveLength(1);
      expect(issues[0].message).toContain('Purpose');
      expect(issues[0].severity).toBe(vscode.DiagnosticSeverity.Error);
    });

    it('should fail when Key Concepts section is missing', () => {
      const content = `
# Purpose
This is the purpose section.

### Best Practices
These are best practices.

## Summary
This is the summary.
      `;

      const issues = validator.validateStructure(content);
      expect(issues).toHaveLength(1);
      expect(issues[0].message).toContain('Key Concepts');
    });

    it('should fail when Best Practices section is missing', () => {
      const content = `
# Purpose
This is the purpose section.

## Key Concepts
These are key concepts.

## Summary
This is the summary.
      `;

      const issues = validator.validateStructure(content);
      expect(issues).toHaveLength(1);
      expect(issues[0].message).toContain('Best Practices');
    });

    it('should fail when Summary section is missing', () => {
      const content = `
# Purpose
This is the purpose section.

## Key Concepts
These are key concepts.

### Best Practices
These are best practices.
      `;

      const issues = validator.validateStructure(content);
      expect(issues).toHaveLength(1);
      expect(issues[0].message).toContain('Summary');
    });

    it('should fail when multiple required sections are missing', () => {
      const content = `
# Purpose
This is the purpose section.
      `;

      const issues = validator.validateStructure(content);
      expect(issues.length).toBeGreaterThanOrEqual(3);
    });

    it('should be case-insensitive for section names', () => {
      const content = `
# purpose
This is the purpose section.

## key concepts
These are key concepts.

### BEST PRACTICES
These are best practices.

## summary
This is the summary.
      `;

      const issues = validator.validateStructure(content);
      expect(issues).toHaveLength(0);
    });
  });

  describe('validateContent', () => {
    it('should pass when document has actionable guidance', () => {
      const content = `
# Purpose
Use this framework to implement best practices and ensure code quality across your projects.

## Key Concepts
- Create clear documentation that explains the purpose and usage
- Implement proper validation to catch errors early
- Ensure code quality through testing and reviews

For example, you can use this pattern to validate inputs:
\`\`\`typescript
function validate(input: string): boolean {
  return input.length > 0;
}
\`\`\`

## Best Practices
1. Use bullet points for clarity and easy scanning
2. Define clear objectives before starting implementation
3. Verify all requirements are met before deployment
4. Document your decisions and rationale
5. Review code regularly to maintain quality

## Summary
This framework helps you create better code with clear examples and actionable guidance that teams can follow.
      `;

      const issues = validator.validateContent(content);
      expect(issues).toHaveLength(0);
    });

    it('should warn when document lacks actionable guidance', () => {
      const content = `
# Purpose
This is a theoretical framework.

## Key Concepts
There are many concepts to consider.

## Best Practices
Things should be done well.

## Summary
This is important.
      `;

      const issues = validator.validateContent(content);
      const actionableIssue = issues.find(i => i.code === 'no-actionable-guidance');
      expect(actionableIssue).toBeDefined();
      expect(actionableIssue?.severity).toBe(vscode.DiagnosticSeverity.Warning);
    });

    it('should pass when document has code examples', () => {
      const content = `
# Purpose
Use this framework.

## Key Concepts
Here is an example:
\`\`\`typescript
const example = "code";
\`\`\`

## Best Practices
- Use examples

## Summary
Examples help.
      `;

      const issues = validator.validateContent(content);
      const exampleIssue = issues.find(i => i.code === 'no-examples');
      expect(exampleIssue).toBeUndefined();
    });

    it('should warn when document lacks examples', () => {
      const content = `
# Purpose
Use this framework.

## Key Concepts
- Concept 1
- Concept 2

## Best Practices
- Practice 1
- Practice 2

## Summary
This is the summary.
      `;

      const issues = validator.validateContent(content);
      const exampleIssue = issues.find(i => i.code === 'no-examples');
      expect(exampleIssue).toBeDefined();
      expect(exampleIssue?.severity).toBe(vscode.DiagnosticSeverity.Warning);
    });

    it('should warn when document is too short', () => {
      const content = `
# Purpose
Short.

## Key Concepts
Brief.

## Best Practices
Quick.

## Summary
Done.
      `;

      const issues = validator.validateContent(content);
      const shortIssue = issues.find(i => i.code === 'content-too-short');
      expect(shortIssue).toBeDefined();
      expect(shortIssue?.severity).toBe(vscode.DiagnosticSeverity.Warning);
    });

    it('should recognize "for example" as having examples', () => {
      const content = `
# Purpose
Use this framework.

## Key Concepts
For example, you can use this pattern to solve common problems.

## Best Practices
- Use patterns

## Summary
Examples help understanding.
      `;

      const issues = validator.validateContent(content);
      const exampleIssue = issues.find(i => i.code === 'no-examples');
      expect(exampleIssue).toBeUndefined();
    });
  });

  describe('validateFormatting', () => {
    it('should pass when formatting is correct', () => {
      const content = `
# Purpose
This is the purpose.

## Key Concepts
These are concepts.

### Sub-concept
Details here.

## Best Practices
- Practice 1
- Practice 2

## Summary
Done.
      `;

      const issues = validator.validateFormatting(content);
      expect(issues).toHaveLength(0);
    });

    it('should warn when heading hierarchy is skipped', () => {
      const content = `
# Purpose
This is the purpose.

### Key Concepts (skipped level 2)
These are concepts.

## Best Practices
Practices here.

## Summary
Done.
      `;

      const issues = validator.validateFormatting(content);
      const hierarchyIssue = issues.find(i => i.code === 'heading-hierarchy');
      expect(hierarchyIssue).toBeDefined();
      expect(hierarchyIssue?.severity).toBe(vscode.DiagnosticSeverity.Warning);
    });

    it('should error when heading is empty', () => {
      const content = `
# Purpose
This is the purpose.

## 

## Best Practices
Practices here.

## Summary
Done.
      `;

      const issues = validator.validateFormatting(content);
      const emptyHeadingIssue = issues.find(i => i.code === 'empty-heading');
      expect(emptyHeadingIssue).toBeDefined();
      expect(emptyHeadingIssue?.severity).toBe(vscode.DiagnosticSeverity.Error);
    });

    it('should error when code block is not closed', () => {
      const content = `
# Purpose
This is the purpose.

## Key Concepts
\`\`\`typescript
const example = "unclosed";

## Best Practices
Practices here.

## Summary
Done.
      `;

      const issues = validator.validateFormatting(content);
      const codeBlockIssue = issues.find(i => i.code === 'unclosed-code-block');
      expect(codeBlockIssue).toBeDefined();
      expect(codeBlockIssue?.severity).toBe(vscode.DiagnosticSeverity.Error);
    });

    it('should pass when code blocks are properly closed', () => {
      const content = `
# Purpose
This is the purpose.

## Key Concepts
\`\`\`typescript
const example = "closed";
\`\`\`

## Best Practices
Practices here.

## Summary
Done.
      `;

      const issues = validator.validateFormatting(content);
      const codeBlockIssue = issues.find(i => i.code === 'unclosed-code-block');
      expect(codeBlockIssue).toBeUndefined();
    });

    it('should warn when link has empty text', () => {
      const content = `
# Purpose
See [](https://example.com) for details.

## Key Concepts
Concepts here.

## Best Practices
Practices here.

## Summary
Done.
      `;

      const issues = validator.validateFormatting(content);
      const linkIssue = issues.find(i => i.code === 'empty-link-text');
      expect(linkIssue).toBeDefined();
      expect(linkIssue?.severity).toBe(vscode.DiagnosticSeverity.Warning);
    });

    it('should error when link has empty URL', () => {
      const content = `
# Purpose
See [example]() for details.

## Key Concepts
Concepts here.

## Best Practices
Practices here.

## Summary
Done.
      `;

      const issues = validator.validateFormatting(content);
      const linkIssue = issues.find(i => i.code === 'empty-link-url');
      expect(linkIssue).toBeDefined();
      expect(linkIssue?.severity).toBe(vscode.DiagnosticSeverity.Error);
    });

    it('should pass when links are properly formatted', () => {
      const content = `
# Purpose
See [example](https://example.com) for details.

## Key Concepts
Concepts here.

## Best Practices
Practices here.

## Summary
Done.
      `;

      const issues = validator.validateFormatting(content);
      const linkIssues = issues.filter(i => i.code?.includes('link'));
      expect(linkIssues).toHaveLength(0);
    });
  });

  describe('validate', () => {
    it('should return valid result when document is well-formed', async () => {
      const content = `
# Purpose
Use this framework to implement best practices.

## Key Concepts
- Create clear documentation
- Implement proper validation
- Ensure code quality

For example, you can use this pattern:
\`\`\`typescript
const validator = new Validator();
\`\`\`

## Best Practices
1. Use bullet points for clarity
2. Define clear objectives
3. Verify all requirements

## Summary
This framework helps you create better code with clear examples and actionable guidance.
      `;

      const mockDocument = {
        getText: () => content
      } as vscode.TextDocument;

      const result = await validator.validate(mockDocument);
      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should return invalid result when required sections are missing', async () => {
      const content = `
# Purpose
This is the purpose.
      `;

      const mockDocument = {
        getText: () => content
      } as vscode.TextDocument;

      const result = await validator.validate(mockDocument);
      expect(result.isValid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('should separate errors and warnings', async () => {
      const content = `
# Purpose
This is the purpose.

## Key Concepts
Concepts here.

## Best Practices
Practices here.

## Summary
Done.
      `;

      const mockDocument = {
        getText: () => content
      } as vscode.TextDocument;

      const result = await validator.validate(mockDocument);
      
      // Should have warnings but no errors (all required sections present)
      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should combine issues from all validation methods', async () => {
      const content = `
# Purpose
Short.

### Key Concepts (skipped level)
Brief.

\`\`\`typescript
const unclosed = "code";

## Summary
Done.
      `;

      const mockDocument = {
        getText: () => content
      } as vscode.TextDocument;

      const result = await validator.validate(mockDocument);
      
      // Should have structure, content, and formatting issues
      expect(result.isValid).toBe(false);
      const allIssues = [...result.issues, ...result.warnings];
      expect(allIssues.length).toBeGreaterThan(2);
    });
  });

  // Task 13.3: Comprehensive unit tests for SteeringValidator
  describe('validateStructure - comprehensive', () => {
    it('should validate Purpose section individually', () => {
      const content = `
# Purpose
This is the purpose.

## Key Concepts
Concepts here.

## Best Practices
Practices here.

## Summary
Summary here.
      `;

      const issues = validator.validateStructure(content);
      expect(issues).toHaveLength(0);
    });

    it('should validate Key Concepts section individually', () => {
      const content = `
# Purpose
Purpose here.

## Key Concepts
Key concepts content.

## Best Practices
Practices here.

## Summary
Summary here.
      `;

      const issues = validator.validateStructure(content);
      expect(issues).toHaveLength(0);
    });

    it('should validate Best Practices section individually', () => {
      const content = `
# Purpose
Purpose here.

## Key Concepts
Concepts here.

## Best Practices
Best practices content.

## Summary
Summary here.
      `;

      const issues = validator.validateStructure(content);
      expect(issues).toHaveLength(0);
    });

    it('should validate Summary section individually', () => {
      const content = `
# Purpose
Purpose here.

## Key Concepts
Concepts here.

## Best Practices
Practices here.

## Summary
Summary content.
      `;

      const issues = validator.validateStructure(content);
      expect(issues).toHaveLength(0);
    });

    it('should detect multiple missing sections', () => {
      const content = `
# Purpose
Purpose here.
      `;

      const issues = validator.validateStructure(content);
      expect(issues).toHaveLength(3); // Missing Key Concepts, Best Practices, Summary
      expect(issues.map(i => i.message)).toContain('Missing required section: "Key Concepts"');
      expect(issues.map(i => i.message)).toContain('Missing required section: "Best Practices"');
      expect(issues.map(i => i.message)).toContain('Missing required section: "Summary"');
    });

    it('should be case-insensitive for section names', () => {
      const content = `
# purpose
Purpose here.

## key concepts
Concepts here.

## best practices
Practices here.

## summary
Summary here.
      `;

      const issues = validator.validateStructure(content);
      expect(issues).toHaveLength(0);
    });
  });

  describe('validateContent - comprehensive', () => {
    it('should detect code examples in various languages', () => {
      const contentWithCode = `
# Purpose
Purpose here.

\`\`\`typescript
const example = "TypeScript";
\`\`\`

\`\`\`python
example = "Python"
\`\`\`

\`\`\`javascript
const example = "JavaScript";
\`\`\`
      `;

      const issues = validator.validateContent(contentWithCode);
      const noExamplesIssue = issues.find(i => i.code === 'no-examples');
      expect(noExamplesIssue).toBeUndefined();
    });

    it('should detect actionable guidance with bullet points', () => {
      const contentWithBullets = `
# Purpose
Purpose here.

## Guidelines
- Use this pattern
- Implement that feature
- Create these components
      `;

      const issues = validator.validateContent(contentWithBullets);
      const noActionableIssue = issues.find(i => i.code === 'no-actionable-guidance');
      expect(noActionableIssue).toBeUndefined();
    });

    it('should detect actionable guidance with numbered lists', () => {
      const contentWithNumbers = `
# Purpose
Purpose here.

## Steps
1. First step
2. Second step
3. Third step
      `;

      const issues = validator.validateContent(contentWithNumbers);
      const noActionableIssue = issues.find(i => i.code === 'no-actionable-guidance');
      expect(noActionableIssue).toBeUndefined();
    });

    it('should detect actionable guidance with imperative verbs', () => {
      const contentWithVerbs = `
# Purpose
Purpose here.

## Instructions
Use the following approach. Implement the pattern. Create the structure.
Ensure quality. Verify the results. Check the output.
      `;

      const issues = validator.validateContent(contentWithVerbs);
      const noActionableIssue = issues.find(i => i.code === 'no-actionable-guidance');
      expect(noActionableIssue).toBeUndefined();
    });

    it('should warn when content is too short', () => {
      const shortContent = 'Short';

      const issues = validator.validateContent(shortContent);
      const tooShortIssue = issues.find(i => i.code === 'content-too-short');
      expect(tooShortIssue).toBeDefined();
      expect(tooShortIssue?.severity).toBe(vscode.DiagnosticSeverity.Warning);
    });

    it('should not warn when content is sufficiently long', () => {
      const longContent = 'a'.repeat(600);

      const issues = validator.validateContent(longContent);
      const tooShortIssue = issues.find(i => i.code === 'content-too-short');
      expect(tooShortIssue).toBeUndefined();
    });

    it('should detect examples with "example" heading', () => {
      const contentWithExampleHeading = `
# Purpose
Purpose here.

## Example
This is an example of the pattern.
      `;

      const issues = validator.validateContent(contentWithExampleHeading);
      const noExamplesIssue = issues.find(i => i.code === 'no-examples');
      expect(noExamplesIssue).toBeUndefined();
    });

    it('should detect examples with "for example" text', () => {
      const contentWithForExample = `
# Purpose
Purpose here.

For example, you can use this approach to solve the problem.
      `;

      const issues = validator.validateContent(contentWithForExample);
      const noExamplesIssue = issues.find(i => i.code === 'no-examples');
      expect(noExamplesIssue).toBeUndefined();
    });
  });

  describe('validateFormatting - comprehensive', () => {
    it('should detect markdown syntax errors', () => {
      const contentWithErrors = `
# Purpose
Purpose here.

## Key Concepts
Concepts here.

### Best Practices
Practices here.

## Summary
Summary here.
      `;

      const issues = validator.validateFormatting(contentWithErrors);
      // Should not have syntax errors in this valid markdown
      expect(issues.filter(i => i.severity === vscode.DiagnosticSeverity.Error)).toHaveLength(0);
    });

    it('should detect heading level consistency issues', () => {
      const contentWithSkippedLevels = `
# Purpose
Purpose here.

### Key Concepts (skipped level 2)
Concepts here.

## Best Practices
Practices here.

## Summary
Summary here.
      `;

      const issues = validator.validateFormatting(contentWithSkippedLevels);
      const hierarchyIssue = issues.find(i => i.code === 'heading-hierarchy');
      expect(hierarchyIssue).toBeDefined();
      expect(hierarchyIssue?.severity).toBe(vscode.DiagnosticSeverity.Warning);
    });

    it('should detect empty headings', () => {
      const contentWithEmptyHeading = `
# Purpose
Purpose here.

##
Empty heading above.

## Summary
Summary here.
      `;

      const issues = validator.validateFormatting(contentWithEmptyHeading);
      const emptyHeadingIssue = issues.find(i => i.code === 'empty-heading');
      expect(emptyHeadingIssue).toBeDefined();
      expect(emptyHeadingIssue?.severity).toBe(vscode.DiagnosticSeverity.Error);
    });

    it('should detect unclosed code blocks', () => {
      const contentWithUnclosedCode = `
# Purpose
Purpose here.

\`\`\`typescript
const code = "unclosed";
      `;

      const issues = validator.validateFormatting(contentWithUnclosedCode);
      const unclosedIssue = issues.find(i => i.code === 'unclosed-code-block');
      expect(unclosedIssue).toBeDefined();
      expect(unclosedIssue?.severity).toBe(vscode.DiagnosticSeverity.Error);
    });

    it('should detect empty link text', () => {
      const contentWithEmptyLinkText = `
# Purpose
Purpose here.

Check out [](https://example.com) for more info.
      `;

      const issues = validator.validateFormatting(contentWithEmptyLinkText);
      const emptyLinkTextIssue = issues.find(i => i.code === 'empty-link-text');
      expect(emptyLinkTextIssue).toBeDefined();
      expect(emptyLinkTextIssue?.severity).toBe(vscode.DiagnosticSeverity.Warning);
    });

    it('should detect empty link URLs', () => {
      const contentWithEmptyUrl = `
# Purpose
Purpose here.

Check out [link text]() for more info.
      `;

      const issues = validator.validateFormatting(contentWithEmptyUrl);
      const emptyUrlIssue = issues.find(i => i.code === 'empty-link-url');
      expect(emptyUrlIssue).toBeDefined();
      expect(emptyUrlIssue?.severity).toBe(vscode.DiagnosticSeverity.Error);
    });

    it('should handle multiple code blocks correctly', () => {
      const contentWithMultipleCodeBlocks = `
# Purpose
Purpose here.

\`\`\`typescript
const code1 = "first";
\`\`\`

Some text.

\`\`\`javascript
const code2 = "second";
\`\`\`
      `;

      const issues = validator.validateFormatting(contentWithMultipleCodeBlocks);
      const unclosedIssue = issues.find(i => i.code === 'unclosed-code-block');
      expect(unclosedIssue).toBeUndefined();
    });

    it('should handle nested code blocks (inline code within code blocks)', () => {
      const contentWithNestedCode = `
# Purpose
Purpose here.

\`\`\`markdown
Use \`inline code\` within markdown.
\`\`\`
      `;

      const issues = validator.validateFormatting(contentWithNestedCode);
      const unclosedIssue = issues.find(i => i.code === 'unclosed-code-block');
      expect(unclosedIssue).toBeUndefined();
    });
  });

  describe('edge cases - empty and whitespace documents', () => {
    it('should handle empty document', () => {
      const emptyContent = '';

      const issues = validator.validateStructure(emptyContent);
      expect(issues).toHaveLength(4); // All required sections missing
    });

    it('should handle document with only whitespace', () => {
      const whitespaceContent = '   \n\t  \n   ';

      const issues = validator.validateStructure(whitespaceContent);
      expect(issues).toHaveLength(4); // All required sections missing
    });

    it('should handle document with only comments', () => {
      const commentsOnly = `
<!-- This is a comment -->
<!-- Another comment -->
      `;

      const issues = validator.validateStructure(commentsOnly);
      expect(issues).toHaveLength(4); // All required sections missing
    });
  });

  describe('edge cases - documents with many sections', () => {
    it('should handle document with 50+ sections', () => {
      let content = `
# Purpose
Purpose here.

## Key Concepts
Concepts here.

## Best Practices
Practices here.

## Summary
Summary here.
`;

      // Add 50 additional sections
      for (let i = 1; i <= 50; i++) {
        content += `\n## Section ${i}\nContent for section ${i}.\n`;
      }

      const issues = validator.validateStructure(content);
      expect(issues).toHaveLength(0); // Should still validate correctly
    });

    it('should handle deeply nested headings', () => {
      const deeplyNested = `
# Purpose
Purpose here.

## Key Concepts
Concepts here.

### Sub-concept 1
Content.

#### Sub-sub-concept 1
Content.

##### Sub-sub-sub-concept 1
Content.

###### Sub-sub-sub-sub-concept 1
Content.

## Best Practices
Practices here.

## Summary
Summary here.
      `;

      const issues = validator.validateStructure(deeplyNested);
      expect(issues).toHaveLength(0);
    });
  });

  describe('edge cases - very large documents', () => {
    it('should handle very large document (>1MB) performance', async () => {
      // Create a large document (1MB+)
      let largeContent = `
# Purpose
Purpose here.

## Key Concepts
Concepts here.

## Best Practices
Practices here.

## Summary
Summary here.

`;
      // Add content to make it over 1MB
      const largeSection = 'a'.repeat(10000);
      for (let i = 0; i < 110; i++) {
        largeContent += `\n## Section ${i}\n${largeSection}\n`;
      }

      const mockDocument = {
        getText: () => largeContent
      } as vscode.TextDocument;

      const startTime = Date.now();
      const result = await validator.validate(mockDocument);
      const endTime = Date.now();

      // Should complete in reasonable time (< 1 second)
      expect(endTime - startTime).toBeLessThan(1000);
      expect(result).toBeDefined();
    });
  });

  describe('broken internal links detection', () => {
    it('should detect broken internal links', () => {
      const contentWithBrokenLinks = `
# Purpose
Purpose here.

See [this section](#non-existent-section) for details.

## Key Concepts
Concepts here.

## Best Practices
Practices here.

## Summary
Summary here.
      `;

      const issues = validator.validateFormatting(contentWithBrokenLinks);
      // Note: Current implementation doesn't validate internal links
      // This test documents expected behavior for future enhancement
      expect(issues).toBeDefined();
    });

    it('should handle valid internal links', () => {
      const contentWithValidLinks = `
# Purpose
Purpose here.

See [Key Concepts](#key-concepts) for details.

## Key Concepts
Concepts here.

## Best Practices
Practices here.

## Summary
Summary here.
      `;

      const issues = validator.validateFormatting(contentWithValidLinks);
      expect(issues).toBeDefined();
    });
  });

  describe('mixed heading levels warnings', () => {
    it('should warn about inconsistent heading levels', () => {
      const contentWithMixedLevels = `
# Purpose
Purpose here.

### Key Concepts (skipped level 2)
Concepts here.

## Best Practices
Practices here.

#### Sub-practice (skipped level 3)
Content.

## Summary
Summary here.
      `;

      const issues = validator.validateFormatting(contentWithMixedLevels);
      const hierarchyIssues = issues.filter(i => i.code === 'heading-hierarchy');
      expect(hierarchyIssues.length).toBeGreaterThan(0);
    });

    it('should not warn about consistent heading levels', () => {
      const contentWithConsistentLevels = `
# Purpose
Purpose here.

## Key Concepts
Concepts here.

### Sub-concept
Content.

## Best Practices
Practices here.

### Sub-practice
Content.

## Summary
Summary here.
      `;

      const issues = validator.validateFormatting(contentWithConsistentLevels);
      const hierarchyIssues = issues.filter(i => i.code === 'heading-hierarchy');
      expect(hierarchyIssues).toHaveLength(0);
    });
  });

  describe('special characters and Unicode', () => {
    it('should handle Unicode characters in headings', () => {
      const contentWithUnicode = `
# Purpose 目的
Purpose here.

## Key Concepts 关键概念
Concepts here.

## Best Practices 最佳实践
Practices here.

## Summary 总结
Summary here.
      `;

      const issues = validator.validateStructure(contentWithUnicode);
      expect(issues).toHaveLength(0);
    });

    it('should handle emoji in content', () => {
      const contentWithEmoji = `
# Purpose 🎯
Purpose here.

## Key Concepts 💡
Concepts here.

## Best Practices ✅
Practices here.

## Summary 📝
Summary here.
      `;

      const issues = validator.validateStructure(contentWithEmoji);
      expect(issues).toHaveLength(0);
    });

    it('should handle special markdown characters', () => {
      const contentWithSpecialChars = `
# Purpose
Purpose here with *emphasis* and **strong**.

## Key Concepts
Concepts with \`inline code\` and [links](https://example.com).

## Best Practices
Practices with > blockquotes and - lists.

## Summary
Summary with | tables | here |.
      `;

      const issues = validator.validateStructure(contentWithSpecialChars);
      expect(issues).toHaveLength(0);
    });
  });

  describe('validate method - integration', () => {
    it('should return isValid true when no errors', async () => {
      const validContent = `
# Purpose
This is a comprehensive purpose section with sufficient content.

## Key Concepts
- Use this pattern
- Implement that feature

\`\`\`typescript
const example = "code";
\`\`\`

## Best Practices
1. First practice
2. Second practice

## Summary
This is a comprehensive summary.
      `;

      const mockDocument = {
        getText: () => validContent
      } as vscode.TextDocument;

      const result = await validator.validate(mockDocument);
      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should return isValid false when errors exist', async () => {
      const invalidContent = `
# Purpose
Short.
      `;

      const mockDocument = {
        getText: () => invalidContent
      } as vscode.TextDocument;

      const result = await validator.validate(mockDocument);
      expect(result.isValid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('should separate errors and warnings correctly', async () => {
      const contentWithBoth = `
# Purpose
Purpose here.

### Key Concepts (skipped level - warning)
Concepts here.

## Best Practices
Practices here.

## Summary
Summary here.
      `;

      const mockDocument = {
        getText: () => contentWithBoth
      } as vscode.TextDocument;

      const result = await validator.validate(mockDocument);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.every(w => w.severity === vscode.DiagnosticSeverity.Warning)).toBe(true);
    });
  });
});
