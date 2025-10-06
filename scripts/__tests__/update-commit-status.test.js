/**
 * Unit tests for update-commit-status.js
 */

const {
  parseArgs,
  validateOptions,
  getDefaultDescription
} = require('../update-commit-status');

describe('update-commit-status', () => {
  // Store original env vars
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables before each test
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('parseArgs', () => {
    it('should parse state and context arguments', () => {
      process.argv = ['node', 'script.js', '--state', 'success', '--context', 'ci/build'];
      const options = parseArgs();
      
      expect(options.state).toBe('success');
      expect(options.context).toBe('ci/build');
    });

    it('should parse description and target-url arguments', () => {
      process.argv = [
        'node', 'script.js',
        '--state', 'pending',
        '--context', 'ci/test',
        '--description', 'Running tests',
        '--target-url', 'https://example.com/run/123'
      ];
      const options = parseArgs();
      
      expect(options.description).toBe('Running tests');
      expect(options.targetUrl).toBe('https://example.com/run/123');
    });

    it('should use environment variables for sha, repo, and token', () => {
      process.env.GITHUB_SHA = 'abc123';
      process.env.GITHUB_REPOSITORY = 'owner/repo';
      process.env.GITHUB_TOKEN = 'token123';
      
      process.argv = ['node', 'script.js', '--state', 'success', '--context', 'ci/build'];
      const options = parseArgs();
      
      expect(options.sha).toBe('abc123');
      expect(options.repo).toBe('owner/repo');
      expect(options.token).toBe('token123');
    });

    it('should allow overriding environment variables with arguments', () => {
      process.env.GITHUB_SHA = 'env-sha';
      
      process.argv = [
        'node', 'script.js',
        '--state', 'success',
        '--context', 'ci/build',
        '--sha', 'arg-sha'
      ];
      const options = parseArgs();
      
      expect(options.sha).toBe('arg-sha');
    });

    it('should convert kebab-case arguments to camelCase', () => {
      process.argv = [
        'node', 'script.js',
        '--state', 'success',
        '--context', 'ci/build',
        '--target-url', 'https://example.com'
      ];
      const options = parseArgs();
      
      expect(options.targetUrl).toBe('https://example.com');
    });
  });

  describe('validateOptions', () => {
    it('should pass validation with all required options', () => {
      const options = {
        state: 'success',
        context: 'ci/build',
        sha: 'abc123',
        repo: 'owner/repo',
        token: 'token123'
      };
      
      expect(() => validateOptions(options)).not.toThrow();
    });

    it('should fail validation when state is missing', () => {
      const options = {
        context: 'ci/build',
        sha: 'abc123',
        repo: 'owner/repo',
        token: 'token123'
      };
      
      expect(() => validateOptions(options)).toThrow('--state is required');
    });

    it('should fail validation with invalid state', () => {
      const options = {
        state: 'invalid',
        context: 'ci/build',
        sha: 'abc123',
        repo: 'owner/repo',
        token: 'token123'
      };
      
      expect(() => validateOptions(options)).toThrow('Invalid state: invalid');
    });

    it('should accept all valid states', () => {
      const validStates = ['pending', 'success', 'failure', 'error'];
      
      validStates.forEach(state => {
        const options = {
          state,
          context: 'ci/build',
          sha: 'abc123',
          repo: 'owner/repo',
          token: 'token123'
        };
        
        expect(() => validateOptions(options)).not.toThrow();
      });
    });

    it('should fail validation when context is missing', () => {
      const options = {
        state: 'success',
        sha: 'abc123',
        repo: 'owner/repo',
        token: 'token123'
      };
      
      expect(() => validateOptions(options)).toThrow('--context is required');
    });

    it('should fail validation when sha is missing', () => {
      const options = {
        state: 'success',
        context: 'ci/build',
        repo: 'owner/repo',
        token: 'token123'
      };
      
      expect(() => validateOptions(options)).toThrow('--sha is required');
    });

    it('should fail validation when repo is missing', () => {
      const options = {
        state: 'success',
        context: 'ci/build',
        sha: 'abc123',
        token: 'token123'
      };
      
      expect(() => validateOptions(options)).toThrow('--repo is required');
    });

    it('should fail validation when token is missing', () => {
      const options = {
        state: 'success',
        context: 'ci/build',
        sha: 'abc123',
        repo: 'owner/repo'
      };
      
      expect(() => validateOptions(options)).toThrow('--token is required');
    });

    it('should collect multiple validation errors', () => {
      const options = {};
      
      expect(() => validateOptions(options)).toThrow(/--state is required/);
      expect(() => validateOptions(options)).toThrow(/--context is required/);
    });
  });

  describe('getDefaultDescription', () => {
    describe('pending state', () => {
      it('should return correct description for build context', () => {
        expect(getDefaultDescription('pending', 'ci/build')).toBe('Build in progress...');
      });

      it('should return correct description for test context', () => {
        expect(getDefaultDescription('pending', 'ci/test')).toBe('Running tests...');
      });

      it('should return correct description for lint context', () => {
        expect(getDefaultDescription('pending', 'ci/lint')).toBe('Linting code...');
      });

      it('should return correct description for coverage context', () => {
        expect(getDefaultDescription('pending', 'ci/coverage')).toBe('Checking coverage...');
      });

      it('should return correct description for security context', () => {
        expect(getDefaultDescription('pending', 'ci/security')).toBe('Scanning for vulnerabilities...');
      });

      it('should return correct description for package context', () => {
        expect(getDefaultDescription('pending', 'ci/package')).toBe('Creating package...');
      });

      it('should return correct description for deploy context', () => {
        expect(getDefaultDescription('pending', 'deploy/marketplace')).toBe('Deploying to marketplace...');
      });

      it('should return default description for unknown context', () => {
        expect(getDefaultDescription('pending', 'ci/unknown')).toBe('In progress...');
      });
    });

    describe('success state', () => {
      it('should return correct description for build context', () => {
        expect(getDefaultDescription('success', 'ci/build')).toBe('Build passed');
      });

      it('should return correct description for test context', () => {
        expect(getDefaultDescription('success', 'ci/test')).toBe('All tests passed');
      });

      it('should return correct description for coverage context', () => {
        expect(getDefaultDescription('success', 'ci/coverage')).toBe('Coverage threshold met');
      });

      it('should return correct description for security context', () => {
        expect(getDefaultDescription('success', 'ci/security')).toBe('No vulnerabilities found');
      });

      it('should return correct description for deploy context', () => {
        expect(getDefaultDescription('success', 'deploy/marketplace')).toBe('Deployed successfully');
      });

      it('should return default description for unknown context', () => {
        expect(getDefaultDescription('success', 'ci/unknown')).toBe('Completed successfully');
      });
    });

    describe('failure state', () => {
      it('should return correct description for build context', () => {
        expect(getDefaultDescription('failure', 'ci/build')).toBe('Build failed');
      });

      it('should return correct description for test context', () => {
        expect(getDefaultDescription('failure', 'ci/test')).toBe('Tests failed');
      });

      it('should return correct description for coverage context', () => {
        expect(getDefaultDescription('failure', 'ci/coverage')).toBe('Coverage below threshold');
      });

      it('should return correct description for security context', () => {
        expect(getDefaultDescription('failure', 'ci/security')).toBe('Vulnerabilities detected');
      });

      it('should return correct description for deploy context', () => {
        expect(getDefaultDescription('failure', 'deploy/marketplace')).toBe('Deployment failed');
      });

      it('should return default description for unknown context', () => {
        expect(getDefaultDescription('failure', 'ci/unknown')).toBe('Failed');
      });
    });

    describe('error state', () => {
      it('should return correct description for build context', () => {
        expect(getDefaultDescription('error', 'ci/build')).toBe('Build error');
      });

      it('should return correct description for test context', () => {
        expect(getDefaultDescription('error', 'ci/test')).toBe('Test execution error');
      });

      it('should return correct description for deploy context', () => {
        expect(getDefaultDescription('error', 'deploy/marketplace')).toBe('Deployment error');
      });

      it('should return default description for unknown context', () => {
        expect(getDefaultDescription('error', 'ci/unknown')).toBe('Error occurred');
      });
    });

    it('should extract context name from full path', () => {
      expect(getDefaultDescription('success', 'ci/build')).toBe('Build passed');
      expect(getDefaultDescription('success', 'deploy/marketplace')).toBe('Deployed successfully');
      expect(getDefaultDescription('pending', 'quality-gates/security')).toBe('Scanning for vulnerabilities...');
    });

    it('should handle context without slash', () => {
      expect(getDefaultDescription('success', 'build')).toBe('Build passed');
      expect(getDefaultDescription('pending', 'test')).toBe('Running tests...');
    });
  });
});
