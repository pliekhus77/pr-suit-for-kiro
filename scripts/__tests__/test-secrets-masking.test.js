/**
 * Unit tests for secrets masking validation script
 */

const fs = require('fs');
const path = require('path');
const { checkWorkflowSecretsMasking } = require('../test-secrets-masking');

// Mock workflow content for testing
const mockWorkflows = {
  goodWorkflow: `
name: Good Workflow
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Use secret properly
        run: |
          echo "Using secret: $MY_SECRET"
        env:
          MY_SECRET: \${{ secrets.MY_SECRET }}
  `,
  
  badWorkflowDirectUsage: `
name: Bad Workflow - Direct Usage
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Use secret directly
        run: |
          echo "Token: \${{ secrets.MY_SECRET }}"
  `,
  
  badWorkflowHardcoded: `
name: Bad Workflow - Hardcoded
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Hardcoded secret
        run: |
          TOKEN="ghp_1234567890abcdefghijklmnopqrstuvwxyz"
          echo "Using token: $TOKEN"
  `,
  
  multipleSecretsGood: `
name: Multiple Secrets - Good
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Use multiple secrets
        run: |
          echo "Using secrets..."
          deploy --token "$TOKEN" --key "$API_KEY"
        env:
          TOKEN: \${{ secrets.GITHUB_TOKEN }}
          API_KEY: \${{ secrets.API_KEY }}
  `,
  
  mixedUsage: `
name: Mixed Usage
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Good usage
        run: |
          echo "Token: $TOKEN"
        env:
          TOKEN: \${{ secrets.GITHUB_TOKEN }}
      
      - name: Bad usage
        run: |
          echo "Key: \${{ secrets.API_KEY }}"
  `,
  
  noSecrets: `
name: No Secrets
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: No secrets used
        run: |
          echo "Hello World"
  `
};

