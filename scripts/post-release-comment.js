#!/usr/bin/env node

/* eslint-env node */
/* eslint-disable no-console, @typescript-eslint/no-var-requires */

/**
 * GitHub Release Comment Script
 * 
 * Posts a success comment on a GitHub release with deployment information,
 * marketplace link, and deployment metrics.
 * 
 * Usage:
 *   node scripts/post-release-comment.js <release-id> <version> <marketplace-url> [options]
 * 
 * Environment Variables:
 *   GITHUB_TOKEN - GitHub token for API authentication (required)
 *   GITHUB_REPOSITORY - Repository in format owner/repo (required)
 * 
 * Options:
 *   --install-count <number> - Number of installs
 *   --download-count <number> - Number of downloads
 *   --file-size <bytes> - VSIX file size in bytes
 *   --workflow-url <url> - Link to workflow run
 * 
 * Example:
 *   node scripts/post-release-comment.js 123456 1.0.0 https://marketplace.visualstudio.com/items?itemName=publisher.extension \
 *     --install-count 100 --download-count 250 --file-size 1048576 --workflow-url https://github.com/owner/repo/actions/runs/123
 * 
 * Exit codes:
 *   0 - Comment posted successfully
 *   1 - Failed to post comment
 * 
 * Note: This is a CommonJS script for Node.js execution in CI/CD
 */

const https = require('https');

/**
 * Posts a comment on a GitHub release
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} releaseId - Release ID
 * @param {string} body - Comment body (markdown)
 * @param {string} token - GitHub token
 * @returns {Promise<object>} API response
 */
function postReleaseComment(owner, repo, releaseId, body, token) {
  return new Promise((resolve, reject) => {
    const requestBody = JSON.stringify({ body });
    
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${owner}/${repo}/releases/${releaseId}/comments`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'GitHub-Actions-Release-Comment',
        'Content-Length': Buffer.byteLength(requestBody)
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`GitHub API returned status ${res.statusCode}: ${data}`));
          return;
        }
        
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (error) {
          reject(new Error(`Failed to parse GitHub API response: ${error.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(new Error(`GitHub API request failed: ${error.message}`));
    });
    
    req.write(requestBody);
    req.end();
  });
}

/**
 * Formats a number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
function formatNumber(num) {
  if (typeof num !== 'number' || isNaN(num)) {
    return '0';
  }
  return num.toLocaleString();
}

/**
 * Formats bytes to human-readable size
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size
 */
function formatFileSize(bytes) {
  if (typeof bytes !== 'number' || isNaN(bytes)) {
    return 'N/A';
  }
  
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
}

/**
 * Generates the comment body markdown
 * @param {object} options - Comment options
 * @returns {string} Markdown comment body
 */
function generateCommentBody(options) {
  const {
    version,
    marketplaceUrl,
    installCount,
    downloadCount,
    fileSize,
    workflowUrl
  } = options;
  
  let comment = '## 🚀 Deployment Successful!\n\n';
  comment += `The extension **version ${version}** has been successfully deployed to the VS Code Marketplace.\n\n`;
  
  comment += '### 📦 Extension Information\n\n';
  comment += `- **Version:** ${version}\n`;
  comment += `- **Marketplace:** [View Extension](${marketplaceUrl})\n`;
  
  if (installCount !== undefined) {
    comment += `- **Installs:** ${formatNumber(installCount)}\n`;
  }
  
  if (downloadCount !== undefined) {
    comment += `- **Downloads:** ${formatNumber(downloadCount)}\n`;
  }
  
  if (fileSize !== undefined) {
    comment += `- **Package Size:** ${formatFileSize(fileSize)}\n`;
  }
  
  comment += '\n### 📊 Deployment Metrics\n\n';
  comment += '- **Status:** ✅ Verified live on marketplace\n';
  comment += `- **Deployment Time:** ${new Date().toISOString()}\n`;
  
  if (workflowUrl) {
    comment += `- **Workflow Run:** [View Details](${workflowUrl})\n`;
  }
  
  comment += '\n### 🎯 Next Steps\n\n';
  comment += '1. **Install the extension:**\n';
  comment += '   ```bash\n';
  comment += '   code --install-extension pragmatic-rhino.pragmatic-rhino-suit\n';
  comment += '   ```\n\n';
  comment += '2. **Test the new version** to ensure all features work as expected\n\n';
  comment += '3. **Monitor marketplace metrics** for user feedback and adoption\n\n';
  comment += '4. **Check for issues** reported by users\n\n';
  
  comment += '---\n\n';
  comment += '*This comment was automatically generated by the deployment workflow.*';
  
  return comment;
}

