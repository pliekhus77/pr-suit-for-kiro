#!/usr/bin/env node

/**
 * Notification Helper Script
 * 
 * Sends notifications to various channels for CI/CD workflow events.
 * Supports multiple notification types and formats messages appropriately.
 * 
 * Usage:
 *   node scripts/send-notification.js --type <type> --status <status> [options]
 * 
 * Options:
 *   --type        Notification type: build, deploy, rollback, security
 *   --status      Status: success, failure, warning
 *   --message     Custom message
 *   --details     Additional details
 *   --url         Workflow run URL
 *   --version     Version number (for deploy notifications)
 *   --marketplace Marketplace URL (for deploy notifications)
 *   --channel     Notification channel: console, github, slack, teams
 */

const fs = require('fs');
const https = require('https');

/**
 * Notification types and their default messages
 */
const NOTIFICATION_TYPES = {
  build: {
    success: '✅ Build completed successfully',
    failure: '❌ Build failed',
    warning: '⚠️ Build completed with warnings'
  },
  deploy: {
    success: '🚀 Deployment successful',
    failure: '❌ Deployment failed',
    warning: '⚠️ Deployment completed with warnings'
  },
  rollback: {
    success: '↩️ Rollback completed successfully',
    failure: '❌ Rollback failed',
    warning: '⚠️ Rollback completed with warnings'
  },
  security: {
    success: '🔒 Security scan passed',
    failure: '🚨 Security vulnerabilities detected',
    warning: '⚠️ Security scan completed with warnings'
  }
};

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    type: 'build',
    status: 'success',
    message: null,
    details: null,
    url: null,
    version: null,
    marketplace: null,
    channel: 'console'
  };

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    if (options.hasOwnProperty(key)) {
      options[key] = value;
    }
  }

  return options;
}

/**
 * Validate options
 */
function validateOptions(options) {
  const errors = [];

  if (!NOTIFICATION_TYPES[options.type]) {
    errors.push(`Invalid notification type: ${options.type}. Must be one of: ${Object.keys(NOTIFICATION_TYPES).join(', ')}`);
  }

  if (!['success', 'failure', 'warning'].includes(options.status)) {
    errors.push(`Invalid status: ${options.status}. Must be one of: success, failure, warning`);
  }

  if (!['console', 'github', 'slack', 'teams'].includes(options.channel)) {
    errors.push(`Invalid channel: ${options.channel}. Must be one of: console, github, slack, teams`);
  }

  if (errors.length > 0) {
    throw new Error(`Validation errors:\n${errors.join('\n')}`);
  }
}

/**
 * Format notification message
 */
function formatMessage(options) {
  const defaultMessage = NOTIFICATION_TYPES[options.type][options.status];
  const message = options.message || defaultMessage;

  let formattedMessage = `${message}\n`;

  if (options.version) {
    formattedMessage += `\nVersion: ${options.version}`;
  }

  if (options.details) {
    formattedMessage += `\nDetails: ${options.details}`;
  }

  if (options.marketplace) {
    formattedMessage += `\nMarketplace: ${options.marketplace}`;
  }

  if (options.url) {
    formattedMessage += `\nWorkflow: ${options.url}`;
  }

  return formattedMessage;
}

/**
 * Format message for GitHub Actions
 */
function formatGitHubMessage(options) {
  const message = formatMessage(options);
  
  // Use GitHub Actions annotations
  if (options.status === 'failure') {
    return `::error::${message}`;
  } else if (options.status === 'warning') {
    return `::warning::${message}`;
  } else {
    return `::notice::${message}`;
  }
}

/**
 * Format message for Slack
 */
function formatSlackMessage(options) {
  const emoji = options.status === 'success' ? ':white_check_mark:' : 
                options.status === 'failure' ? ':x:' : ':warning:';
  
  const color = options.status === 'success' ? 'good' : 
                options.status === 'failure' ? 'danger' : 'warning';

  const fields = [];
  
  if (options.version) {
    fields.push({
      title: 'Version',
      value: options.version,
      short: true
    });
  }

  if (options.details) {
    fields.push({
      title: 'Details',
      value: options.details,
      short: false
    });
  }

  return {
    attachments: [{
      color: color,
      title: `${emoji} ${options.message || NOTIFICATION_TYPES[options.type][options.status]}`,
      fields: fields,
      actions: [
        ...(options.marketplace ? [{
          type: 'button',
          text: 'View on Marketplace',
          url: options.marketplace
        }] : []),
        ...(options.url ? [{
          type: 'button',
          text: 'View Workflow',
          url: options.url
        }] : [])
      ],
      footer: 'GitHub Actions',
      ts: Math.floor(Date.now() / 1000)
    }]
  };
}