describe('checkWorkflowSecretsMasking', () => {
  let tempDir;
  
  beforeEach(() => {
    // Create temporary directory for test files
    tempDir = path.join(__dirname, 'temp-workflows');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  });
  
  afterEach(() => {
    // Clean up temporary files
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
  
  describe('Good Workflows', () => {
    test('should pass for workflow with properly masked secrets', () => {
      const testFile = path.join(tempDir, 'good.yml');
      fs.writeFileSync(testFile, mockWorkflows.goodWorkflow);
      
      const result = checkWorkflowSecretsMasking(testFile);
      
      expect(result.passed).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(result.secretsFound).toBe(1);
    });
    
    test('should pass for workflow with multiple properly masked secrets', () => {
      const testFile = path.join(tempDir, 'multiple-good.yml');
      fs.writeFileSync(testFile, mockWorkflows.multipleSecretsGood);
      
      const result = checkWorkflowSecretsMasking(testFile);
      
      expect(result.passed).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(result.secretsFound).toBe(2);
    });
    
    test('should pass for workflow with no secrets', () => {
      const testFile = path.join(tempDir, 'no-secrets.yml');
      fs.writeFileSync(testFile, mockWorkflows.noSecrets);
      
      const result = checkWorkflowSecretsMasking(testFile);
      
      expect(result.passed).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(result.secretsFound).toBe(0);
    });
  });
  
  describe('Bad Workflows - Direct Secret Usage', () => {
    test('should fail for workflow with direct secret usage', () => {
      const testFile = path.join(tempDir, 'bad-direct.yml');
      fs.writeFileSync(testFile, mockWorkflows.badWorkflowDirectUsage);
      
      const result = checkWorkflowSecretsMasking(testFile);
      
      expect(result.passed).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0].type).toBe('direct-secret-usage');
      expect(result.issues[0].secret).toBe('MY_SECRET');
    });
    
    test('should detect mixed usage (good and bad)', () => {
      const testFile = path.join(tempDir, 'mixed.yml');
      fs.writeFileSync(testFile, mockWorkflows.mixedUsage);
      
      const result = checkWorkflowSecretsMasking(testFile);
      
      expect(result.passed).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.secretsFound).toBe(2);
      
      // Should find the bad usage
      const directUsageIssue = result.issues.find(i => i.type === 'direct-secret-usage');
      expect(directUsageIssue).toBeDefined();
      expect(directUsageIssue.secret).toBe('API_KEY');
    });
  });
  
  describe('Bad Workflows - Hardcoded Secrets', () => {
    test('should detect hardcoded GitHub PAT', () => {
      const testFile = path.join(tempDir, 'hardcoded.yml');
      fs.writeFileSync(testFile, mockWorkflows.badWorkflowHardcoded);
      
      const result = checkWorkflowSecretsMasking(testFile);
      
      expect(result.passed).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
      
      const hardcodedIssue = result.issues.find(i => i.type === 'hardcoded-secret');
      expect(hardcodedIssue).toBeDefined();
      expect(hardcodedIssue.name).toBe('GitHub Personal Access Token');
    });
    
    test('should detect hardcoded AWS access key', () => {
      const workflowWithAWS = `
name: AWS Workflow
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Use AWS
        run: |
          aws configure set aws_access_key_id AKIAIOSFODNN7EXAMPLE
      `;
      
      const testFile = path.join(tempDir, 'aws.yml');
      fs.writeFileSync(testFile, workflowWithAWS);
      
      const result = checkWorkflowSecretsMasking(testFile);
      
      expect(result.passed).toBe(false);
      const awsIssue = result.issues.find(i => i.name === 'AWS Access Key');
      expect(awsIssue).toBeDefined();
    });
    
    test('should detect hardcoded OpenAI API key', () => {
      const workflowWithOpenAI = `
name: OpenAI Workflow
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Use OpenAI
        run: |
          API_KEY="sk-1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKL"
      `;
      
      const testFile = path.join(tempDir, 'openai.yml');
      fs.writeFileSync(testFile, workflowWithOpenAI);
      
      const result = checkWorkflowSecretsMasking(testFile);
      
      expect(result.passed).toBe(false);
      const openaiIssue = result.issues.find(i => i.name === 'OpenAI API Key');
      expect(openaiIssue).toBeDefined();
    });
  });
  
  describe('Edge Cases', () => {
    test('should handle empty workflow file', () => {
      const testFile = path.join(tempDir, 'empty.yml');
      fs.writeFileSync(testFile, '');
      
      const result = checkWorkflowSecretsMasking(testFile);
      
      expect(result.passed).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(result.secretsFound).toBe(0);
    });
    
    test('should handle workflow with comments containing secret patterns', () => {
      const workflowWithComments = `
name: Workflow with Comments
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      # Example: Use \${{ secrets.MY_SECRET }} in env block
      - name: Use secret
        run: |
          echo "Using secret"
        env:
          MY_SECRET: \${{ secrets.MY_SECRET }}
      `;
      
      const testFile = path.join(tempDir, 'comments.yml');
      fs.writeFileSync(testFile, workflowWithComments);
      
      const result = checkWorkflowSecretsMasking(testFile);
      
      expect(result.passed).toBe(true);
      expect(result.secretsFound).toBe(1);
    });
    
    test('should handle secrets passed to actions via with', () => {
      const workflowWithAction = `
name: Workflow with Action
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy
        uses: azure/webapps-deploy@v2
        with:
          app-name: 'my-app'
          publish-profile: \${{ secrets.AZURE_PUBLISH_PROFILE }}
      `;
      
      const testFile = path.join(tempDir, 'action.yml');
      fs.writeFileSync(testFile, workflowWithAction);
      
      const result = checkWorkflowSecretsMasking(testFile);
      
      // Secrets in 'with' blocks are automatically masked by GitHub
      expect(result.passed).toBe(true);
      expect(result.secretsFound).toBe(1);
    });
    
    test('should handle multiline run commands', () => {
      const workflowMultiline = `
name: Multiline Workflow
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Complex command
        run: |
          echo "Step 1"
          echo "Using token: $TOKEN"
          echo "Step 2"
          deploy --token "$TOKEN"
        env:
          TOKEN: \${{ secrets.GITHUB_TOKEN }}
      `;
      
      const testFile = path.join(tempDir, 'multiline.yml');
      fs.writeFileSync(testFile, workflowMultiline);
      
      const result = checkWorkflowSecretsMasking(testFile);
      
      expect(result.passed).toBe(true);
      expect(result.secretsFound).toBe(1);
    });
  });
  
  describe('Issue Details', () => {
    test('should provide detailed issue information', () => {
      const testFile = path.join(tempDir, 'bad.yml');
      fs.writeFileSync(testFile, mockWorkflows.badWorkflowDirectUsage);
      
      const result = checkWorkflowSecretsMasking(testFile);
      
      expect(result.issues[0]).toHaveProperty('type');
      expect(result.issues[0]).toHaveProperty('secret');
      expect(result.issues[0]).toHaveProperty('location');
      expect(result.issues[0]).toHaveProperty('message');
      expect(result.issues[0].message).toContain('MY_SECRET');
    });
  });
  
  describe('Real-World Scenarios', () => {
    test('should validate deploy.yml pattern', () => {
      const deployWorkflow = `
name: Deploy
on:
  release:
    types: [published]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Authenticate
        run: |
          if [ -z "$VSCE_PAT" ]; then
            echo "Secret not configured"
            exit 1
          fi
        env:
          VSCE_PAT: \${{ secrets.VSCE_PAT }}
      
      - name: Publish
        run: |
          vsce publish --pat "$VSCE_PAT"
        env:
          VSCE_PAT: \${{ secrets.VSCE_PAT }}
      `;
      
      const testFile = path.join(tempDir, 'deploy.yml');
      fs.writeFileSync(testFile, deployWorkflow);
      
      const result = checkWorkflowSecretsMasking(testFile);
      
      expect(result.passed).toBe(true);
      expect(result.secretsFound).toBe(2); // Used twice
    });
    
    test('should catch common mistake of echoing secrets', () => {
      const debugWorkflow = `
name: Debug
on: push
jobs:
  debug:
    runs-on: ubuntu-latest
    steps:
      - name: Debug secret
        run: |
          echo "Token: \${{ secrets.DEBUG_TOKEN }}"
      `;
      
      const testFile = path.join(tempDir, 'debug.yml');
      fs.writeFileSync(testFile, debugWorkflow);
      
      const result = checkWorkflowSecretsMasking(testFile);
      
      expect(result.passed).toBe(false);
      expect(result.issues[0].type).toBe('direct-secret-usage');
    });
  });
});

describe('Integration Tests', () => {
  test('should handle non-existent file gracefully', () => {
    expect(() => {
      checkWorkflowSecretsMasking('/non/existent/file.yml');
    }).toThrow();
  });
  
  test('should handle invalid YAML gracefully', () => {
    const tempDir = path.join(__dirname, 'temp-workflows');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const testFile = path.join(tempDir, 'invalid.yml');
    fs.writeFileSync(testFile, 'invalid: yaml: content: [[[');
    
    // Should not throw, just analyze the text content
    const result = checkWorkflowSecretsMasking(testFile);
    expect(result).toHaveProperty('passed');
    expect(result).toHaveProperty('issues');
    expect(result).toHaveProperty('secretsFound');
    
    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});
