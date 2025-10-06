/**
 * Unit tests for send-notification.js
 * 
 * Tests message formatting, channel selection, and error handling
 * for the notification helper script.
 */

const {
  parseArgs,
  validateOptions,
  formatMessage,
  formatGitHubMessage,
  formatSlackMessage,
  formatTeamsMessage,
  sendNotification,
  NOTIFICATION_TYPES
} = require('../send-notification.js');

describe('send-notification', () => {
  
  describe('parseArgs', () => {
    let originalArgv;

    beforeEach(() => {
      originalArgv = process.argv;
    });

    afterEach(() => {
      process.argv = originalArgv;
    });

    it('should parse basic arguments', () => {
      process.argv = ['node', 'script.js', '--type', 'build', '--status', 'success'];
      const options = parseArgs();
      
      expect(options.type).toBe('build');
      expect(options.status).toBe('success');
    });

    it('should parse all available arguments', () => {
      process.argv = [
        'node', 'script.js',
        '--type', 'deploy',
        '--status', 'failure',
        '--message', 'Custom message',
        '--details', 'Error details',
        '--url', 'https://github.com/workflow/123',
        '--version', '1.2.3',
        '--marketplace', 'https://marketplace.visualstudio.com/items?itemName=test',
        '--channel', 'slack'
      ];
      const options = parseArgs();
      
      expect(options.type).toBe('deploy');
      expect(options.status).toBe('failure');
      expect(options.message).toBe('Custom message');
      expect(options.details).toBe('Error details');
      expect(options.url).toBe('https://github.com/workflow/123');
      expect(options.version).toBe('1.2.3');
      expect(options.marketplace).toBe('https://marketplace.visualstudio.com/items?itemName=test');
      expect(options.channel).toBe('slack');
    });

    it('should use default values for missing arguments', () => {
      process.argv = ['node', 'script.js'];
      const options = parseArgs();
      
      expect(options.type).toBe('build');
      expect(options.status).toBe('success');
      expect(options.message).toBeNull();
      expect(options.details).toBeNull();
      expect(options.url).toBeNull();
      expect(options.version).toBeNull();
      expect(options.marketplace).toBeNull();
      expect(options.channel).toBe('console');
    });

    it('should ignore unknown arguments', () => {
      process.argv = ['node', 'script.js', '--unknown', 'value', '--type', 'build'];
      const options = parseArgs();
      
      expect(options.type).toBe('build');
      expect(options).not.toHaveProperty('unknown');
    });
  });

  describe('validateOptions', () => {
    it('should accept valid options', () => {
      const options = {
        type: 'build',
        status: 'success',
        channel: 'console'
      };
      
      expect(() => validateOptions(options)).not.toThrow();
    });

    it('should reject invalid notification type', () => {
      const options = {
        type: 'invalid',
        status: 'success',
        channel: 'console'
      };
      
      expect(() => validateOptions(options)).toThrow('Invalid notification type');
    });

    it('should reject invalid status', () => {
      const options = {
        type: 'build',
        status: 'invalid',
        channel: 'console'
      };
      
      expect(() => validateOptions(options)).toThrow('Invalid status');
    });

    it('should reject invalid channel', () => {
      const options = {
        type: 'build',
        status: 'success',
        channel: 'invalid'
      };
      
      expect(() => validateOptions(options)).toThrow('Invalid channel');
    });

    it('should report multiple validation errors', () => {
      const options = {
        type: 'invalid',
        status: 'invalid',
        channel: 'invalid'
      };
      
      expect(() => validateOptions(options)).toThrow('Validation errors');
    });

    it('should accept all valid notification types', () => {
      const types = ['build', 'deploy', 'rollback', 'security'];
      
      types.forEach(type => {
        const options = { type, status: 'success', channel: 'console' };
        expect(() => validateOptions(options)).not.toThrow();
      });
    });

    it('should accept all valid statuses', () => {
      const statuses = ['success', 'failure', 'warning'];
      
      statuses.forEach(status => {
        const options = { type: 'build', status, channel: 'console' };
        expect(() => validateOptions(options)).not.toThrow();
      });
    });

    it('should accept all valid channels', () => {
      const channels = ['console', 'github', 'slack', 'teams'];
      
      channels.forEach(channel => {
        const options = { type: 'build', status: 'success', channel };
        expect(() => validateOptions(options)).not.toThrow();
      });
    });
  });

  describe('formatMessage', () => {
    it('should format basic message with default text', () => {
      const options = {
        type: 'build',
        status: 'success'
      };
      
      const message = formatMessage(options);
      
      expect(message).toContain('✅ Build completed successfully');
    });

    it('should use custom message when provided', () => {
      const options = {
        type: 'build',
        status: 'success',
        message: 'Custom success message'
      };
      
      const message = formatMessage(options);
      
      expect(message).toContain('Custom success message');
      expect(message).not.toContain('Build completed successfully');
    });

    it('should include version when provided', () => {
      const options = {
        type: 'deploy',
        status: 'success',
        version: '1.2.3'
      };
      
      const message = formatMessage(options);
      
      expect(message).toContain('Version: 1.2.3');
    });

    it('should include details when provided', () => {
      const options = {
        type: 'build',
        status: 'failure',
        details: 'Compilation error in file.ts'
      };
      
      const message = formatMessage(options);
      
      expect(message).toContain('Details: Compilation error in file.ts');
    });

    it('should include marketplace URL when provided', () => {
      const options = {
        type: 'deploy',
        status: 'success',
        marketplace: 'https://marketplace.visualstudio.com/items?itemName=test'
      };
      
      const message = formatMessage(options);
      
      expect(message).toContain('Marketplace: https://marketplace.visualstudio.com/items?itemName=test');
    });

    it('should include workflow URL when provided', () => {
      const options = {
        type: 'build',
        status: 'failure',
        url: 'https://github.com/owner/repo/actions/runs/123'
      };
      
      const message = formatMessage(options);
      
      expect(message).toContain('Workflow: https://github.com/owner/repo/actions/runs/123');
    });

    it('should include all optional fields when provided', () => {
      const options = {
        type: 'deploy',
        status: 'success',
        version: '1.2.3',
        details: 'Deployed successfully',
        marketplace: 'https://marketplace.visualstudio.com/items?itemName=test',
        url: 'https://github.com/owner/repo/actions/runs/123'
      };
      
      const message = formatMessage(options);
      
      expect(message).toContain('Version: 1.2.3');
      expect(message).toContain('Details: Deployed successfully');
      expect(message).toContain('Marketplace:');
      expect(message).toContain('Workflow:');
    });

    it('should format different notification types correctly', () => {
      const types = [
        { type: 'build', status: 'success', expected: '✅ Build completed successfully' },
        { type: 'build', status: 'failure', expected: '❌ Build failed' },
        { type: 'deploy', status: 'success', expected: '🚀 Deployment successful' },
        { type: 'rollback', status: 'success', expected: '↩️ Rollback completed successfully' },
        { type: 'security', status: 'failure', expected: '🚨 Security vulnerabilities detected' }
      ];
      
      types.forEach(({ type, status, expected }) => {
        const message = formatMessage({ type, status });
        expect(message).toContain(expected);
      });
    });
  });

  describe('formatGitHubMessage', () => {
    it('should format failure as error annotation', () => {
      const options = {
        type: 'build',
        status: 'failure',
        message: 'Build failed'
      };
      
      const message = formatGitHubMessage(options);
      
      expect(message).toContain('::error::');
      expect(message).toContain('Build failed');
    });

    it('should format warning as warning annotation', () => {
      const options = {
        type: 'build',
        status: 'warning',
        message: 'Build completed with warnings'
      };
      
      const message = formatGitHubMessage(options);
      
      expect(message).toContain('::warning::');
      expect(message).toContain('Build completed with warnings');
    });

    it('should format success as notice annotation', () => {
      const options = {
        type: 'build',
        status: 'success',
        message: 'Build successful'
      };
      
      const message = formatGitHubMessage(options);
      
      expect(message).toContain('::notice::');
      expect(message).toContain('Build successful');
    });
  });

  describe('formatSlackMessage', () => {
    it('should format success message with correct color', () => {
      const options = {
        type: 'build',
        status: 'success',
        message: 'Build successful'
      };
      
      const payload = formatSlackMessage(options);
      
      expect(payload.attachments[0].color).toBe('good');
      expect(payload.attachments[0].title).toContain(':white_check_mark:');
      expect(payload.attachments[0].title).toContain('Build successful');
    });

    it('should format failure message with correct color', () => {
      const options = {
        type: 'build',
        status: 'failure',
        message: 'Build failed'
      };
      
      const payload = formatSlackMessage(options);
      
      expect(payload.attachments[0].color).toBe('danger');
      expect(payload.attachments[0].title).toContain(':x:');
      expect(payload.attachments[0].title).toContain('Build failed');
    });

    it('should format warning message with correct color', () => {
      const options = {
        type: 'build',
        status: 'warning',
        message: 'Build warning'
      };
      
      const payload = formatSlackMessage(options);
      
      expect(payload.attachments[0].color).toBe('warning');
      expect(payload.attachments[0].title).toContain(':warning:');
    });

    it('should include version field when provided', () => {
      const options = {
        type: 'deploy',
        status: 'success',
        version: '1.2.3'
      };
      
      const payload = formatSlackMessage(options);
      
      const versionField = payload.attachments[0].fields.find(f => f.title === 'Version');
      expect(versionField).toBeDefined();
      expect(versionField.value).toBe('1.2.3');
      expect(versionField.short).toBe(true);
    });

    it('should include details field when provided', () => {
      const options = {
        type: 'build',
        status: 'failure',
        details: 'Compilation error'
      };
      
      const payload = formatSlackMessage(options);
      
      const detailsField = payload.attachments[0].fields.find(f => f.title === 'Details');
      expect(detailsField).toBeDefined();
      expect(detailsField.value).toBe('Compilation error');
      expect(detailsField.short).toBe(false);
    });

    it('should include marketplace button when URL provided', () => {
      const options = {
        type: 'deploy',
        status: 'success',
        marketplace: 'https://marketplace.visualstudio.com/items?itemName=test'
      };
      
      const payload = formatSlackMessage(options);
      
      const marketplaceAction = payload.attachments[0].actions.find(
        a => a.text === 'View on Marketplace'
      );
      expect(marketplaceAction).toBeDefined();
      expect(marketplaceAction.url).toBe('https://marketplace.visualstudio.com/items?itemName=test');
    });

    it('should include workflow button when URL provided', () => {
      const options = {
        type: 'build',
        status: 'failure',
        url: 'https://github.com/owner/repo/actions/runs/123'
      };
      
      const payload = formatSlackMessage(options);
      
      const workflowAction = payload.attachments[0].actions.find(
        a => a.text === 'View Workflow'
      );
      expect(workflowAction).toBeDefined();
      expect(workflowAction.url).toBe('https://github.com/owner/repo/actions/runs/123');
    });

    it('should include timestamp', () => {
      const options = {
        type: 'build',
        status: 'success'
      };
      
      const payload = formatSlackMessage(options);
      
      expect(payload.attachments[0].ts).toBeDefined();
      expect(typeof payload.attachments[0].ts).toBe('number');
    });

    it('should include footer', () => {
      const options = {
        type: 'build',
        status: 'success'
      };
      
      const payload = formatSlackMessage(options);
      
      expect(payload.attachments[0].footer).toBe('GitHub Actions');
    });
  });

  describe('formatTeamsMessage', () => {
    it('should format success message with correct theme color', () => {
      const options = {
        type: 'build',
        status: 'success',
        message: 'Build successful'
      };
      
      const payload = formatTeamsMessage(options);
      
      expect(payload.themeColor).toBe('00FF00');
      expect(payload.title).toBe('Build successful');
    });

    it('should format failure message with correct theme color', () => {
      const options = {
        type: 'build',
        status: 'failure',
        message: 'Build failed'
      };
      
      const payload = formatTeamsMessage(options);
      
      expect(payload.themeColor).toBe('FF0000');
      expect(payload.title).toBe('Build failed');
    });

    it('should format warning message with correct theme color', () => {
      const options = {
        type: 'build',
        status: 'warning',
        message: 'Build warning'
      };
      
      const payload = formatTeamsMessage(options);
      
      expect(payload.themeColor).toBe('FFA500');
    });

    it('should include version fact when provided', () => {
      const options = {
        type: 'deploy',
        status: 'success',
        version: '1.2.3'
      };
      
      const payload = formatTeamsMessage(options);
      
      const versionFact = payload.sections[0].facts.find(f => f.name === 'Version');
      expect(versionFact).toBeDefined();
      expect(versionFact.value).toBe('1.2.3');
    });

    it('should include details fact when provided', () => {
      const options = {
        type: 'build',
        status: 'failure',
        details: 'Compilation error'
      };
      
      const payload = formatTeamsMessage(options);
      
      const detailsFact = payload.sections[0].facts.find(f => f.name === 'Details');
      expect(detailsFact).toBeDefined();
      expect(detailsFact.value).toBe('Compilation error');
    });

    it('should include marketplace action when URL provided', () => {
      const options = {
        type: 'deploy',
        status: 'success',
        marketplace: 'https://marketplace.visualstudio.com/items?itemName=test'
      };
      
      const payload = formatTeamsMessage(options);
      
      const marketplaceAction = payload.potentialAction.find(
        a => a.name === 'View on Marketplace'
      );
      expect(marketplaceAction).toBeDefined();
      expect(marketplaceAction['@type']).toBe('OpenUri');
      expect(marketplaceAction.targets[0].uri).toBe('https://marketplace.visualstudio.com/items?itemName=test');
    });

    it('should include workflow action when URL provided', () => {
      const options = {
        type: 'build',
        status: 'failure',
        url: 'https://github.com/owner/repo/actions/runs/123'
      };
      
      const payload = formatTeamsMessage(options);
      
      const workflowAction = payload.potentialAction.find(
        a => a.name === 'View Workflow'
      );
      expect(workflowAction).toBeDefined();
      expect(workflowAction.targets[0].uri).toBe('https://github.com/owner/repo/actions/runs/123');
    });

    it('should include MessageCard type and context', () => {
      const options = {
        type: 'build',
        status: 'success'
      };
      
      const payload = formatTeamsMessage(options);
      
      expect(payload['@type']).toBe('MessageCard');
      expect(payload['@context']).toBe('https://schema.org/extensions');
    });

    it('should use details as text when provided', () => {
      const options = {
        type: 'build',
        status: 'success',
        details: 'Build completed in 2 minutes'
      };
      
      const payload = formatTeamsMessage(options);
      
      expect(payload.text).toBe('Build completed in 2 minutes');
    });
  });

  describe('sendNotification', () => {
    let consoleLogSpy;
    let consoleWarnSpy;

    beforeEach(() => {
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
      consoleWarnSpy.mockRestore();
      delete process.env.SLACK_WEBHOOK_URL;
      delete process.env.TEAMS_WEBHOOK_URL;
      delete process.env.GITHUB_STEP_SUMMARY;
    });

    it('should send to console channel', async () => {
      const options = {
        type: 'build',
        status: 'success',
        channel: 'console'
      };
      
      const result = await sendNotification(options);
      
      expect(result.success).toBe(true);
      expect(result.channel).toBe('console');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should send to github channel', async () => {
      const options = {
        type: 'build',
        status: 'success',
        channel: 'github'
      };
      
      const result = await sendNotification(options);
      
      expect(result.success).toBe(true);
      expect(result.channel).toBe('github');
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('should fail for slack channel without webhook URL', async () => {
      const options = {
        type: 'build',
        status: 'success',
        channel: 'slack'
      };
      
      const result = await sendNotification(options);
      
      expect(result.success).toBe(false);
      expect(result.channel).toBe('slack');
      expect(result.error).toContain('Webhook URL not configured');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('SLACK_WEBHOOK_URL not configured')
      );
    });

    it('should fail for teams channel without webhook URL', async () => {
      const options = {
        type: 'build',
        status: 'success',
        channel: 'teams'
      };
      
      const result = await sendNotification(options);
      
      expect(result.success).toBe(false);
      expect(result.channel).toBe('teams');
      expect(result.error).toContain('Webhook URL not configured');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('TEAMS_WEBHOOK_URL not configured')
      );
    });

    it('should throw error for invalid options', async () => {
      const options = {
        type: 'invalid',
        status: 'success',
        channel: 'console'
      };
      
      await expect(sendNotification(options)).rejects.toThrow('Invalid notification type');
    });

    it('should throw error for unsupported channel', async () => {
      const options = {
        type: 'build',
        status: 'success',
        channel: 'unsupported'
      };
      
      await expect(sendNotification(options)).rejects.toThrow('Invalid channel');
    });
  });

  describe('NOTIFICATION_TYPES', () => {
    it('should define all notification types', () => {
      expect(NOTIFICATION_TYPES).toHaveProperty('build');
      expect(NOTIFICATION_TYPES).toHaveProperty('deploy');
      expect(NOTIFICATION_TYPES).toHaveProperty('rollback');
      expect(NOTIFICATION_TYPES).toHaveProperty('security');
    });

    it('should define all statuses for each type', () => {
      Object.keys(NOTIFICATION_TYPES).forEach(type => {
        expect(NOTIFICATION_TYPES[type]).toHaveProperty('success');
        expect(NOTIFICATION_TYPES[type]).toHaveProperty('failure');
        expect(NOTIFICATION_TYPES[type]).toHaveProperty('warning');
      });
    });

    it('should have non-empty messages for all combinations', () => {
      Object.keys(NOTIFICATION_TYPES).forEach(type => {
        ['success', 'failure', 'warning'].forEach(status => {
          expect(NOTIFICATION_TYPES[type][status]).toBeTruthy();
          expect(typeof NOTIFICATION_TYPES[type][status]).toBe('string');
          expect(NOTIFICATION_TYPES[type][status].length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string values gracefully', () => {
      const options = {
        type: 'build',
        status: 'success',
        message: '',
        details: '',
        version: ''
      };
      
      const message = formatMessage(options);
      expect(message).toBeDefined();
    });

    it('should handle very long messages', () => {
      const longMessage = 'A'.repeat(10000);
      const options = {
        type: 'build',
        status: 'success',
        message: longMessage
      };
      
      const message = formatMessage(options);
      expect(message).toContain(longMessage);
    });

    it('should handle special characters in messages', () => {
      const options = {
        type: 'build',
        status: 'success',
        message: 'Test with special chars: <>&"\'',
        details: 'Details with\nnewlines\tand\ttabs'
      };
      
      const message = formatMessage(options);
      expect(message).toContain('special chars');
      expect(message).toContain('newlines');
    });

    it('should handle URLs with query parameters', () => {
      const options = {
        type: 'deploy',
        status: 'success',
        marketplace: 'https://marketplace.visualstudio.com/items?itemName=test&version=1.2.3',
        url: 'https://github.com/owner/repo/actions/runs/123?check_suite_focus=true'
      };
      
      const message = formatMessage(options);
      expect(message).toContain('itemName=test&version=1.2.3');
      expect(message).toContain('check_suite_focus=true');
    });
  });

  describe('GitHub Step Summary', () => {
    let originalSummaryFile;
    let mockAppendFileSync;

    beforeEach(() => {
      originalSummaryFile = process.env.GITHUB_STEP_SUMMARY;
      mockAppendFileSync = jest.spyOn(require('fs'), 'appendFileSync').mockImplementation();
    });

    afterEach(() => {
      if (originalSummaryFile) {
        process.env.GITHUB_STEP_SUMMARY = originalSummaryFile;
      } else {
        delete process.env.GITHUB_STEP_SUMMARY;
      }
      mockAppendFileSync.mockRestore();
    });

    it('should write to GitHub step summary when available', async () => {
      process.env.GITHUB_STEP_SUMMARY = '/tmp/summary.md';
      
      const options = {
        type: 'build',
        status: 'success',
        channel: 'github',
        message: 'Build successful'
      };
      
      await sendNotification(options);
      
      expect(mockAppendFileSync).toHaveBeenCalledWith(
        '/tmp/summary.md',
        expect.stringContaining('Build successful')
      );
    });

    it('should not fail when GitHub step summary is not available', async () => {
      delete process.env.GITHUB_STEP_SUMMARY;
      
      const options = {
        type: 'build',
        status: 'success',
        channel: 'github'
      };
      
      const result = await sendNotification(options);
      
      expect(result.success).toBe(true);
      expect(mockAppendFileSync).not.toHaveBeenCalled();
    });
  });

  describe('Slack Message Structure', () => {
    it('should create valid Slack attachment structure', () => {
      const options = {
        type: 'deploy',
        status: 'success',
        message: 'Deployment successful',
        version: '1.2.3',
        details: 'All tests passed',
        marketplace: 'https://marketplace.visualstudio.com/items?itemName=test',
        url: 'https://github.com/owner/repo/actions/runs/123'
      };
      
      const payload = formatSlackMessage(options);
      
      expect(payload).toHaveProperty('attachments');
      expect(Array.isArray(payload.attachments)).toBe(true);
      expect(payload.attachments[0]).toHaveProperty('color');
      expect(payload.attachments[0]).toHaveProperty('title');
      expect(payload.attachments[0]).toHaveProperty('fields');
      expect(payload.attachments[0]).toHaveProperty('actions');
      expect(payload.attachments[0]).toHaveProperty('footer');
      expect(payload.attachments[0]).toHaveProperty('ts');
    });

    it('should handle missing optional fields in Slack message', () => {
      const options = {
        type: 'build',
        status: 'success'
      };
      
      const payload = formatSlackMessage(options);
      
      expect(payload.attachments[0].fields).toEqual([]);
      expect(payload.attachments[0].actions).toEqual([]);
    });
  });

  describe('Teams Message Structure', () => {
    it('should create valid Teams MessageCard structure', () => {
      const options = {
        type: 'deploy',
        status: 'success',
        message: 'Deployment successful',
        version: '1.2.3',
        details: 'All tests passed',
        marketplace: 'https://marketplace.visualstudio.com/items?itemName=test',
        url: 'https://github.com/owner/repo/actions/runs/123'
      };
      
      const payload = formatTeamsMessage(options);
      
      expect(payload).toHaveProperty('@type', 'MessageCard');
      expect(payload).toHaveProperty('@context', 'https://schema.org/extensions');
      expect(payload).toHaveProperty('themeColor');
      expect(payload).toHaveProperty('title');
      expect(payload).toHaveProperty('text');
      expect(payload).toHaveProperty('sections');
      expect(payload).toHaveProperty('potentialAction');
    });

    it('should handle missing optional fields in Teams message', () => {
      const options = {
        type: 'build',
        status: 'success'
      };
      
      const payload = formatTeamsMessage(options);
      
      expect(payload.sections).toEqual([]);
      expect(payload.potentialAction).toEqual([]);
      expect(payload.text).toBe('');
    });
  });

  describe('Message Formatting Consistency', () => {
    it('should use default message when custom message is null', () => {
      const options = {
        type: 'build',
        status: 'success',
        message: null
      };
      
      const message = formatMessage(options);
      expect(message).toContain('✅ Build completed successfully');
    });

    it('should format all notification types with all statuses', () => {
      const types = ['build', 'deploy', 'rollback', 'security'];
      const statuses = ['success', 'failure', 'warning'];
      
      types.forEach(type => {
        statuses.forEach(status => {
          const options = { type, status };
          const message = formatMessage(options);
          expect(message).toBeTruthy();
          expect(message.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Webhook Integration', () => {
    const https = require('https');
    let mockRequest;
    let mockResponse;

    beforeEach(() => {
      mockResponse = {
        statusCode: 200,
        on: jest.fn((event, handler) => {
          if (event === 'data') {
            handler('{"ok":true}');
          } else if (event === 'end') {
            handler();
          }
        })
      };

      mockRequest = {
        write: jest.fn(),
        end: jest.fn(),
        on: jest.fn()
      };

      jest.spyOn(https, 'request').mockImplementation((options, callback) => {
        callback(mockResponse);
        return mockRequest;
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
      delete process.env.SLACK_WEBHOOK_URL;
      delete process.env.TEAMS_WEBHOOK_URL;
    });

    it('should send notification to Slack when webhook URL is configured', async () => {
      process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/TEST/WEBHOOK/URL';
      
      const options = {
        type: 'build',
        status: 'success',
        channel: 'slack',
        message: 'Build successful'
      };
      
      const result = await sendNotification(options);
      
      expect(result.success).toBe(true);
      expect(result.channel).toBe('slack');
      expect(https.request).toHaveBeenCalled();
      expect(mockRequest.write).toHaveBeenCalled();
      expect(mockRequest.end).toHaveBeenCalled();
    });

    it('should send notification to Teams when webhook URL is configured', async () => {
      process.env.TEAMS_WEBHOOK_URL = 'https://outlook.office.com/webhook/TEST/WEBHOOK/URL';
      
      const options = {
        type: 'build',
        status: 'success',
        channel: 'teams',
        message: 'Build successful'
      };
      
      const result = await sendNotification(options);
      
      expect(result.success).toBe(true);
      expect(result.channel).toBe('teams');
      expect(https.request).toHaveBeenCalled();
      expect(mockRequest.write).toHaveBeenCalled();
      expect(mockRequest.end).toHaveBeenCalled();
    });

    it('should handle webhook request failure', async () => {
      process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/TEST/WEBHOOK/URL';
      
      mockResponse.statusCode = 500;
      mockResponse.on = jest.fn((event, handler) => {
        if (event === 'data') {
          handler('Internal Server Error');
        } else if (event === 'end') {
          handler();
        }
      });
      
      const options = {
        type: 'build',
        status: 'failure',
        channel: 'slack'
      };
      
      const result = await sendNotification(options);
      
      expect(result.success).toBe(false);
      expect(result.channel).toBe('slack');
      expect(result.error).toContain('500');
    });

    it('should handle webhook network error', async () => {
      process.env.SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/TEST/WEBHOOK/URL';
      
      jest.spyOn(https, 'request').mockImplementation((options, callback) => {
        const req = {
          write: jest.fn(),
          end: jest.fn(),
          on: jest.fn((event, handler) => {
            if (event === 'error') {
              handler(new Error('Network error'));
            }
          })
        };
        // Trigger error immediately
        setTimeout(() => {
          req.on.mock.calls.find(call => call[0] === 'error')[1](new Error('Network error'));
        }, 0);
        return req;
      });
      
      const options = {
        type: 'build',
        status: 'failure',
        channel: 'slack'
      };
      
      const result = await sendNotification(options);
      
      expect(result.success).toBe(false);
      expect(result.channel).toBe('slack');
      expect(result.error).toContain('Network error');
    });
  });

  describe('Integration Tests', () => {
    let consoleLogSpy;

    beforeEach(() => {
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
    });

    it('should handle complete workflow for console notification', async () => {
      const options = {
        type: 'deploy',
        status: 'success',
        channel: 'console',
        message: 'Deployment successful',
        version: '1.2.3',
        details: 'All tests passed',
        marketplace: 'https://marketplace.visualstudio.com/items?itemName=test',
        url: 'https://github.com/owner/repo/actions/runs/123'
      };
      
      const result = await sendNotification(options);
      
      expect(result.success).toBe(true);
      expect(result.channel).toBe('console');
      expect(consoleLogSpy).toHaveBeenCalled();
      
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('Deployment successful');
      expect(loggedMessage).toContain('Version: 1.2.3');
      expect(loggedMessage).toContain('Details: All tests passed');
      expect(loggedMessage).toContain('Marketplace:');
      expect(loggedMessage).toContain('Workflow:');
    });

    it('should handle complete workflow for GitHub notification', async () => {
      const options = {
        type: 'build',
        status: 'failure',
        channel: 'github',
        message: 'Build failed',
        details: 'Compilation error in file.ts',
        url: 'https://github.com/owner/repo/actions/runs/123'
      };
      
      const result = await sendNotification(options);
      
      expect(result.success).toBe(true);
      expect(result.channel).toBe('github');
      expect(consoleLogSpy).toHaveBeenCalled();
      
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      expect(loggedMessage).toContain('::error::');
      expect(loggedMessage).toContain('Build failed');
    });
  });
});
