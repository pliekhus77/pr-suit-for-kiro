#!/usr/bin/env node

/* eslint-env node */
/* eslint-disable no-console, @typescript-eslint/no-var-requires */

/**
 * Version Analysis Script
 * 
 * Analyzes commit messages using conventional commits format
 * to determine the appropriate semantic version bump.
 * 
 * Usage:
 *   node scripts/analyze-version.js [base-ref]
 * 
 * Output:
 *   JSON object with version bump type and commit analysis
 * 
 * Exit codes:
 *   0 - Analysis successful
 *   1 - Analysis failed
 * 
 * Note: This is a CommonJS script for Node.js execution in CI/CD
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Parses a conventional commit message
 * @param {string} message - Commit message
 * @returns {{type: string|null, scope: string|null, breaking: boolean, description: string}}
 */
function parseConventionalCommit(message) {
  // Conventional commit format: type(scope): description
  // Optional breaking change indicator: ! or BREAKING CHANGE in body
  const lines = message.split('\n');
  const firstLine = lines[0];
  
  // Match: type(scope)!: description or type: description
  const conventionalRegex = /^(\w+)(?:\(([^)]+)\))?(!)?:\s*(.+)$/;
  const match = firstLine.match(conventionalRegex);
  
  if (!match) {
    return {
      type: null,
      scope: null,
      breaking: false,
      description: firstLine
    };
  }
  
  const [, type, scope, breakingMarker, description] = match;
  
  // Check for BREAKING CHANGE in commit body
  const hasBreakingChange = message.includes('BREAKING CHANGE:') || 
                           message.includes('BREAKING-CHANGE:');
  
  return {
    type: type.toLowerCase(),
    scope: scope || null,
    breaking: !!breakingMarker || hasBreakingChange,
    description: description.trim()
  };
}

/**
 * Determines version bump type from commit type
 * @param {string} type - Commit type (feat, fix, chore, etc.)
 * @param {boolean} breaking - Whether commit has breaking changes
 * @returns {'major'|'minor'|'patch'|null}
 */
function getVersionBumpType(type, breaking) {
  if (breaking) {
    return 'major';
  }
  
  switch (type) {
    case 'feat':
    case 'feature':
      return 'minor';
    
    case 'fix':
    case 'bugfix':
    case 'chore':
    case 'docs':
    case 'style':
    case 'refactor':
    case 'perf':
    case 'test':
    case 'build':
    case 'ci':
      return 'patch';
    
    default:
      return null;
  }
}

/**
 * Gets commits since a base reference
 * @param {string} baseRef - Base git reference (branch, tag, commit)
 * @returns {Array<{sha: string, message: string}>}
 */
