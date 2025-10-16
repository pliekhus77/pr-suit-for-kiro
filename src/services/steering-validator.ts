import * as vscode from 'vscode';

/**
 * Validation issue interface
 */
export interface ValidationIssue {
  severity: vscode.DiagnosticSeverity;
  message: string;
  range: vscode.Range;
  code?: string;
  quickFix?: vscode.CodeAction;
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  warnings: ValidationIssue[];
}

/**
 * Required sections for steering documents
 */
const REQUIRED_SECTIONS = [
  'Purpose',
  'Key Concepts',
  'Best Practices',
  'Summary'
];

/**
 * Service for validating steering documents against quality standards
 */
export class SteeringValidator {
  /**
   * Validate a steering document
   * @param document The text document to validate
   * @returns Validation result with issues and warnings
   */
  async validate(document: vscode.TextDocument): Promise<ValidationResult> {
    const content = document.getText();
    
    const structureIssues = this.validateStructure(content);
    const contentIssues = this.validateContent(content);
    const formattingIssues = this.validateFormatting(content);
    
    const allIssues = [...structureIssues, ...contentIssues, ...formattingIssues];
    
    // Separate errors and warnings
    const issues = allIssues.filter(issue => issue.severity === vscode.DiagnosticSeverity.Error);
    const warnings = allIssues.filter(issue => issue.severity === vscode.DiagnosticSeverity.Warning);
    
    return {
      isValid: issues.length === 0,
      issues,
      warnings
    };
  }

