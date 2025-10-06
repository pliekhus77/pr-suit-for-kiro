#!/usr/bin/env node

/* eslint-env node */
/* eslint-disable no-console, @typescript-eslint/no-var-requires */

/**
 * VSIX Package Validation Script
 * 
 * Validates VS Code extension VSIX package structure, manifest version,
 * and file size limits.
 * 
 * Usage:
 *   node scripts/validate-vsix.js <vsix-file-path> [expected-version]
 * 
 * Exit codes:
 *   0 - VSIX validation passed
 *   1 - VSIX validation failed
 * 
 * Note: This is a CommonJS script for Node.js execution in CI/CD
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const MAX_VSIX_SIZE_MB = 50; // Maximum VSIX file size in MB
const MAX_VSIX_SIZE_BYTES = MAX_VSIX_SIZE_MB * 1024 * 1024;

// Required files in VSIX package
const REQUIRED_FILES = [
  'extension.vsixmanifest',
  'extension/package.json'
];

/**
 * Checks if a file exists
 * @param {string} filePath - Path to file
 * @returns {boolean} True if file exists
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

/**
 * Gets file size in bytes
 * @param {string} filePath - Path to file
 * @returns {number} File size in bytes
 */
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    throw new Error(`Failed to get file size: ${error.message}`);
  }
}

/**
 * Formats bytes to human-readable size
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
function formatBytes(bytes) {
  if (bytes === 0) {
    return '0 Bytes';
  }
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Validates VSIX file size
 * @param {string} vsixPath - Path to VSIX file
 * @returns {{valid: boolean, size: number, message: string}}
 */
function validateFileSize(vsixPath) {
  const size = getFileSize(vsixPath);
  const sizeFormatted = formatBytes(size);
  const maxSizeFormatted = formatBytes(MAX_VSIX_SIZE_BYTES);
  
  if (size > MAX_VSIX_SIZE_BYTES) {
    return {
      valid: false,
      size,
      message: `VSIX file size (${sizeFormatted}) exceeds maximum allowed size (${maxSizeFormatted})`
    };
  }
  
  return {
    valid: true,
    size,
    message: `VSIX file size: ${sizeFormatted} (within ${maxSizeFormatted} limit)`
  };
}

/**
 * Lists contents of VSIX file (ZIP archive)
 * @param {string} vsixPath - Path to VSIX file
 * @returns {string[]} Array of file paths in VSIX
 */
function listVsixContents(vsixPath) {
  try {
    // VSIX is a ZIP file, use unzip to list contents
    // Use platform-appropriate command
    const isWindows = process.platform === 'win32';
    
    if (isWindows) {
      // On Windows, try PowerShell's Expand-Archive or 7-Zip
      try {
        const output = execSync(
          `powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::OpenRead('${vsixPath}').Entries | Select-Object -ExpandProperty FullName"`,
          { encoding: 'utf8' }
        );
        return output.split('\n').map(line => line.trim()).filter(line => line);
      } catch (psError) {
        // Fallback: Try to use Node.js built-in if available
        console.warn('⚠️  PowerShell zip listing failed, attempting alternative method');
        throw psError;
      }
    } else {
      // On Unix-like systems, use unzip
      const output = execSync(`unzip -l "${vsixPath}"`, { encoding: 'utf8' });
      
      // Parse unzip output (skip header and footer)
      const lines = output.split('\n');
      const files = [];
      
      for (const line of lines) {
        // Match lines with file entries (length, date, time, name)
        const match = line.match(/^\s*\d+\s+\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}\s+(.+)$/);
        if (match) {
          files.push(match[1].trim());
        }
      }
      
      return files;
    }
  } catch (error) {
    throw new Error(`Failed to list VSIX contents: ${error.message}`);
  }
}

/**
 * Validates VSIX structure contains required files
 * @param {string} vsixPath - Path to VSIX file
 * @returns {{valid: boolean, missingFiles: string[], message: string}}
 */
function validateVsixStructure(vsixPath) {
  try {
    const contents = listVsixContents(vsixPath);
    const missingFiles = [];
    
    for (const requiredFile of REQUIRED_FILES) {
      // Check if any file in contents matches the required file
      const found = contents.some(file => 
        file.endsWith(requiredFile) || file.includes(requiredFile)
      );
      
      if (!found) {
        missingFiles.push(requiredFile);
      }
    }
    
    if (missingFiles.length > 0) {
      return {
        valid: false,
        missingFiles,
        message: `VSIX is missing required files: ${missingFiles.join(', ')}`
      };
    }
    
    return {
      valid: true,
      missingFiles: [],
      message: `VSIX structure is valid (${contents.length} files found)`
    };
  } catch (error) {
    return {
      valid: false,
      missingFiles: REQUIRED_FILES,
      message: `Failed to validate VSIX structure: ${error.message}`
    };
  }
}

/**
 * Extracts and reads package.json from VSIX
 * @param {string} vsixPath - Path to VSIX file
 * @returns {object|null} Parsed package.json or null if not found
 */
