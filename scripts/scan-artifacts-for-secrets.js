#!/usr/bin/env node

/**
 * Scan artifacts for exposed secrets
 * 
 * This script scans build artifacts (VSIX files, test results, coverage reports)
 * for accidentally exposed secrets or sensitive information.
 * 
 * Usage:
 *   node scripts/scan-artifacts-for-secrets.js <artifact-path>
 * 
 * Exit codes:
 *   0 - No secrets found
 *   1 - Secrets detected or scan failed
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Secret patterns to detect
 */
const SECRET_PATTERNS = [
  {
    name: 'GitHub Personal Access Token',
    pattern: /ghp_[a-zA-Z0-9]{36}/g,
    severity: 'critical'
  },
  {
    name: 'GitHub OAuth Token',
    pattern: /gho_[a-zA-Z0-9]{36}/g,
    severity: 'critical'
  },
  {
    name: 'GitHub App Token',
    pattern: /ghs_[a-zA-Z0-9]{36}/g,
    severity: 'critical'
  },
  {
    name: 'GitHub Refresh Token',
    pattern: /ghr_[a-zA-Z0-9]{36}/g,
    severity: 'critical'
  },
  {
    name: 'VS Code Marketplace PAT',
    pattern: /[a-z0-9]{52}/g, // VSCE PAT format
    severity: 'critical',
    context: true // Requires context check
  },
  {
    name: 'OpenAI API Key',
    pattern: /sk-[a-zA-Z0-9]{48}/g,
    severity: 'high'
  },
  {
    name: 'Slack Token',
    pattern: /xox[baprs]-[a-zA-Z0-9-]+/g,
    severity: 'high'
  },
  {
    name: 'AWS Access Key',
    pattern: /AKIA[0-9A-Z]{16}/g,
    severity: 'critical'
  },
  {
    name: 'AWS Secret Key',
    pattern: /[A-Za-z0-9/+=]{40}/g,
    severity: 'critical',
    context: true
  },
  {
    name: 'Google API Key',
    pattern: /AIza[0-9A-Za-z-_]{35}/g,
    severity: 'high'
  },
  {
    name: 'Azure Storage Key',
    pattern: /[A-Za-z0-9+/]{88}==/g,
    severity: 'critical',
    context: true
  },
  {
    name: 'Private Key',
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
    severity: 'critical'
  },
  {
    name: 'Generic Secret (high entropy)',
    pattern: /(?:secret|password|token|key|api[_-]?key)[\s:=]+['"]?([a-zA-Z0-9+/=]{32,})['"]?/gi,
    severity: 'medium',
    context: true
  }
];

/**
 * Scan a text file for secrets
 */
function scanTextFile(filePath, relativePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const findings = [];
  
  SECRET_PATTERNS.forEach(({ name, pattern, severity, context }) => {
    const matches = [...content.matchAll(pattern)];
    
    matches.forEach(match => {
      const value = match[0];
      const index = match.index;
      
      // Get context around the match
      const lineStart = content.lastIndexOf('\n', index) + 1;
      const lineEnd = content.indexOf('\n', index);
      const line = content.substring(lineStart, lineEnd !== -1 ? lineEnd : content.length);
      const lineNumber = content.substring(0, index).split('\n').length;
      
      // Skip if it's a known false positive
      if (isFalsePositive(value, line, name)) {
        return;
      }
      
      findings.push({
        file: relativePath,
        line: lineNumber,
        column: index - lineStart + 1,
        type: name,
        severity,
        value: maskSecret(value),
        context: line.trim()
      });
    });
  });
  
  return findings;
}

/**
 * Check if a match is a false positive
 */
function isFalsePositive(value, context, type) {
  // Skip test fixtures and examples
  if (context.includes('example') || context.includes('test') || context.includes('mock')) {
    return true;
  }
  
  // Skip documentation
  if (context.includes('TODO') || context.includes('FIXME') || context.includes('XXX')) {
    return true;
  }
  
  // Skip placeholder values
  const placeholders = ['your-token-here', 'replace-me', 'placeholder', 'dummy'];
  if (placeholders.some(p => value.toLowerCase().includes(p))) {
    return true;
  }
  
  return false;
}

/**
 * Mask a secret for display
 */
function maskSecret(secret) {
  if (secret.length <= 8) {
    return '***';
  }
  return secret.substring(0, 4) + '***' + secret.substring(secret.length - 4);
}

/**
 * Scan a VSIX file for secrets
 */
function scanVsixFile(vsixPath) {
  const findings = [];
  const tempDir = path.join(process.cwd(), '.temp-vsix-scan');
  
  try {
    // Create temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tempDir, { recursive: true });
    
    // Extract VSIX (it's a ZIP file)
    log(`📦 Extracting VSIX file...`, 'cyan');
    execSync(`unzip -q "${vsixPath}" -d "${tempDir}"`, { stdio: 'pipe' });
    
    // Scan all extracted files
    const filesToScan = getAllFiles(tempDir);
    log(`🔍 Scanning ${filesToScan.length} files...`, 'cyan');
    
    filesToScan.forEach(file => {
      const relativePath = path.relative(tempDir, file);
      
      // Skip binary files
      if (isBinaryFile(file)) {
        return;
      }
      
      const fileFindings = scanTextFile(file, relativePath);
      findings.push(...fileFindings);
    });
    
  } finally {
    // Cleanup
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
  
  return findings;
}

/**
 * Get all files recursively
 */
function getAllFiles(dir) {
  const files = [];
  
  function traverse(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    
    entries.forEach(entry => {
      const fullPath = path.join(currentPath, entry.name);
      
      if (entry.isDirectory()) {
        traverse(fullPath);
      } else {
        files.push(fullPath);
      }
    });
  }
  
  traverse(dir);
  return files;
}

/**
 * Check if a file is binary
 */
function isBinaryFile(filePath) {
  const binaryExtensions = [
    '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg',
    '.woff', '.woff2', '.ttf', '.eot',
    '.zip', '.gz', '.tar', '.vsix',
    '.exe', '.dll', '.so', '.dylib'
  ];
  
  const ext = path.extname(filePath).toLowerCase();
  return binaryExtensions.includes(ext);
}

/**
 * Scan an artifact directory
 */
function scanArtifactDirectory(artifactPath) {
  const findings = [];
  
  if (!fs.existsSync(artifactPath)) {
    throw new Error(`Artifact path does not exist: ${artifactPath}`);
  }
  
  const stat = fs.statSync(artifactPath);
  
  if (stat.isFile()) {
    // Single file
    if (path.extname(artifactPath) === '.vsix') {
      return scanVsixFile(artifactPath);
    } else if (!isBinaryFile(artifactPath)) {
      return scanTextFile(artifactPath, path.basename(artifactPath));
    }
  } else if (stat.isDirectory()) {
    // Directory of artifacts
    const files = getAllFiles(artifactPath);
    
    files.forEach(file => {
      const relativePath = path.relative(artifactPath, file);
      
      if (path.extname(file) === '.vsix') {
        const vsixFindings = scanVsixFile(file);
        findings.push(...vsixFindings);
      } else if (!isBinaryFile(file)) {
        const fileFindings = scanTextFile(file, relativePath);
        findings.push(...fileFindings);
      }
    });
  }
  
  return findings;
}

/**
 * Format findings report
 */
function formatFindings(findings) {
  if (findings.length === 0) {
    return;
  }
  
  log('\n🚨 SECRETS DETECTED IN ARTIFACTS', 'red');
  log('='.repeat(60), 'red');
  
  // Group by severity
  const critical = findings.filter(f => f.severity === 'critical');
  const high = findings.filter(f => f.severity === 'high');
  const medium = findings.filter(f => f.severity === 'medium');
  
  if (critical.length > 0) {
    log(`\n❌ CRITICAL (${critical.length}):`, 'red');
    critical.forEach(f => printFinding(f));
  }
  
  if (high.length > 0) {
    log(`\n⚠️  HIGH (${high.length}):`, 'yellow');
    high.forEach(f => printFinding(f));
  }
  
  if (medium.length > 0) {
    log(`\n⚡ MEDIUM (${medium.length}):`, 'blue');
    medium.forEach(f => printFinding(f));
  }
}

/**
 * Print a single finding
 */
function printFinding(finding) {
  log(`\n  📄 ${finding.file}:${finding.line}:${finding.column}`, 'cyan');
  log(`     Type: ${finding.type}`, 'reset');
  log(`     Value: ${finding.value}`, 'yellow');
  log(`     Context: ${finding.context}`, 'reset');
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    log('❌ Usage: node scan-artifacts-for-secrets.js <artifact-path>', 'red');
    log('   artifact-path: Path to VSIX file or artifact directory', 'reset');
    process.exit(1);
  }
  
  const artifactPath = args[0];
  
  log('🔐 Artifact Security Scanner', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`\n📂 Scanning: ${artifactPath}\n`, 'blue');
  
  try {
    const findings = scanArtifactDirectory(artifactPath);
    
    if (findings.length === 0) {
      log('✅ No secrets detected in artifacts', 'green');
      log('   All artifacts are safe to publish.', 'green');
      process.exit(0);
    }
    
    formatFindings(findings);
    
    log('\n📝 Remediation Steps:', 'cyan');
    log('1. Remove all secrets from source code', 'reset');
    log('2. Use GitHub Secrets for sensitive values', 'reset');
    log('3. Ensure secrets are only in env blocks', 'reset');
    log('4. Re-run the build after fixing', 'reset');
    log('\n❌ SCAN FAILED - Secrets detected', 'red');
    
    process.exit(1);
    
  } catch (error) {
    log(`\n❌ Scan failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = {
  scanArtifactDirectory,
  scanTextFile,
  SECRET_PATTERNS
};