  /**
   * Validate document structure (required sections)
   * @param content The document content
   * @returns Array of validation issues
   */
  validateStructure(content: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const lines = content.split('\n');
    
    // Find all heading lines
    const headings = lines
      .map((line, index) => ({ line, index }))
      .filter(({ line }) => line.trim().startsWith('#'));
    
    // Check for required sections
    for (const requiredSection of REQUIRED_SECTIONS) {
      const found = headings.some(({ line }) => {
        const headingText = line.replace(/^#+\s*/, '').trim();
        return headingText.toLowerCase().startsWith(requiredSection.toLowerCase());
      });
      
      if (!found) {
        issues.push({
          severity: vscode.DiagnosticSeverity.Error,
          message: `Missing required section: "${requiredSection}"`,
          range: new vscode.Range(0, 0, 0, 0),
          code: 'missing-section'
        });
      }
    }
    
    return issues;
  }

  /**
   * Validate document content (actionable guidance, examples)
   * @param content The document content
   * @returns Array of validation issues
   */
  validateContent(content: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Check for actionable guidance (look for imperative verbs, bullet points, numbered lists)
    const hasActionableContent = this.hasActionableGuidance(content);
    if (!hasActionableContent) {
      issues.push({
        severity: vscode.DiagnosticSeverity.Warning,
        message: 'Document should include actionable guidance (use bullet points, numbered lists, or imperative verbs)',
        range: new vscode.Range(0, 0, 0, 0),
        code: 'no-actionable-guidance'
      });
    }
    
    // Check for examples (code blocks or example sections)
    const hasExamples = this.hasExamples(content);
    if (!hasExamples) {
      issues.push({
        severity: vscode.DiagnosticSeverity.Warning,
        message: 'Document should include examples to illustrate key concepts',
        range: new vscode.Range(0, 0, 0, 0),
        code: 'no-examples'
      });
    }
    
    // Check if document is too short (likely just theory)
    if (content.trim().length < 500) {
      issues.push({
        severity: vscode.DiagnosticSeverity.Warning,
        message: 'Document appears too short. Consider adding more detailed guidance and examples.',
        range: new vscode.Range(0, 0, 0, 0),
        code: 'content-too-short'
      });
    }
    
    return issues;
  }

  /**
   * Validate document formatting (markdown syntax, headings)
   * @param content The document content
   * @returns Array of validation issues
   */
  validateFormatting(content: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const lines = content.split('\n');
    
    // Check for proper heading hierarchy
    const headingIssues = this.validateHeadingHierarchy(lines);
    issues.push(...headingIssues);
    
    // Check for malformed code blocks
    const codeBlockIssues = this.validateCodeBlocks(lines);
    issues.push(...codeBlockIssues);
    
    // Check for broken links
    const linkIssues = this.validateLinks(lines);
    issues.push(...linkIssues);
    
    return issues;
  }

  /**
   * Check if content has actionable guidance
   */
  private hasActionableGuidance(content: string): boolean {
    // Look for bullet points, numbered lists, or imperative verbs
    const actionablePatterns = [
      /^[\s]*[-*+]\s+/m,  // Bullet points
      /^[\s]*\d+\.\s+/m,  // Numbered lists
      /\b(use|implement|create|define|ensure|verify|check|validate|configure|set up|install|deploy)\b/i  // Imperative verbs
    ];
    
    return actionablePatterns.some(pattern => pattern.test(content));
  }

  /**
   * Check if content has examples
   */
  private hasExamples(content: string): boolean {
    // Look for code blocks or "example" sections
    const examplePatterns = [
      /```[\s\S]*?```/,  // Code blocks
      /^#+\s*example/im,  // Example heading
      /\bexample:/i,  // Example label
      /\bfor example\b/i  // "For example" text
    ];
    
    return examplePatterns.some(pattern => pattern.test(content));
  }

  /**
   * Validate heading hierarchy
   */
  private validateHeadingHierarchy(lines: string[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    let previousLevel = 0;
    
    lines.forEach((line, index) => {
      const match = line.match(/^(#+)\s*(.*)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        
        // Check if heading is empty
        if (!text) {
          issues.push({
            severity: vscode.DiagnosticSeverity.Error,
            message: 'Heading cannot be empty',
            range: new vscode.Range(index, 0, index, line.length),
            code: 'empty-heading'
          });
        }
        
        // Check if heading skips levels (e.g., # followed by ###)
        if (level > previousLevel + 1 && previousLevel > 0) {
          issues.push({
            severity: vscode.DiagnosticSeverity.Warning,
            message: `Heading level skipped (from ${previousLevel} to ${level}). Use proper hierarchy.`,
            range: new vscode.Range(index, 0, index, line.length),
            code: 'heading-hierarchy'
          });
        }
        
        previousLevel = level;
      }
    });
    
    return issues;
  }

  /**
   * Validate code blocks
   */
  private validateCodeBlocks(lines: string[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    let inCodeBlock = false;
    let codeBlockStart = -1;
    
    lines.forEach((line, index) => {
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          // Closing code block
          inCodeBlock = false;
        } else {
          // Opening code block
          inCodeBlock = true;
          codeBlockStart = index;
        }
      }
    });
    
    // Check if code block is not closed
    if (inCodeBlock) {
      issues.push({
        severity: vscode.DiagnosticSeverity.Error,
        message: 'Code block is not closed (missing closing ```)',
        range: new vscode.Range(codeBlockStart, 0, codeBlockStart, lines[codeBlockStart].length),
        code: 'unclosed-code-block'
      });
    }
    
    return issues;
  }

  /**
   * Validate links
   */
  private validateLinks(lines: string[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    lines.forEach((line, index) => {
      // Find markdown links [text](url)
      const linkRegex = /\[([^\]]*)\]\(([^)]*)\)/g;
      let match;
      
      while ((match = linkRegex.exec(line)) !== null) {
        const linkText = match[1];
        const linkUrl = match[2];
        
        // Check for empty link text
        if (!linkText.trim()) {
          issues.push({
            severity: vscode.DiagnosticSeverity.Warning,
            message: 'Link has empty text',
            range: new vscode.Range(index, match.index, index, match.index + match[0].length),
            code: 'empty-link-text'
          });
        }
        
        // Check for empty URL
        if (!linkUrl.trim()) {
          issues.push({
            severity: vscode.DiagnosticSeverity.Error,
            message: 'Link has empty URL',
            range: new vscode.Range(index, match.index, index, match.index + match[0].length),
            code: 'empty-link-url'
          });
        }
      }
    });
    
    return issues;
  }
}
