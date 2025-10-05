import { TemplateEngine, TemplateVariables } from '../template-engine';

describe('TemplateEngine', () => {
  let templateEngine: TemplateEngine;

  beforeEach(() => {
    templateEngine = new TemplateEngine();
  });

  describe('render', () => {
    describe('single variable substitution', () => {
      it('should substitute {{feature-name}} with provided value', () => {
        const template = 'Feature: {{feature-name}}';
        const variables: TemplateVariables = { 'feature-name': 'user-authentication' };

        const result = templateEngine.render(template, variables);

        expect(result).toBe('Feature: user-authentication');
      });

      it('should substitute {{date}} with provided value', () => {
        const template = 'Created on: {{date}}';
        const variables: TemplateVariables = { 'date': '2025-01-15' };

        const result = templateEngine.render(template, variables);

        expect(result).toBe('Created on: 2025-01-15');
      });

      it('should substitute {{author}} with provided value', () => {
        const template = 'Author: {{author}}';
        const variables: TemplateVariables = { 'author': 'John Doe' };

        const result = templateEngine.render(template, variables);

        expect(result).toBe('Author: John Doe');
      });

      it('should substitute {{project-name}} with provided value', () => {
        const template = 'Project: {{project-name}}';
        const variables: TemplateVariables = { 'project-name': 'my-awesome-project' };

        const result = templateEngine.render(template, variables);

        expect(result).toBe('Project: my-awesome-project');
      });
    });

    describe('multiple variables in single template', () => {
      it('should substitute all variables when multiple are present', () => {
        const template = 'Feature: {{feature-name}}\nAuthor: {{author}}\nDate: {{date}}';
        const variables: TemplateVariables = {
          'feature-name': 'payment-processing',
          'author': 'Jane Smith',
          'date': '2025-01-20'
        };

        const result = templateEngine.render(template, variables);

        expect(result).toBe('Feature: payment-processing\nAuthor: Jane Smith\nDate: 2025-01-20');
      });

      it('should substitute same variable multiple times in template', () => {
        const template = '{{feature-name}} is a great feature. We love {{feature-name}}!';
        const variables: TemplateVariables = { 'feature-name': 'search' };

        const result = templateEngine.render(template, variables);

        expect(result).toBe('search is a great feature. We love search!');
      });

      it('should handle all four standard variables together', () => {
        const template = '# {{feature-name}}\n\n**Project:** {{project-name}}\n**Author:** {{author}}\n**Date:** {{date}}';
        const variables: TemplateVariables = {
          'feature-name': 'api-gateway',
          'project-name': 'microservices',
          'author': 'Bob Johnson',
          'date': '2025-02-01'
        };

        const result = templateEngine.render(template, variables);

        expect(result).toBe('# api-gateway\n\n**Project:** microservices\n**Author:** Bob Johnson\n**Date:** 2025-02-01');
      });
    });

    describe('undefined variable handling', () => {
      it('should leave undefined variable as-is in template', () => {
        const template = 'Feature: {{feature-name}}, Status: {{status}}';
        const variables: TemplateVariables = { 'feature-name': 'notifications' };

        const result = templateEngine.render(template, variables);

        expect(result).toBe('Feature: notifications, Status: {{status}}');
      });

      it('should handle template with only undefined variables', () => {
        const template = '{{undefined-var1}} and {{undefined-var2}}';
        const variables: TemplateVariables = {};

        const result = templateEngine.render(template, variables);

        expect(result).toBe('{{undefined-var1}} and {{undefined-var2}}');
      });

      it('should not substitute variable with undefined value', () => {
        const template = 'Name: {{name}}';
        const variables: TemplateVariables = { 'name': undefined };

        const result = templateEngine.render(template, variables);

        expect(result).toBe('Name: {{name}}');
      });
    });

    describe('malformed variable syntax handling', () => {
      it('should leave single curly brace as-is', () => {
        const template = 'This is {not-a-variable}';
        const variables: TemplateVariables = { 'not-a-variable': 'test' };

        const result = templateEngine.render(template, variables);

        expect(result).toBe('This is {not-a-variable}');
      });

      it('should leave triple curly braces as-is', () => {
        const template = 'This is {{{triple}}}';
        const variables: TemplateVariables = { 'triple': 'test' };

        const result = templateEngine.render(template, variables);

        expect(result).toBe('This is {{{triple}}}');
      });

      it('should leave unclosed variable syntax as-is', () => {
        const template = 'This is {{unclosed';
        const variables: TemplateVariables = { 'unclosed': 'test' };

        const result = templateEngine.render(template, variables);

        expect(result).toBe('This is {{unclosed');
      });

      it('should leave unopened variable syntax as-is', () => {
        const template = 'This is unopened}}';
        const variables: TemplateVariables = { 'unopened': 'test' };

        const result = templateEngine.render(template, variables);

        expect(result).toBe('This is unopened}}');
      });

      it('should handle empty variable name', () => {
        const template = 'This is {{}}';
        const variables: TemplateVariables = { '': 'empty' };

        const result = templateEngine.render(template, variables);

        // Empty variable name should be substituted if provided
        expect(result).toBe('This is empty');
      });
    });

    describe('escaped variables', () => {
      it('should not substitute escaped variable \\{{var}}', () => {
        const template = 'This is \\{{feature-name}} not substituted';
        const variables: TemplateVariables = { 'feature-name': 'test' };

        const result = templateEngine.render(template, variables);

        expect(result).toBe('This is {{feature-name}} not substituted');
      });

      it('should handle mix of escaped and non-escaped variables', () => {
        const template = 'Substitute {{name}} but not \\{{name}}';
        const variables: TemplateVariables = { 'name': 'Alice' };

        const result = templateEngine.render(template, variables);

        expect(result).toBe('Substitute Alice but not {{name}}');
      });

      it('should handle multiple escaped variables', () => {
        const template = 'Keep \\{{var1}} and \\{{var2}} as-is';
        const variables: TemplateVariables = { 'var1': 'test1', 'var2': 'test2' };

        const result = templateEngine.render(template, variables);

        expect(result).toBe('Keep {{var1}} and {{var2}} as-is');
      });

      it('should handle escaped variable at start of template', () => {
        const template = '\\{{feature-name}} is escaped';
        const variables: TemplateVariables = { 'feature-name': 'test' };

        const result = templateEngine.render(template, variables);

        expect(result).toBe('{{feature-name}} is escaped');
      });

      it('should handle escaped variable at end of template', () => {
        const template = 'Escaped at end: \\{{feature-name}}';
        const variables: TemplateVariables = { 'feature-name': 'test' };

        const result = templateEngine.render(template, variables);

        expect(result).toBe('Escaped at end: {{feature-name}}');
      });
    });

    describe('nested variables', () => {
      it('should handle nested variables {{{{var}}}} gracefully', () => {
        const template = 'Nested: {{{{feature-name}}}}';
        const variables: TemplateVariables = { 'feature-name': 'test' };

        const result = templateEngine.render(template, variables);

        // Should leave outer braces and substitute inner
        expect(result).toBe('Nested: {{test}}');
      });

      it('should handle triple nested variables', () => {
        const template = '{{{{{{var}}}}}}';
        const variables: TemplateVariables = { 'var': 'value' };

        const result = templateEngine.render(template, variables);

        // Should substitute innermost variable
        expect(result).toBe('{{{{value}}}}');
      });

      it('should handle nested with different variables', () => {
        const template = '{{outer-{{inner}}}}';
        const variables: TemplateVariables = { 'inner': 'test', 'outer-test': 'result' };

        const result = templateEngine.render(template, variables);

        // This is malformed, should leave as-is or handle gracefully
        // The inner {{inner}} won't match our pattern
        expect(result).toContain('{{');
      });
    });

    describe('template with no variables', () => {
      it('should return template unchanged when no variables present', () => {
        const template = 'This is a plain text template with no variables.';
        const variables: TemplateVariables = { 'feature-name': 'test' };

        const result = templateEngine.render(template, variables);

        expect(result).toBe('This is a plain text template with no variables.');
      });

      it('should return empty string unchanged', () => {
        const template = '';
        const variables: TemplateVariables = { 'feature-name': 'test' };

        const result = templateEngine.render(template, variables);

        expect(result).toBe('');
      });

      it('should return multiline template unchanged when no variables', () => {
        const template = 'Line 1\nLine 2\nLine 3';
        const variables: TemplateVariables = {};

        const result = templateEngine.render(template, variables);

        expect(result).toBe('Line 1\nLine 2\nLine 3');
      });
    });

    describe('special characters in variable values', () => {
      it('should handle special regex characters in variable value', () => {
        const template = 'Pattern: {{pattern}}';
        const variables: TemplateVariables = { 'pattern': '$1.00 + $2.00 = $3.00' };

        const result = templateEngine.render(template, variables);

        expect(result).toBe('Pattern: $1.00 + $2.00 = $3.00');
      });

      it('should handle newlines in variable value', () => {
        const template = 'Description: {{description}}';
        const variables: TemplateVariables = { 'description': 'Line 1\nLine 2\nLine 3' };

        const result = templateEngine.render(template, variables);

        expect(result).toBe('Description: Line 1\nLine 2\nLine 3');
      });

      it('should handle quotes in variable value', () => {
        const template = 'Quote: {{quote}}';
        const variables: TemplateVariables = { 'quote': 'He said "Hello" and \'Goodbye\'' };

        const result = templateEngine.render(template, variables);

        expect(result).toBe('Quote: He said "Hello" and \'Goodbye\'');
      });

      it('should handle backslashes in variable value', () => {
        const template = 'Path: {{path}}';
        const variables: TemplateVariables = { 'path': 'C:\\Users\\Test\\Documents' };

        const result = templateEngine.render(template, variables);

        expect(result).toBe('Path: C:\\Users\\Test\\Documents');
      });

      it('should handle unicode characters in variable value', () => {
        const template = 'Message: {{message}}';
        const variables: TemplateVariables = { 'message': 'Hello 世界 🌍' };

        const result = templateEngine.render(template, variables);

        expect(result).toBe('Message: Hello 世界 🌍');
      });

      it('should handle HTML/XML in variable value', () => {
        const template = 'HTML: {{html}}';
        const variables: TemplateVariables = { 'html': '<div class="test">Content</div>' };

        const result = templateEngine.render(template, variables);

        expect(result).toBe('HTML: <div class="test">Content</div>');
      });

      it('should handle curly braces in variable value', () => {
        const template = 'Code: {{code}}';
        const variables: TemplateVariables = { 'code': 'function() { return {}; }' };

        const result = templateEngine.render(template, variables);

        expect(result).toBe('Code: function() { return {}; }');
      });
    });

    describe('edge cases', () => {
      it('should handle variable name with hyphens', () => {
        const template = '{{my-custom-variable}}';
        const variables: TemplateVariables = { 'my-custom-variable': 'value' };

        const result = templateEngine.render(template, variables);

        expect(result).toBe('value');
      });

      it('should handle variable name with underscores', () => {
        const template = '{{my_custom_variable}}';
        const variables: TemplateVariables = { 'my_custom_variable': 'value' };

        const result = templateEngine.render(template, variables);

        expect(result).toBe('value');
      });

      it('should handle variable name with numbers', () => {
        const template = '{{var123}}';
        const variables: TemplateVariables = { 'var123': 'value' };

        const result = templateEngine.render(template, variables);

        expect(result).toBe('value');
      });

      it('should handle very long variable value', () => {
        const template = 'Long: {{long}}';
        const longValue = 'a'.repeat(10000);
        const variables: TemplateVariables = { 'long': longValue };

        const result = templateEngine.render(template, variables);

        expect(result).toBe(`Long: ${longValue}`);
      });

      it('should handle template with many variables', () => {
        const template = '{{v1}} {{v2}} {{v3}} {{v4}} {{v5}} {{v6}} {{v7}} {{v8}} {{v9}} {{v10}}';
        const variables: TemplateVariables = {
          'v1': '1', 'v2': '2', 'v3': '3', 'v4': '4', 'v5': '5',
          'v6': '6', 'v7': '7', 'v8': '8', 'v9': '9', 'v10': '10'
        };

        const result = templateEngine.render(template, variables);

        expect(result).toBe('1 2 3 4 5 6 7 8 9 10');
      });
    });
  });

  describe('getAvailableVariables', () => {
    it('should return list of available variable names', () => {
      const variables = templateEngine.getAvailableVariables();

      expect(variables).toEqual(['feature-name', 'date', 'author', 'project-name']);
    });

    it('should return array with correct length', () => {
      const variables = templateEngine.getAvailableVariables();

      expect(variables).toHaveLength(4);
    });

    it('should include feature-name variable', () => {
      const variables = templateEngine.getAvailableVariables();

      expect(variables).toContain('feature-name');
    });

    it('should include date variable', () => {
      const variables = templateEngine.getAvailableVariables();

      expect(variables).toContain('date');
    });

    it('should include author variable', () => {
      const variables = templateEngine.getAvailableVariables();

      expect(variables).toContain('author');
    });

    it('should include project-name variable', () => {
      const variables = templateEngine.getAvailableVariables();

      expect(variables).toContain('project-name');
    });
  });

  describe('getDefaultVariables', () => {
    it('should return default variables object', () => {
      const variables = templateEngine.getDefaultVariables();

      expect(variables).toBeDefined();
      expect(typeof variables).toBe('object');
    });

    it('should include date in ISO format', () => {
      const variables = templateEngine.getDefaultVariables();

      expect(variables['date']).toBeDefined();
      expect(variables['date']).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should include author', () => {
      const variables = templateEngine.getDefaultVariables();

      expect(variables['author']).toBeDefined();
      expect(typeof variables['author']).toBe('string');
      expect(variables['author']!.length).toBeGreaterThan(0);
    });

    it('should include project-name', () => {
      const variables = templateEngine.getDefaultVariables();

      expect(variables['project-name']).toBeDefined();
      expect(typeof variables['project-name']).toBe('string');
    });
  });
});
