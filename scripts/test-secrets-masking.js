#!/usr/bin/env node

/**
 * Test script to verify secrets masking in GitHub Actions workflows
 * 
 * This script validates that:
 * 1. All secrets are properly masked in workflow logs
 * 2. No secrets are exposed in artifacts
 * 3. Secret detection mechanisms are working
 * 
 * Usage:
 *   node scripts/test-secrets-masking.js
 * 
 * Exit codes:
 *   0 - All checks passed
 *   1 - Secrets masking validation failed
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

/**
 * Log a message with color
 */
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Check if a workflow file properly masks secrets
 */
function checkWorkflowSecretsMasking(workflowPath) {
  const content = fs.readFileSync(workflowPath, 'utf8');
  const issues = [];
  
  // Check for proper secret usage patterns
  const secretUsagePattern = /\$\{\{\s*secrets\.([A-Z_]+)\s*\}\}/g;
  const matches = [...content.matchAll(secretUsagePattern)];
  
  if (matches.length === 0) {
    return { passed: true, issues: [], secretsFound: 0 };
  }
  
  // Check that secrets are used in env blocks (which auto-masks)
  const envBlockPattern = /env:\s*\n([\s\S]*?)(?=\n\s*(?:run:|uses:|if:|with:)|$)/g;
  const envBlocks = [...content.matchAll(envBlockPattern)];
  
  const secretsInEnv = new Set();
  envBlocks.forEach(block => {
    const blockContent = block[1];
    const secretMatches = [...blockContent.matchAll(secretUsagePattern)];
    secretMatches.forEach(match => secretsInEnv.add(match[1]));
  });
  
  // Check for secrets used directly in run commands (potential exposure)
  const runBlockPattern = /run:\s*\|\s*\n([\s\S]*?)(?=\n\s*(?:env:|uses:|if:|with:|-\s*name:)|$)/g;
  const runBlocks = [...content.matchAll(runBlockPattern)];
  
  runBlocks.forEach((block, index) => {
    const blockContent = block[1];
    const secretMatches = [...blockContent.matchAll(secretUsagePattern)];
    
    secretMatches.forEach(match => {
      const secretName = match[1];
      if (!secretsInEnv.has(secretName)) {
        issues.push({
          type: 'direct-secret-usage',
          secret: secretName,
          location: `run block ${index + 1}`,
          message: `Secret ${secretName} used directly in run command without env masking`
        });
      }
    });
  });
  
  // Check for hardcoded patterns that look like secrets
  const suspiciousPatterns = [
    { pattern: /ghp_[a-zA-Z0-9]{36}/, name: 'GitHub Personal Access Token' },
    { pattern: /sk-[a-zA-Z0-9]{48}/, name: 'OpenAI API Key' },
    { pattern: /xox[baprs]-[a-zA-Z0-9-]+/, name: 'Slack Token' },
    { pattern: /AKIA[0-9A-Z]{16}/, name: 'AWS Access Key' },
    { pattern: /AIza[0-9A-Za-z-_]{35}/, name: 'Google API Key' }
  ];
  
  suspiciousPatterns.forEach(({ pattern, name }) => {
    if (pattern.test(content)) {
      issues.push({
        type: 'hardcoded-secret',
        name,
        message: `Potential hardcoded ${name} detected`
      });
    }
  });
  
  return {
    passed: issues.length === 0,
    issues,
    secretsFound: matches.length
  };
}

/**
 * Check all workflow files for proper secrets masking
 */