/**
 * Parses command line arguments
 * @param {string[]} args - Command line arguments
 * @returns {object} Parsed arguments
 */
function parseArguments(args) {
  if (args.length < 3) {
    throw new Error('Missing required arguments: release-id, version, and marketplace-url are required');
  }
  
  const parsed = {
    releaseId: args[0],
    version: args[1],
    marketplaceUrl: args[2],
    installCount: undefined,
    downloadCount: undefined,
    fileSize: undefined,
    workflowUrl: undefined
  };
  
  // Parse optional arguments
  for (let i = 3; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--install-count' && i + 1 < args.length) {
      parsed.installCount = parseInt(args[++i], 10);
    } else if (arg === '--download-count' && i + 1 < args.length) {
      parsed.downloadCount = parseInt(args[++i], 10);
    } else if (arg === '--file-size' && i + 1 < args.length) {
      parsed.fileSize = parseInt(args[++i], 10);
    } else if (arg === '--workflow-url' && i + 1 < args.length) {
      parsed.workflowUrl = args[++i];
    }
  }
  
  return parsed;
}

/**
 * Main function
 */
async function main() {
  try {
    const args = process.argv.slice(2);
    
    // Validate environment variables
    const token = process.env.GITHUB_TOKEN;
    const repository = process.env.GITHUB_REPOSITORY;
    
    if (!token) {
      console.error('❌ Error: GITHUB_TOKEN environment variable is required');
      process.exit(1);
    }
    
    if (!repository) {
      console.error('❌ Error: GITHUB_REPOSITORY environment variable is required');
      process.exit(1);
    }
    
    const [owner, repo] = repository.split('/');
    
    if (!owner || !repo) {
      console.error(`❌ Error: Invalid GITHUB_REPOSITORY format: ${repository}`);
      console.error('Expected format: owner/repo');
      process.exit(1);
    }
    
    // Parse arguments
    let options;
    try {
      options = parseArguments(args);
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      console.error('\nUsage:');
      console.error('  node scripts/post-release-comment.js <release-id> <version> <marketplace-url> [options]');
      console.error('\nOptions:');
      console.error('  --install-count <number>   Number of installs');
      console.error('  --download-count <number>  Number of downloads');
      console.error('  --file-size <bytes>        VSIX file size in bytes');
      console.error('  --workflow-url <url>       Link to workflow run');
      console.error('\nExample:');
      console.error('  node scripts/post-release-comment.js 123456 1.0.0 https://marketplace.visualstudio.com/items?itemName=publisher.extension \\');
      console.error('    --install-count 100 --download-count 250 --file-size 1048576');
      process.exit(1);
    }
    
    console.log('📝 Posting deployment success comment to GitHub release...\n');
    console.log(`Repository: ${owner}/${repo}`);
    console.log(`Release ID: ${options.releaseId}`);
    console.log(`Version: ${options.version}`);
    console.log();
    
    // Generate comment body
    const commentBody = generateCommentBody(options);
    
    // Post comment
    const response = await postReleaseComment(owner, repo, options.releaseId, commentBody, token);
    
    console.log('✅ Comment posted successfully!\n');
    console.log(`Comment ID: ${response.id}`);
    console.log(`Comment URL: ${response.html_url}`);
    console.log();
    
    process.exit(0);
    
  } catch (error) {
    console.error(`❌ Failed to post comment: ${error.message}\n`);
    
    console.error('Troubleshooting:');
    console.error('  1. Verify GITHUB_TOKEN has correct permissions (write:discussion)');
    console.error('  2. Verify the release ID is correct');
    console.error('  3. Check GitHub API status: https://www.githubstatus.com/');
    console.error('  4. Ensure the repository exists and is accessible');
    
    process.exit(1);
  }
}

// Export functions for testing
if (require.main === module) {
  main();
} else {
  module.exports = {
    postReleaseComment,
    generateCommentBody,
    formatNumber,
    formatFileSize,
    parseArguments
  };
}