function getCommitsSince(baseRef) {
  try {
    // Get commit log with format: SHA|MESSAGE
    const log = execSync(
      `git log ${baseRef}..HEAD --format=%H|%B%x00`,
      { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
    );
    
    if (!log.trim()) {
      return [];
    }
    
    // Split by null character and parse
    return log
      .split('\x00')
      .filter(entry => entry.trim())
      .map(entry => {
        const [sha, ...messageParts] = entry.split('|');
        return {
          sha: sha.trim(),
          message: messageParts.join('|').trim()
        };
      });
  } catch (error) {
    console.error(`Error getting commits: ${error.message}`);
    return [];
  }
}

/**
 * Analyzes commits to determine version bump
 * @param {Array<{sha: string, message: string}>} commits - Array of commits
 * @returns {{bump: 'major'|'minor'|'patch'|null, commits: Array, summary: object}}
 */
function analyzeCommits(commits) {
  if (commits.length === 0) {
    return {
      bump: null,
      commits: [],
      summary: {
        total: 0,
        breaking: 0,
        features: 0,
        fixes: 0,
        other: 0
      }
    };
  }
  
  let highestBump = null;
  const analyzedCommits = [];
  const summary = {
    total: commits.length,
    breaking: 0,
    features: 0,
    fixes: 0,
    other: 0
  };
  
  for (const commit of commits) {
    const parsed = parseConventionalCommit(commit.message);
    const bump = getVersionBumpType(parsed.type, parsed.breaking);
    
    const analyzed = {
      sha: commit.sha,
      message: commit.message,
      type: parsed.type,
      scope: parsed.scope,
      breaking: parsed.breaking,
      description: parsed.description,
      bump: bump
    };
    
    analyzedCommits.push(analyzed);
    
    // Track summary
    if (parsed.breaking) {
      summary.breaking++;
    }
    if (parsed.type === 'feat' || parsed.type === 'feature') {
      summary.features++;
    }
    if (parsed.type === 'fix' || parsed.type === 'bugfix') {
      summary.fixes++;
    }
    if (!parsed.type) {
      summary.other++;
    }
    
    // Determine highest bump (major > minor > patch)
    if (bump === 'major') {
      highestBump = 'major';
    } else if (bump === 'minor' && highestBump !== 'major') {
      highestBump = 'minor';
    } else if (bump === 'patch' && !highestBump) {
      highestBump = 'patch';
    }
  }
  
  return {
    bump: highestBump,
    commits: analyzedCommits,
    summary
  };
}

/**
 * Calculates next version based on current version and bump type
 * @param {string} currentVersion - Current semantic version
 * @param {'major'|'minor'|'patch'} bump - Version bump type
 * @returns {string} Next version
 */
function calculateNextVersion(currentVersion, bump) {
  const match = currentVersion.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) {
    throw new Error(`Invalid version format: ${currentVersion}`);
  }
  
  let [, major, minor, patch] = match.map(Number);
  
  switch (bump) {
    case 'major':
      major++;
      minor = 0;
      patch = 0;
      break;
    case 'minor':
      minor++;
      patch = 0;
      break;
    case 'patch':
      patch++;
      break;
    default:
      throw new Error(`Invalid bump type: ${bump}`);
  }
  
  return `${major}.${minor}.${patch}`;
}

/**
 * Main analysis function
 */
function main() {
  const args = process.argv.slice(2);
  const baseRef = args[0] || 'origin/main';
  
  console.log('🔍 Analyzing commits for version bump...\n');
  
  // Read current version
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ Error: package.json not found');
    process.exit(1);
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const currentVersion = packageJson.version;
  
  console.log(`Current version: ${currentVersion}`);
  console.log(`Base reference: ${baseRef}\n`);
  
  // Get commits since base
  const commits = getCommitsSince(baseRef);
  
  if (commits.length === 0) {
    console.log('ℹ️  No commits found since base reference');
    console.log('   No version bump needed\n');
    
    const result = {
      currentVersion,
      nextVersion: currentVersion,
      bump: null,
      commits: [],
      summary: {
        total: 0,
        breaking: 0,
        features: 0,
        fixes: 0,
        other: 0
      }
    };
    
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  }
  
  console.log(`Found ${commits.length} commit(s) to analyze\n`);
  
  // Analyze commits
  const analysis = analyzeCommits(commits);
  
  // Display summary
  console.log('📊 Commit Summary:');
  console.log(`   Total commits: ${analysis.summary.total}`);
  console.log(`   Breaking changes: ${analysis.summary.breaking}`);
  console.log(`   Features: ${analysis.summary.features}`);
  console.log(`   Fixes: ${analysis.summary.fixes}`);
  console.log(`   Other: ${analysis.summary.other}\n`);
  
  if (!analysis.bump) {
    console.log('⚠️  Warning: No conventional commits found');
    console.log('   Defaulting to patch version bump\n');
    analysis.bump = 'patch';
  }
  
  // Calculate next version
  const nextVersion = calculateNextVersion(currentVersion, analysis.bump);
  
  console.log(`📦 Version Bump: ${analysis.bump}`);
  console.log(`   ${currentVersion} → ${nextVersion}\n`);
  
  // Output result as JSON
  const result = {
    currentVersion,
    nextVersion,
    bump: analysis.bump,
    commits: analysis.commits,
    summary: analysis.summary
  };
  
  console.log('✅ Analysis complete\n');
  console.log('Result:');
  console.log(JSON.stringify(result, null, 2));
  
  process.exit(0);
}

// Export functions for testing
if (require.main === module) {
  main();
} else {
  module.exports = {
    parseConventionalCommit,
    getVersionBumpType,
    getCommitsSince,
    analyzeCommits,
    calculateNextVersion
  };
}