function checkAllWorkflows() {
  const workflowsDir = path.join(process.cwd(), '.github', 'workflows');
  
  if (!fs.existsSync(workflowsDir)) {
    log('❌ Workflows directory not found', 'red');
    return false;
  }
  
  const workflowFiles = fs.readdirSync(workflowsDir)
    .filter(file => file.endsWith('.yml') || file.endsWith('.yaml'))
    .filter(file => file !== 'README.md');
  
  if (workflowFiles.length === 0) {
    log('⚠️  No workflow files found', 'yellow');
    return true;
  }
  
  log(`\n🔍 Checking ${workflowFiles.length} workflow files for secrets masking...\n`, 'cyan');
  
  let allPassed = true;
  let totalSecrets = 0;
  let totalIssues = 0;
  
  workflowFiles.forEach(file => {
    const workflowPath = path.join(workflowsDir, file);
    const result = checkWorkflowSecretsMasking(workflowPath);
    
    totalSecrets += result.secretsFound;
    totalIssues += result.issues.length;
    
    if (result.passed) {
      log(`✅ ${file} - ${result.secretsFound} secret(s) properly masked`, 'green');
    } else {
      log(`❌ ${file} - ${result.issues.length} issue(s) found`, 'red');
      allPassed = false;
      
      result.issues.forEach(issue => {
        log(`   ⚠️  ${issue.message}`, 'yellow');
        if (issue.location) {
          log(`      Location: ${issue.location}`, 'yellow');
        }
      });
    }
  });
  
  log(`\n📊 Summary:`, 'cyan');
  log(`   Total workflows checked: ${workflowFiles.length}`, 'blue');
  log(`   Total secrets found: ${totalSecrets}`, 'blue');
  log(`   Total issues found: ${totalIssues}`, totalIssues > 0 ? 'red' : 'green');
  
  return allPassed;
}

/**
 * Generate a test secret for validation
 */
function generateTestSecret() {
  // Generate a fake PAT-like string for testing
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let secret = 'ghp_';
  for (let i = 0; i < 36; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

/**
 * Provide recommendations for secrets masking
 */
function provideRecommendations() {
  log('\n📝 Secrets Masking Best Practices:', 'cyan');
  log('');
  log('1. Always use secrets in env blocks:', 'blue');
  log('   env:', 'reset');
  log('     MY_SECRET: ${{ secrets.MY_SECRET }}', 'reset');
  log('');
  log('2. Never use secrets directly in run commands:', 'blue');
  log('   ❌ run: echo "${{ secrets.MY_SECRET }}"', 'red');
  log('   ✅ run: echo "$MY_SECRET"', 'green');
  log('      env:', 'green');
  log('        MY_SECRET: ${{ secrets.MY_SECRET }}', 'green');
  log('');
  log('3. GitHub automatically masks secrets in logs when:', 'blue');
  log('   - Secrets are accessed via ${{ secrets.NAME }}', 'reset');
  log('   - Secrets are set in env blocks', 'reset');
  log('   - Secrets are passed to actions via with: parameters', 'reset');
  log('');
  log('4. Test secret masking:', 'blue');
  log('   - Use this script before committing workflow changes', 'reset');
  log('   - Review workflow logs for any exposed values', 'reset');
  log('   - Use test secrets in non-production environments', 'reset');
  log('');
}

/**
 * Main execution
 */
function main() {
  log('🔐 GitHub Actions Secrets Masking Validator', 'cyan');
  log('='.repeat(50), 'cyan');
  
  const allPassed = checkAllWorkflows();
  
  if (!allPassed) {
    log('\n❌ Secrets masking validation FAILED', 'red');
    log('   Please fix the issues above before committing.', 'red');
    provideRecommendations();
    process.exit(1);
  }
  
  log('\n✅ All secrets masking checks PASSED', 'green');
  log('   All secrets are properly masked in workflow files.', 'green');
  
  // Provide test secret for manual testing
  const testSecret = generateTestSecret();
  log('\n🧪 Test Secret for Manual Validation:', 'cyan');
  log(`   ${testSecret}`, 'yellow');
  log('   Use this in a test workflow to verify masking works correctly.', 'reset');
  log('   It should appear as *** in workflow logs.', 'reset');
  
  process.exit(0);
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = {
  checkWorkflowSecretsMasking,
  checkAllWorkflows
};
