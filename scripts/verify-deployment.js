#!/usr/bin/env node

/* eslint-env node */
/* eslint-disable no-console, @typescript-eslint/no-var-requires */

/**
 * Marketplace Deployment Verification Script
 * 
 * Verifies that a VS Code extension is successfully deployed and live
 * on the Visual Studio Code Marketplace with the expected version.
 * 
 * Usage:
 *   node scripts/verify-deployment.js <publisher>.<extension-name> <expected-version>
 * 
 * Example:
 *   node scripts/verify-deployment.js pragmatic-rhino.pragmatic-rhino-suit 1.0.0
 * 
 * Exit codes:
 *   0 - Extension is live with correct version
 *   1 - Verification failed (not found, wrong version, or error)
 * 
 * Note: This is a CommonJS script for Node.js execution in CI/CD
 */

const https = require('https');

// VS Code Marketplace API configuration
const MARKETPLACE_API_BASE = 'marketplace.visualstudio.com';
const MARKETPLACE_API_PATH = '/_apis/public/gallery/extensionquery';
const API_VERSION = '3.0-preview.1';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

/**
 * Makes an HTTPS request to the VS Code Marketplace API
 * @param {string} extensionId - Full extension ID (publisher.name)
 * @returns {Promise<object>} Extension data from marketplace
 */
function queryMarketplace(extensionId) {
  return new Promise((resolve, reject) => {
    const [publisher, extensionName] = extensionId.split('.');
    
    if (!publisher || !extensionName) {
      reject(new Error(`Invalid extension ID format: ${extensionId}. Expected format: publisher.extension-name`));
      return;
    }
    
    // Build the request body for marketplace API
    const requestBody = JSON.stringify({
      filters: [{
        criteria: [
          { filterType: 7, value: extensionName },
          { filterType: 8, value: 'Microsoft.VisualStudio.Code' }
        ],
        pageNumber: 1,
        pageSize: 1,
        sortBy: 0,
        sortOrder: 0
      }],
      assetTypes: [],
      flags: 914
    });
    
    const options = {
      hostname: MARKETPLACE_API_BASE,
      path: `${MARKETPLACE_API_PATH}?api-version=${API_VERSION}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json;api-version=3.0-preview.1',
        'Content-Length': Buffer.byteLength(requestBody)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`Marketplace API returned status ${res.statusCode}: ${data}`));
          return;
        }
        
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (error) {
          reject(new Error(`Failed to parse marketplace response: ${error.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`Marketplace API request failed: ${error.message}`));
    });
    
    req.write(requestBody);
    req.end();
  });
}

/**
 * Extracts extension information from marketplace response
 * @param {object} response - Marketplace API response
 * @param {string} extensionId - Full extension ID (publisher.name)
 * @returns {object|null} Extension info or null if not found
 */
function extractExtensionInfo(response, extensionId) {
  const [publisher, extensionName] = extensionId.split('.');
  
  if (!response.results || response.results.length === 0) {
    return null;
  }
  
  const result = response.results[0];
  
  if (!result.extensions || result.extensions.length === 0) {
    return null;
  }
  
  // Find the extension matching our publisher and name
  const extension = result.extensions.find(ext => 
    ext.publisher.publisherName.toLowerCase() === publisher.toLowerCase() &&
    ext.extensionName.toLowerCase() === extensionName.toLowerCase()
  );
  
  if (!extension) {
    return null;
  }
  
  // Extract relevant information
  const latestVersion = extension.versions && extension.versions.length > 0
    ? extension.versions[0].version
    : null;
  
  return {
    extensionId: `${extension.publisher.publisherName}.${extension.extensionName}`,
    displayName: extension.displayName,
    version: latestVersion,
    publisher: extension.publisher.publisherName,
    publishedDate: extension.publishedDate,
    lastUpdated: extension.lastUpdated,
    shortDescription: extension.shortDescription,
    installCount: extension.statistics?.find(s => s.statisticName === 'install')?.value || 0,
    downloadCount: extension.statistics?.find(s => s.statisticName === 'downloadCount')?.value || 0
  };
}

/**
 * Sleeps for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Verifies extension deployment with retry logic
 * @param {string} extensionId - Full extension ID (publisher.name)
 * @param {string} expectedVersion - Expected version string
 * @param {number} retryCount - Current retry attempt
 * @returns {Promise<{success: boolean, info: object|null, message: string}>}
 */
