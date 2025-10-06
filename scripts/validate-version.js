#!/usr/bin/env node

/* eslint-env node */
/* eslint-disable no-console, @typescript-eslint/no-var-requires */

/**
 * Version Validation Script
 * 
 * Validates that package.json version follows semantic versioning
 * and has been incremented from the base branch.
 * 
 * Usage:
 *   node scripts/validate-version.js [base-branch]
 * 
 * Exit codes:
 *   0 - Version is valid and incremented
 *   1 - Version validation failed
 * 
 * Note: This is a CommonJS script for Node.js execution in CI/CD
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Validates semantic versioning format
 * @param {string} version - Version string to validate
 * @returns {boolean} True if valid semantic version
 */
function isValidSemVer(version) {
  // Semantic versioning regex: MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]
  const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
  return semverRegex.test(version);
}

/**
 * Parses semantic version into components
 * @param {string} version - Version string
 * @returns {{major: number, minor: number, patch: number, prerelease: string|null, build: string|null}}
 */
function parseSemVer(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-([^+]+))?(?:\+(.+))?$/);
  if (!match) {
    throw new Error(`Invalid semantic version: ${version}`);
  }
  
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4] || null,
    build: match[5] || null
  };
}

/**
 * Compares two semantic versions
 * @param {string} current - Current version
 * @param {string} base - Base version
 * @returns {number} -1 if current < base, 0 if equal, 1 if current > base
 */
function compareVersions(current, base) {
  const curr = parseSemVer(current);
  const b = parseSemVer(base);
  
  if (curr.major !== b.major) {
    return curr.major > b.major ? 1 : -1;
  }
  if (curr.minor !== b.minor) {
    return curr.minor > b.minor ? 1 : -1;
  }
  if (curr.patch !== b.patch) {
    return curr.patch > b.patch ? 1 : -1;
  }
  
  // If versions are equal, check prerelease
  if (curr.prerelease && !b.prerelease) {
    return -1;
  }
  if (!curr.prerelease && b.prerelease) {
    return 1;
  }
  if (curr.prerelease && b.prerelease) {
    return curr.prerelease > b.prerelease ? 1 : (curr.prerelease < b.prerelease ? -1 : 0);
  }
  
  return 0;
}

/**
 * Validates version increment
 * @param {string} current - Current version
 * @param {string} base - Base version
 * @returns {{valid: boolean, message: string}}
 */
function validateIncrement(current, base) {
  const comparison = compareVersions(current, base);
  
  if (comparison < 0) {
    return {
      valid: false,
      message: `Version ${current} is less than base version ${base}`
    };
  }
  
  if (comparison === 0) {
    return {
      valid: false,
      message: `Version ${current} is the same as base version ${base}. Version must be incremented.`
    };
  }
  
  const curr = parseSemVer(current);
  const b = parseSemVer(base);
  
  // Check for valid increment (only one component should change)
  const majorIncrement = curr.major - b.major;
  const minorIncrement = curr.minor - b.minor;
  const patchIncrement = curr.patch - b.patch;
  
  if (majorIncrement > 0) {
    // Major version bump - minor and patch should reset to 0
    if (majorIncrement > 1) {
      return {
        valid: false,
        message: `Major version jumped by ${majorIncrement}. Should increment by 1.`
      };
    }
    if (curr.minor !== 0 || curr.patch !== 0) {
      return {
        valid: false,
        message: `Major version bump should reset minor and patch to 0. Got ${current}`
      };
    }
  } else if (minorIncrement > 0) {
    // Minor version bump - patch should reset to 0
    if (minorIncrement > 1) {
      return {
        valid: false,
        message: `Minor version jumped by ${minorIncrement}. Should increment by 1.`
      };
    }
    if (curr.patch !== 0) {
      return {
        valid: false,
        message: `Minor version bump should reset patch to 0. Got ${current}`
      };
    }
  } else if (patchIncrement > 0) {
    // Patch version bump
    if (patchIncrement > 1) {
      return {
        valid: false,
        message: `Patch version jumped by ${patchIncrement}. Should increment by 1.`
      };
    }
  }
  
  return {
    valid: true,
    message: `Version incremented from ${base} to ${current}`
  };
}

/**
 * Gets package.json version from a git reference
 * @param {string} ref - Git reference (branch, tag, commit)
 * @returns {string|null} Version string or null if not found
 */
function getVersionFromGit(ref) {
  try {
    const packageJson = execSync(`git show ${ref}:package.json`, { encoding: 'utf8' });
    const pkg = JSON.parse(packageJson);
    return pkg.version;
  } catch (error) {
    return null;
  }
}

/**
 * Main validation function
 */
function main() {
  const args = process.argv.slice(2);
  const baseBranch = args[0] || 'origin/main';
  
  console.log('🔍 Validating package.json version...\n');
  
  // Read current package.json
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ Error: package.json not found');
    process.exit(1);
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const currentVersion = packageJson.version;
  
  console.log(`Current version: ${currentVersion}`);
  
  // Validate semantic versioning format
  if (!isValidSemVer(currentVersion)) {
    console.error(`❌ Error: Version "${currentVersion}" is not a valid semantic version`);
    console.error('   Expected format: MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]');
    console.error('   Examples: 1.0.0, 1.2.3, 2.0.0-beta.1, 1.0.0+20130313144700');
    process.exit(1);
  }
  
  console.log('✅ Version format is valid\n');
  
  // Get base branch version
  console.log(`Comparing with base branch: ${baseBranch}`);
  const baseVersion = getVersionFromGit(baseBranch);
  
  if (!baseVersion) {
    console.log('⚠️  Warning: Could not retrieve version from base branch');
    console.log('   Skipping version increment validation');
    console.log('   This is expected for initial commits or new branches\n');
    console.log('✅ Version validation passed');
    process.exit(0);
  }
  
  console.log(`Base version: ${baseVersion}\n`);
  
  // Validate version increment
  const result = validateIncrement(currentVersion, baseVersion);
  
  if (!result.valid) {
    console.error(`❌ Error: ${result.message}`);
    console.error('\nVersion increment rules:');
    console.error('  - Major bump: X.0.0 (breaking changes)');
    console.error('  - Minor bump: X.Y.0 (new features)');
    console.error('  - Patch bump: X.Y.Z (bug fixes)');
    process.exit(1);
  }
  
  console.log(`✅ ${result.message}`);
  console.log('\n✅ Version validation passed');
  process.exit(0);
}

// Export functions for testing
if (require.main === module) {
  main();
} else {
  module.exports = {
    isValidSemVer,
    parseSemVer,
    compareVersions,
    validateIncrement,
    getVersionFromGit
  };
}
