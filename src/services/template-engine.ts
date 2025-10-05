import * as vscode from 'vscode';
import * as os from 'os';

export interface TemplateVariables {
  [key: string]: string | undefined;
  'feature-name'?: string;
  'date'?: string;
  'author'?: string;
  'project-name'?: string;
}

export class TemplateEngine {
  /**
   * Render a template by substituting variables
   * @param template The template string with {{variable}} placeholders
   * @param variables The variables to substitute
   * @returns The rendered template
   */
  render(template: string, variables: TemplateVariables): string {
    let result = template;

    // Handle escaped variables first (should not be substituted)
    // Replace \{{var}} with a placeholder that won't be matched
    const escapedPlaceholder = '\u0000ESCAPED\u0000';
    result = result.replace(/\\{{([^}]+)}}/g, `${escapedPlaceholder}$1${escapedPlaceholder}`);

    // Substitute all variables
    for (const [key, value] of Object.entries(variables)) {
      if (value !== undefined) {
        // Use a regex that matches {{key}} but not nested {{{{key}}}}
        const regex = new RegExp(`{{${this.escapeRegex(key)}}}`, 'g');
        result = result.replace(regex, value);
      }
    }

    // Restore escaped variables (remove backslash, keep {{var}})
    result = result.replace(new RegExp(`${escapedPlaceholder}([^${escapedPlaceholder}]+)${escapedPlaceholder}`, 'g'), '{{$1}}');

    return result;
  }

  /**
   * Get list of available template variables
   * @returns Array of variable names
   */
  getAvailableVariables(): string[] {
    return ['feature-name', 'date', 'author', 'project-name'];
  }

  /**
   * Get default variables for current context
   * @returns Default template variables
   */
  getDefaultVariables(): TemplateVariables {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    const projectName = workspaceFolders && workspaceFolders.length > 0
      ? workspaceFolders[0].name
      : 'project';

    return {
      'date': new Date().toISOString().split('T')[0],
      'author': this.getAuthor(),
      'project-name': projectName
    };
  }

  /**
   * Escape special regex characters in a string
   * @param str The string to escape
   * @returns The escaped string
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Get the author name from git config or system user
   * @returns The author name
   */
  private getAuthor(): string {
    // In a real implementation, this would try to get git user.name
    // For now, return system username
    return os.userInfo().username;
  }
}