async function verifyDeployment(extensionId, expectedVersion, retryCount = 0) {
  try {
    console.log(`🔍 Querying marketplace for extension: ${extensionId}...`);
    
    const response = await queryMarketplace(extensionId);
    const extensionInfo = extractExtensionInfo(response, extensionId);
    
    if (!extensionInfo) {
      if (retryCount < MAX_RETRIES) {
        console.log(`⏳ Extension not found, retrying in ${RETRY_DELAY_MS / 1000}s... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        await sleep(RETRY_DELAY_MS);
        return verifyDeployment(extensionId, expectedVersion, retryCount + 1);
      }
      
      return {
        success: false,
        info: null,
        message: `Extension not found on marketplace after ${MAX_RETRIES} attempts`
      };
    }
    
    // Extension found, verify version
    if (!extensionInfo.version) {
      return {
        success: false,
        info: extensionInfo,
        message: 'Extension found but version information is missing'
      };
    }
    
    if (extensionInfo.version !== expectedVersion) {
      if (retryCount < MAX_RETRIES) {
        console.log(`⏳ Version mismatch (found ${extensionInfo.version}, expected ${expectedVersion}), retrying in ${RETRY_DELAY_MS / 1000}s... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        await sleep(RETRY_DELAY_MS);
        return verifyDeployment(extensionId, expectedVersion, retryCount + 1);
      }
      
      return {
        success: false,
        info: extensionInfo,
        message: `Version mismatch: expected ${expectedVersion}, found ${extensionInfo.version}`
      };
    }
    
    // Success!
    return {
      success: true,
      info: extensionInfo,
      message: `Extension is live with version ${extensionInfo.version}`
    };
    
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.log(`⏳ Error occurred, retrying in ${RETRY_DELAY_MS / 1000}s... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
      console.log(`   Error: ${error.message}`);
      await sleep(RETRY_DELAY_MS);
      return verifyDeployment(extensionId, expectedVersion, retryCount + 1);
    }
    
    return {
      success: false,
      info: null,
      message: `Verification failed after ${MAX_RETRIES} attempts: ${error.message}`
    };
  }
}

/**
 * Formats a date string for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
  if (!dateString) {
    return 'N/A';
  }
  
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  } catch {
    return dateString;
  }
}

/**
 * Formats a number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
function formatNumber(num) {
  if (typeof num !== 'number') {
    return '0';
  }
  return num.toLocaleString();
}

/**
 * Main verification function
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('❌ Error: Extension ID and expected version are required');
    console.error('\nUsage:');
    console.error('  node scripts/verify-deployment.js <publisher>.<extension-name> <expected-version>');
    console.error('\nExample:');
    console.error('  node scripts/verify-deployment.js pragmatic-rhino.pragmatic-rhino-suit 1.0.0');
    process.exit(1);
  }
  
  const extensionId = args[0];
  const expectedVersion = args[1];
  
  console.log('🚀 Verifying marketplace deployment...\n');
  console.log(`Extension ID: ${extensionId}`);
  console.log(`Expected version: ${expectedVersion}`);
  console.log();
  
  // Verify deployment
  const result = await verifyDeployment(extensionId, expectedVersion);
  
  if (result.success) {
    console.log(`✅ ${result.message}\n`);
    
    if (result.info) {
      console.log('📊 Extension Information:');
      console.log(`  Display Name: ${result.info.displayName}`);
      console.log(`  Publisher: ${result.info.publisher}`);
      console.log(`  Version: ${result.info.version}`);
      console.log(`  Published: ${formatDate(result.info.publishedDate)}`);
      console.log(`  Last Updated: ${formatDate(result.info.lastUpdated)}`);
      console.log(`  Installs: ${formatNumber(result.info.installCount)}`);
      console.log(`  Downloads: ${formatNumber(result.info.downloadCount)}`);
      
      if (result.info.shortDescription) {
        console.log(`  Description: ${result.info.shortDescription}`);
      }
      
      console.log();
      console.log(`🔗 Marketplace URL: https://marketplace.visualstudio.com/items?itemName=${extensionId}`);
    }
    
    process.exit(0);
  } else {
    console.error(`❌ ${result.message}\n`);
    
    if (result.info) {
      console.error('Extension information:');
      console.error(`  Found version: ${result.info.version}`);
      console.error(`  Expected version: ${expectedVersion}`);
      console.error();
    }
    
    console.error('Troubleshooting:');
    console.error('  1. Verify the extension ID is correct');
    console.error('  2. Check that the extension was successfully published');
    console.error('  3. Wait a few minutes for marketplace propagation');
    console.error('  4. Check marketplace status: https://marketplace.visualstudio.com/');
    
    process.exit(1);
  }
}

// Export functions for testing
if (require.main === module) {
  main();
} else {
  module.exports = {
    queryMarketplace,
    extractExtensionInfo,
    verifyDeployment,
    formatDate,
    formatNumber,
    MAX_RETRIES,
    RETRY_DELAY_MS
  };
}
