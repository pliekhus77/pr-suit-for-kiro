#!/usr/bin/env node

/* eslint-env node */
/* eslint-disable no-console, @typescript-eslint/no-var-requires */

/**
 * Changelog Generator Script
 * 
 * Generates CHANGELOG.md entries from commit messages following
 * the Keep a Changelog format and conventional commits.
 * 
 * Usage:
 *   node scripts/generate-changelog.js <version> [base-ref]
 * 
 * Example:
 *   node scripts/generate-changelog.js 1.2.3 v1.2.2
 * 
 * Output:
 *   Markdown formatted changelog entry
 * 
 * Exit codes:
 *   0 - Generation successful
 *   1 - Generation failed
 * 
 * Note: This is a CommonJS script for Node.js execution in CI/CD
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Parses a conventional commit message
 * @param {string} message - Commit message
 * @returns {{type: string|null, scope: string|null, breaking: boolean, description: string, body: string}}
 */
function parseConventionalCommit(message) {
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
      description: firstLine,
      body: lines.slice(1).join('\n').trim()
    };
  }
  
  const [, type, scope, breakingMarker, description] = match;
  const body = lines.slice(1).join('\n').trim();
  
  // Check for BREAKING CHANGE in commit body
  const hasBreakingChange = message.includes('BREAKING CHANGE:') || 
                           message.includes('BREAKING-CHANGE:');
  
  return {
    type: type.toLowerCase(),
    scope: scope || null,
    breaking: !!breakingMarker || hasBreakingChange,
    description: description.trim(),
    body
  };
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
 * Groups commits by type
 * @param {Array<{sha: string, message: string}>} commits - Array of commits
 * @returns {{breaking: Array, features: Array, fixes: Array, other: Array}}
 */
function groupCommitsByType(commits) {
  const groups = {
    breaking: [],
    features: [],
    fixes: [],
    other: []
  };
  
  for (const commit of commits) {
    const parsed = parseConventionalCommit(commit.message);
    
    const entry = {
      sha: commit.sha,
      shortSha: commit.sha.substring(0, 7),
      type: parsed.type,
      scope: parsed.scope,
      description: parsed.description,
      body: parsed.body,
      breaking: parsed.breaking
    };
    
    if (parsed.breaking) {
      groups.breaking.push(entry);
    } else if (parsed.type === 'feat' || parsed.type === 'feature') {
      groups.features.push(entry);
    } else if (parsed.type === 'fix' || parsed.type === 'bugfix') {
      groups.fixes.push(entry);
    } else {
      groups.other.push(entry);
    }
  }
  
  return groups;
}

/**
 * Formats a changelog entry for a commit
 * @param {object} entry - Commit entry
 * @param {boolean} includeScope - Whether to include scope in output
 * @returns {string} Formatted markdown line
 */
function formatChangelogEntry(entry, includeScope = true) {
  const scope = includeScope && entry.scope ? `**${entry.scope}**: ` : '';
  return `- ${scope}${entry.description} ([${entry.shortSha}](../../commit/${entry.sha}))`;
}

/**
 * Generates changelog markdown for a version
 * @param {string} version - Version number (e.g., "1.2.3")
 * @param {object} groups - Grouped commits
 * @param {string} date - Release date (YYYY-MM-DD format)
 * @returns {string} Markdown formatted changelog
 */
function generateChangelogMarkdown(version, groups, date) {
  const lines = [];
  
  // Version header
  lines.push(`## [${version}] - ${date}`);
  lines.push('');
  
  // Breaking changes section
  if (groups.breaking.length > 0) {
    lines.push('### ⚠ BREAKING CHANGES');
    lines.push('');
    groups.breaking.forEach(entry => {
      lines.push(formatChangelogEntry(entry));
      // Add breaking change details from body if available
      if (entry.body) {
        const breakingMatch = entry.body.match(/BREAKING[- ]CHANGE:\s*(.+)/i);
        if (breakingMatch) {
          lines.push(`  ${breakingMatch[1]}`);
        }
      }
    });
    lines.push('');
  }
  
  // Features section
  if (groups.features.length > 0) {
    lines.push('### Added');
    lines.push('');
    groups.features.forEach(entry => {
      lines.push(formatChangelogEntry(entry));
    });
    lines.push('');
  }
  
  // Fixes section
  if (groups.fixes.length > 0) {
    lines.push('### Fixed');
    lines.push('');
    groups.fixes.forEach(entry => {
      lines.push(formatChangelogEntry(entry));
    });
    lines.push('');
  }
  
  // Other changes section (optional, only if significant)
  if (groups.other.length > 0) {
    const significantOther = groups.other.filter(entry => 
      entry.type === 'docs' || 
      entry.type === 'perf' || 
      entry.type === 'refactor'
    );
    
    if (significantOther.length > 0) {
      lines.push('### Changed');
      lines.push('');
      significantOther.forEach(entry => {
        lines.push(formatChangelogEntry(entry));
      });
      lines.push('');
    }
  }
  
  return lines.join('\n');
}