function extractPackageJson(vsixPath) {
  try {
    const isWindows = process.platform === 'win32';
    
    if (isWindows) {
      // On Windows, use PowerShell to extract specific file
      const tempDir = path.join(process.cwd(), '.vsix-temp');
      
      try {
        // Create temp directory
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
        
        // Extract VSIX to temp directory
        execSync(
          `powershell -Command "Expand-Archive -Path '${vsixPath}' -DestinationPath '${tempDir}' -Force"`,
          { encoding: 'utf8' }
        );
        
        // Find package.json
        const packageJsonPath = path.join(tempDir, 'extension', 'package.json');
        
        if (!fs.existsSync(packageJsonPath)) {
          throw new Error('package.json not found in VSIX');
        }
        
        const content = fs.readFileSync(packageJsonPath, 'utf8');
        const packageJson = JSON.parse(content);
        
        // Cleanup temp directory
        fs.rmSync(tempDir, { recursive: true, force: true });
        
        return packageJson;
      } catch (error) {
        // Cleanup on error
        if (fs.existsSync(tempDir)) {
          fs.rmSync(tempDir, { recursive: true, force: true });
        }
        throw error;
      }
    } else {
      // On Unix-like systems, use unzip to extract specific file
      const output = execSync(
        `unzip -p "${vsixPath}" "extension/package.json"`,
        { encoding: 'utf8' }
      );
      
      return JSON.parse(output);
    }
  } catch (error) {
    console.error(`Failed to extract package.json: ${error.message}`);
    return null;
  }
}

/**
 * Validates manifest version matches expected version
 * @param {string} vsixPath - Path to VSIX file
 * @param {string} expectedVersion - Expected version string
 * @returns {{valid: boolean, actualVersion: string|null, message: string}}
 */
function validateManifestVersion(vsixPath, expectedVersion) {
  const packageJson = extractPackageJson(vsixPath);
  
  if (!packageJson) {
    return {
      valid: false,
      actualVersion: null,
      message: 'Failed to extract package.json from VSIX'
    };
  }
  
  const actualVersion = packageJson.version;
  
  if (!actualVersion) {
    return {
      valid: false,
      actualVersion: null,
      message: 'No version found in package.json'
    };
  }
  
  if (expectedVersion && actualVersion !== expectedVersion) {
    return {
      valid: false,
      actualVersion,
      message: `Version mismatch: expected ${expectedVersion}, found ${actualVersion}`
    };
  }
  
  return {
    valid: true,
    actualVersion,
    message: expectedVersion 
      ? `Version matches: ${actualVersion}`
      : `Version found: ${actualVersion}`
  };
}

/**
 * Main validation function
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('❌ Error: VSIX file path is required');
    console.error('\nUsage:');
    console.error('  node scripts/validate-vsix.js <vsix-file-path> [expected-version]');
    console.error('\nExample:');
    console.error('  node scripts/validate-vsix.js pragmatic-rhino-suit-1.0.0.vsix 1.0.0');
    process.exit(1);
  }
  
  const vsixPath = args[0];
  const expectedVersion = args[1] || null;
  
  console.log('🔍 Validating VSIX package...\n');
  console.log(`VSIX file: ${vsixPath}`);
  if (expectedVersion) {
    console.log(`Expected version: ${expectedVersion}`);
  }
  console.log();
  
  // Check if VSIX file exists
  if (!fileExists(vsixPath)) {
    console.error(`❌ Error: VSIX file not found: ${vsixPath}`);
    process.exit(1);
  }
  
  let hasErrors = false;
  
  // Validate file size
  console.log('📏 Validating file size...');
  const sizeResult = validateFileSize(vsixPath);
  if (sizeResult.valid) {
    console.log(`✅ ${sizeResult.message}\n`);
  } else {
    console.error(`❌ ${sizeResult.message}\n`);
    hasErrors = true;
  }
  
  // Validate VSIX structure
  console.log('📦 Validating VSIX structure...');
  const structureResult = validateVsixStructure(vsixPath);
  if (structureResult.valid) {
    console.log(`✅ ${structureResult.message}\n`);
  } else {
    console.error(`❌ ${structureResult.message}`);
    if (structureResult.missingFiles.length > 0) {
      console.error('   Missing files:');
      structureResult.missingFiles.forEach(file => {
        console.error(`     - ${file}`);
      });
    }
    console.log();
    hasErrors = true;
  }
  
  // Validate manifest version
  console.log('🏷️  Validating manifest version...');
  const versionResult = validateManifestVersion(vsixPath, expectedVersion);
  if (versionResult.valid) {
    console.log(`✅ ${versionResult.message}\n`);
  } else {
    console.error(`❌ ${versionResult.message}\n`);
    hasErrors = true;
  }
  
  // Summary
  if (hasErrors) {
    console.error('❌ VSIX validation failed');
    console.error('\nPlease fix the errors above and try again.');
    process.exit(1);
  }
  
  console.log('✅ VSIX validation passed');
  console.log('\nValidation summary:');
  console.log(`  File size: ${formatBytes(sizeResult.size)}`);
  console.log(`  Version: ${versionResult.actualVersion}`);
  console.log(`  Structure: Valid`);
  
  process.exit(0);
}

// Export functions for testing
if (require.main === module) {
  main();
} else {
  module.exports = {
    fileExists,
    getFileSize,
    formatBytes,
    validateFileSize,
    listVsixContents,
    validateVsixStructure,
    extractPackageJson,
    validateManifestVersion,
    MAX_VSIX_SIZE_BYTES,
    REQUIRED_FILES
  };
}