/**
 * Format message for Microsoft Teams
 */
function formatTeamsMessage(options) {
  const themeColor = options.status === 'success' ? '00FF00' : 
                     options.status === 'failure' ? 'FF0000' : 'FFA500';

  const facts = [];
  
  if (options.version) {
    facts.push({
      name: 'Version',
      value: options.version
    });
  }

  if (options.details) {
    facts.push({
      name: 'Details',
      value: options.details
    });
  }

  const potentialActions = [];
  
  if (options.marketplace) {
    potentialActions.push({
      '@type': 'OpenUri',
      name: 'View on Marketplace',
      targets: [{
        os: 'default',
        uri: options.marketplace
      }]
    });
  }

  if (options.url) {
    potentialActions.push({
      '@type': 'OpenUri',
      name: 'View Workflow',
      targets: [{
        os: 'default',
        uri: options.url
      }]
    });
  }

  return {
    '@type': 'MessageCard',
    '@context': 'https://schema.org/extensions',
    themeColor: themeColor,
    title: options.message || NOTIFICATION_TYPES[options.type][options.status],
    text: options.details || '',
    sections: facts.length > 0 ? [{
      facts: facts
    }] : [],
    potentialAction: potentialActions
  };
}

/**
 * Send notification to console
 */
function sendToConsole(options) {
  const message = formatMessage(options);
  console.log(message);
  return Promise.resolve({ success: true, channel: 'console' });
}

/**
 * Send notification to GitHub Actions
 */
function sendToGitHub(options) {
  const message = formatGitHubMessage(options);
  console.log(message);
  
  // Also write to GitHub step summary if available
  const summaryFile = process.env.GITHUB_STEP_SUMMARY;
  if (summaryFile) {
    const markdownMessage = `## ${options.message || NOTIFICATION_TYPES[options.type][options.status]}\n\n${formatMessage(options)}`;
    fs.appendFileSync(summaryFile, markdownMessage + '\n\n');
  }
  
  return Promise.resolve({ success: true, channel: 'github' });
}

/**
 * Send notification to Slack
 */
function sendToSlack(options) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn('SLACK_WEBHOOK_URL not configured, skipping Slack notification');
    return Promise.resolve({ success: false, channel: 'slack', error: 'Webhook URL not configured' });
  }

  const payload = formatSlackMessage(options);
  
  return sendWebhook(webhookUrl, payload)
    .then(() => ({ success: true, channel: 'slack' }))
    .catch(error => ({ success: false, channel: 'slack', error: error.message }));
}

/**
 * Send notification to Microsoft Teams
 */
function sendToTeams(options) {
  const webhookUrl = process.env.TEAMS_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn('TEAMS_WEBHOOK_URL not configured, skipping Teams notification');
    return Promise.resolve({ success: false, channel: 'teams', error: 'Webhook URL not configured' });
  }

  const payload = formatTeamsMessage(options);
  
  return sendWebhook(webhookUrl, payload)
    .then(() => ({ success: true, channel: 'teams' }))
    .catch(error => ({ success: false, channel: 'teams', error: error.message }));
}

/**
 * Send webhook request
 */
function sendWebhook(url, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(responseData);
        } else {
          reject(new Error(`Webhook request failed with status ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

/**
 * Send notification to specified channel
 */
async function sendNotification(options) {
  validateOptions(options);

  switch (options.channel) {
    case 'console':
      return sendToConsole(options);
    case 'github':
      return sendToGitHub(options);
    case 'slack':
      return sendToSlack(options);
    case 'teams':
      return sendToTeams(options);
    default:
      throw new Error(`Unsupported channel: ${options.channel}`);
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    const options = parseArgs();
    const result = await sendNotification(options);
    
    if (result.success) {
      console.log(`✅ Notification sent successfully to ${result.channel}`);
      process.exit(0);
    } else {
      console.error(`❌ Failed to send notification to ${result.channel}: ${result.error}`);
      process.exit(1);
    }
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
    formatMessage,
    formatGitHubMessage,
    formatSlackMessage,
    formatTeamsMessage,
    sendNotification,
    NOTIFICATION_TYPES
  };
}