/**
 * Reads existing CHANGELOG.md file
 * @param {string} changelogPath - Path to CHANGELOG.md
 * @returns {string} Existing changelog content
 */
function readExistingChangelog(changelogPath) {
  if (!fs.existsSync(changelogPath)) {
    return createChangelogTemplate();
  }
  
  try {
    return fs.readFileSync(changelogPath, 'utf8');
  } catch (error) {
    console.error(`Error reading CHANGELOG.md: ${error.message}`);
    return createChangelogTemplate();
  }
}

/**
 * Creates a new changelog template
 * @returns {string} Changelog template
 */
function createChangelogTemplate() {
  return `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

`;
}

/**
 * Inserts new changelog entry into existing changelog
 * @param {string} existingContent - Existing changelog content
 * @param {string} newEntry - New changelog entry
 * @returns {string} Updated changelog content
 */
function insertChangelogEntry(existingContent, newEntry) {
  // Find the position to insert (after the header, before first version)
  const lines = existingContent.split('\n');
  let insertIndex = -1;
  
  // Find the end of the header (after the last line before first ## heading)
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('## [')) {
      insertIndex = i;
      break;
    }
  }
  
  // If no version found, append to end
  if (insertIndex === -1) {
    return existingContent.trim() + '\n\n' + newEntry;
  }
  
  // Insert before the first version
  lines.splice(insertIndex, 0, newEntry);
  return lines.join('\n');
}

/**
 * Writes changelog to file
 * @param {string} changelogPath - Path to CHANGELOG.md
 * @param {string} content - Changelog content
 */
function writeChangelog(changelogPath, content) {
  try {
    fs.writeFileSync(changelogPath, content, 'utf8');
  } catch (error) {
    throw new Error(`Failed to write CHANGELOG.md: ${error.message}`);
  }
}

/**
 * Main generation function
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('❌ Error: No version specified');
    console.error('\nUsage: node scripts/generate-changelog.js <version> [base-ref]');
    console.error('Example: node scripts/generate-changelog.js 1.2.3 v1.2.2');
    process.exit(1);
  }
  
  const version = args[0];
  const baseRef = args[1] || 'HEAD~1';
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  console.log('📝 Changelog Generator\n');
  console.log(`Version: ${version}`);
  console.log(`Base reference: ${baseRef}`);
  console.log(`Date: ${date}\n`);
  
  // Get commits since base
  const commits = getCommitsSince(baseRef);
  
  if (commits.length === 0) {
    console.log('ℹ️  No commits found since base reference');
    console.log('   No changelog entry generated\n');
    process.exit(0);
  }
  
  console.log(`Found ${commits.length} commit(s) to include\n`);
  
  // Group commits by type
  const groups = groupCommitsByType(commits);
  
  console.log('📊 Commit Breakdown:');
  console.log(`   Breaking changes: ${groups.breaking.length}`);
  console.log(`   Features: ${groups.features.length}`);
  console.log(`   Fixes: ${groups.fixes.length}`);
  console.log(`   Other: ${groups.other.length}\n`);
  
  // Generate changelog entry
  const changelogEntry = generateChangelogMarkdown(version, groups, date);
  
  // Read existing changelog
  const workspaceRoot = process.cwd();
  const changelogPath = path.join(workspaceRoot, 'CHANGELOG.md');
  const existingChangelog = readExistingChangelog(changelogPath);
  
  // Insert new entry
  const updatedChangelog = insertChangelogEntry(existingChangelog, changelogEntry);
  
  // Write changelog
  writeChangelog(changelogPath, updatedChangelog);
  
  console.log('✅ Changelog generated successfully!');
  console.log(`   Updated: ${changelogPath}\n`);
  
  // Output the generated entry for preview
  console.log('Generated Entry:');
  console.log('─'.repeat(80));
  console.log(changelogEntry);
  console.log('─'.repeat(80));
  
  // Output result as JSON for CI/CD consumption
  const result = {
    success: true,
    version,
    date,
    changelogPath,
    stats: {
      totalCommits: commits.length,
      breaking: groups.breaking.length,
      features: groups.features.length,
      fixes: groups.fixes.length,
      other: groups.other.length
    }
  };
  
  console.log('\nResult:');
  console.log(JSON.stringify(result, null, 2));
  
  process.exit(0);
}

// Export functions for testing
if (require.main === module) {
  main();
} else {
  module.exports = {
    parseConventionalCommit,
    getCommitsSince,
    groupCommitsByType,
    formatChangelogEntry,
    generateChangelogMarkdown,
    readExistingChangelog,
    createChangelogTemplate,
    insertChangelogEntry,
    writeChangelog
  };
}
