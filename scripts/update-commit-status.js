#!/usr/bin/env node

/**
 * GitHub Commit Status Update Script
 * 
 * Updates GitHub commit status checks for workflows to provide visibility
 * into build, test, and deployment status directly on commits.
 * 
 * Usage:
 *   node scripts/update-commit-status.js --state <state> --context <context> [options]
 * 
 * Options:
 *   --state         Status state: pending, success, failure, error
 *   --context       Status context (e.g., "ci/build", "ci/test", "deploy/marketplace")
 *   --description   Short description of the status
 *   --target-url    URL to link to (e.g., workflow run URL)
 *   --sha           Commit SHA (defaults to GITHUB_SHA env var)
 *   --repo          Repository in format "owner/repo" (defaults to GITHUB_REPOSITORY)
 *   --token         GitHub token (defaults to GITHUB_TOKEN env var)
 */

const https = require('https');

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    state: null,
    context: null,
    description: '',
    targetUrl: null,
    sha: process.env.GITHUB_SHA || null,
    repo: process.env.GITHUB_REPOSITORY || null,
    token: process.env.GITHUB_TOKEN || null
  };

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    
    // Convert kebab-case to camelCase
    const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    
    if (Object.prototype.hasOwnProperty.call(options, camelKey)) {
      options[camelKey] = value;
    }
  }

  return options;
}

/**
 * Validate options
 */
function validateOptions(options) {
  const errors = [];

  const validStates = ['pending', 'success', 'failure', 'error'];
  if (!options.state) {
    errors.push('--state is required');
  } else if (!validStates.includes(options.state)) {
    errors.push(`Invalid state: ${options.state}. Must be one of: ${validStates.join(', ')}`);
  }

  if (!options.context) {
    errors.push('--context is required');
  }

  if (!options.sha) {
    errors.push('--sha is required (or set GITHUB_SHA environment variable)');
  }

  if (!options.repo) {
    errors.push('--repo is required (or set GITHUB_REPOSITORY environment variable)');
  }

  if (!options.token) {
    errors.push('--token is required (or set GITHUB_TOKEN environment variable)');
  }

  if (errors.length > 0) {
    throw new Error(`Validation errors:\n${errors.join('\n')}`);
  }
}

/**
 * Make HTTPS request to GitHub API
 */
function makeGitHubRequest(options, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const requestOptions = {
      hostname: 'api.github.com',
      port: 443,
      path: options.path,
      method: options.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Bearer ${options.token}`,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'pragmatic-rhino-suit-ci'
      }
    };

    const req = https.request(requestOptions, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsed = JSON.parse(responseData);
            resolve({ success: true, statusCode: res.statusCode, data: parsed });
          } catch (error) {
            resolve({ success: true, statusCode: res.statusCode, data: responseData });
          }
        } else {
          reject(new Error(`GitHub API request failed with status ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request error: ${error.message}`));
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Update commit status on GitHub
 */
async function updateCommitStatus(options) {
  validateOptions(options);

  const statusData = {
    state: options.state,
    context: options.context,
    description: options.description || getDefaultDescription(options.state, options.context),
    target_url: options.targetUrl || undefined
  };

  const apiPath = `/repos/${options.repo}/statuses/${options.sha}`;

  console.log(`📝 Updating commit status for ${options.sha.substring(0, 7)}...`);
  console.log(`   Context: ${options.context}`);
  console.log(`   State: ${options.state}`);
  console.log(`   Description: ${statusData.description}`);

  try {
    const result = await makeGitHubRequest(
      {
        path: apiPath,
        method: 'POST',
        token: options.token
      },
      statusData
    );

    console.log(`✅ Commit status updated successfully`);
    if (options.targetUrl) {
      console.log(`   URL: ${options.targetUrl}`);
    }

    return { success: true, result };
  } catch (error) {
    console.error(`❌ Failed to update commit status: ${error.message}`);
    throw error;
  }
}

/**
 * Get default description based on state and context
 */
function getDefaultDescription(state, context) {
  // Extract the last part of the context (after the slash) for matching
  // e.g., "ci/build" -> "build", "deploy/marketplace" -> "marketplace"
  // But for "deploy/*" contexts, use "deploy" as the key
  const contextParts = context.split('/');
  let contextName;
  
  if (contextParts[0] === 'deploy') {
    contextName = 'deploy';
  } else {
    contextName = contextParts[contextParts.length - 1];
  }
  
  const descriptions = {
    pending: {
      build: 'Build in progress...',
      ci: 'Build in progress...',
      test: 'Running tests...',
      lint: 'Linting code...',
      coverage: 'Checking coverage...',
      security: 'Scanning for vulnerabilities...',
      'quality-gates': 'Scanning for vulnerabilities...',
      package: 'Creating package...',
      deploy: 'Deploying to marketplace...',
      default: 'In progress...'
    },
    success: {
      build: 'Build passed',
      ci: 'Build passed',
      test: 'All tests passed',
      lint: 'Linting passed',
      coverage: 'Coverage threshold met',
      security: 'No vulnerabilities found',
      'quality-gates': 'No vulnerabilities found',
      package: 'Package created successfully',
      deploy: 'Deployed successfully',
      default: 'Completed successfully'
    },
    failure: {
      build: 'Build failed',
      ci: 'Build failed',
      test: 'Tests failed',
      lint: 'Linting failed',
      coverage: 'Coverage below threshold',
      security: 'Vulnerabilities detected',
      'quality-gates': 'Vulnerabilities detected',
      package: 'Package creation failed',
      deploy: 'Deployment failed',
      default: 'Failed'
    },
    error: {
      build: 'Build error',
      ci: 'Build error',
      test: 'Test execution error',
      lint: 'Linting error',
      coverage: 'Coverage check error',
      security: 'Security scan error',
      'quality-gates': 'Security scan error',
      package: 'Package error',
      deploy: 'Deployment error',
      default: 'Error occurred'
    }
  };

  return descriptions[state]?.[contextName] || descriptions[state]?.default || 'Status update';
}

/**
 * Main execution
 */
async function main() {
  try {
    const options = parseArgs();
    await updateCommitStatus(options);
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Export functions for testing
if (require.main === module) {
  main();
} else {
  module.exports = {
    parseArgs,
    validateOptions,
    updateCommitStatus,
    getDefaultDescription,
    makeGitHubRequest
  };
}
