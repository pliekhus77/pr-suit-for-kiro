#!/usr/bin/env node

/* eslint-env node */
/* eslint-disable no-console, @typescript-eslint/no-var-requires */

/**
 * Version Update Script
 * 
 * Updates package.json and package-lock.json with a new semantic version.
 * Validates version format and ensures proper file updates.
 * 
 * Usage:
 *   node scripts/update-version.js <new-version>
 * 
 * Example:
 *   node scripts/update-version.js 1.2.3
 * 
 * Exit codes:
 *   0 - Update successful
 *   1 - Update failed
 * 
 * Note: This is a CommonJS script for Node.js execution in CI/CD
 */

const fs = require('fs');
const path = require('path');

/**
 * Validates semantic version format
 * @param {string} version - Version string to validate
 * @returns {boolean} True if valid semantic version
 */
function isValidSemanticVersion(version) {
  // Semantic versioning regex: MAJOR.MINOR.PATCH with optional pre-release and build metadata
  const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
  return semverRegex.test(version);
}

/**
 * Reads and parses a JSON file
 * @param {string} filePath - Path to JSON file
 * @returns {object} Parsed JSON object
 * @throws {Error} If file doesn't exist or is invalid JSON
 */
function readJsonFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to parse JSON from ${filePath}: ${error.message}`);
  }
}

/**
 * Writes JSON object to file with proper formatting
 * @param {string} filePath - Path to JSON file
 * @param {object} data - JSON object to write
 * @param {number} indent - Number of spaces for indentation (default: 2)
 */
function writeJsonFile(filePath, data, indent = 2) {
  try {
    const content = JSON.stringify(data, null, indent) + '\n';
    fs.writeFileSync(filePath, content, 'utf8');
  } catch (error) {
    throw new Error(`Failed to write JSON to ${filePath}: ${error.message}`);
  }
}

/**
 * Updates package.json with new version
 * @param {string} packageJsonPath - Path to package.json
 * @param {string} newVersion - New semantic version
 * @returns {{oldVersion: string, newVersion: string}}
 */
function updatePackageJson(packageJsonPath, newVersion) {
  console.log(`📦 Updating ${path.basename(packageJsonPath)}...`);
  
  const packageJson = readJsonFile(packageJsonPath);
  const oldVersion = packageJson.version;
  
  if (!oldVersion) {
    throw new Error('package.json does not contain a version field');
  }
  
  console.log(`   Current version: ${oldVersion}`);
  console.log(`   New version: ${newVersion}`);
  
  packageJson.version = newVersion;
  writeJsonFile(packageJsonPath, packageJson);
  
  console.log(`   ✅ Updated successfully\n`);
  
  return { oldVersion, newVersion };
}

/**
 * Updates package-lock.json with new version
 * @param {string} packageLockPath - Path to package-lock.json
 * @param {string} newVersion - New semantic version
 * @param {string} packageName - Package name from package.json
 */
function updatePackageLock(packageLockPath, newVersion, packageName) {
  if (!fs.existsSync(packageLockPath)) {
    console.log(`⚠️  Warning: ${path.basename(packageLockPath)} not found, skipping\n`);
    return;
  }
  
  console.log(`🔒 Updating ${path.basename(packageLockPath)}...`);
  
  const packageLock = readJsonFile(packageLockPath);
  
  // Update root version
  if (packageLock.version) {
    console.log(`   Current version: ${packageLock.version}`);
    packageLock.version = newVersion;
  }
  
  // Update packages root entry (npm v7+)
  if (packageLock.packages && packageLock.packages['']) {
    packageLock.packages[''].version = newVersion;
  }
  
  // Update legacy packages entry (npm v6)
  if (packageLock.packages && packageLock.packages[packageName]) {
    packageLock.packages[packageName].version = newVersion;
  }
  
  console.log(`   New version: ${newVersion}`);
  writeJsonFile(packageLockPath, packageLock);
  
  console.log(`   ✅ Updated successfully\n`);
}

/**
 * Main update function
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('❌ Error: No version specified');
    console.error('\nUsage: node scripts/update-version.js <new-version>');
    console.error('Example: node scripts/update-version.js 1.2.3');
    process.exit(1);
  }
  
  const newVersion = args[0];
  
  console.log('🔄 Version Update Script\n');
  console.log(`Target version: ${newVersion}\n`);
  
  // Validate version format
  if (!isValidSemanticVersion(newVersion)) {
    console.error(`❌ Error: Invalid semantic version format: ${newVersion}`);
    console.error('\nExpected format: MAJOR.MINOR.PATCH');
    console.error('Examples: 1.0.0, 2.3.4, 1.0.0-beta.1, 1.0.0+build.123');
    process.exit(1);
  }
  
  const workspaceRoot = process.cwd();
  const packageJsonPath = path.join(workspaceRoot, 'package.json');
  const packageLockPath = path.join(workspaceRoot, 'package-lock.json');
  
  try {
    // Update package.json
    const { oldVersion } = updatePackageJson(packageJsonPath, newVersion);
    
    // Read package name for package-lock.json update
    const packageJson = readJsonFile(packageJsonPath);
    const packageName = packageJson.name;
    
    // Update package-lock.json
    updatePackageLock(packageLockPath, newVersion, packageName);
    
    console.log('✅ Version update complete!');
    console.log(`   ${oldVersion} → ${newVersion}\n`);
    
    // Output result as JSON for CI/CD consumption
    const result = {
      success: true,
      oldVersion,
      newVersion,
      filesUpdated: [
        'package.json',
        fs.existsSync(packageLockPath) ? 'package-lock.json' : null
      ].filter(Boolean)
    };
    
    console.log('Result:');
    console.log(JSON.stringify(result, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    
    const result = {
      success: false,
      error: error.message
    };
    
    console.error('\nResult:');
    console.error(JSON.stringify(result, null, 2));
    
    process.exit(1);
  }
}

// Export functions for testing
if (require.main === module) {
  main();
} else {
  module.exports = {
    isValidSemanticVersion,
    readJsonFile,
    writeJsonFile,
    updatePackageJson,
    updatePackageLock
  };
}
