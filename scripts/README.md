# CI/CD Helper Scripts

This directory contains helper scripts used by GitHub Actions workflows for building, testing, packaging, and deploying the Pragmatic Rhino SUIT VS Code extension.

## Directory Structure

```
scripts/
├── __tests__/              # Unit tests for helper scripts
├── README.md               # This file
└── [script files]          # Helper scripts (to be added)
```

## Scripts Overview

The following scripts will be implemented as part of the CI/CD pipeline:

### Version Management
- `analyze-version.js` - Analyzes commit messages to determine version bump type
- `validate-version.js` - Validates semantic versioning format and version increments
- `generate-changelog.js` - Generates CHANGELOG.md entries from commit messages

### Package Validation
- `validate-vsix.js` - Validates VSIX package structure and manifest

### Deployment
- `verify-deployment.js` - Verifies extension is live on VS Code Marketplace
- `send-notification.js` - Sends notifications to configured channels

## Testing

All scripts include comprehensive unit tests in the `__tests__/` directory. Tests are written using Jest and follow the naming convention `[script-name].test.js`.

### Running Tests

```bash
# Run all script tests
npm run test:scripts

# Run tests in watch mode
npm run test:scripts:watch

# Run tests with coverage
npm run test:scripts:coverage

# Run specific test file
npm run test:scripts -- __tests__/validate-version.test.js
```

### Coverage Requirements

All scripts must maintain a minimum of 80% code coverage as enforced by the CI/CD pipeline.

## Development Guidelines

### Script Requirements
- All scripts must be Node.js compatible (ES modules or CommonJS)
- Include comprehensive error handling
- Log meaningful messages for debugging
- Exit with appropriate exit codes (0 = success, non-zero = failure)
- Include JSDoc comments for functions

### Testing Requirements
- Test happy path scenarios
- Test failure scenarios
- Test edge cases
- Mock external dependencies (file system, HTTP requests, etc.)
- Use descriptive test names

### Example Script Structure

```javascript
/**
 * Description of what the script does
 * @param {Object} options - Configuration options
 * @returns {Promise<void>}
 */
async function main(options) {
  try {
    // Script logic here
    console.log('Success message');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main(process.argv.slice(2));
}

module.exports = { main };
```

## Workflow Integration

These scripts are called from GitHub Actions workflows located in `.github/workflows/`:

- `build.yml` - Build and test workflow
- `pr-quality-gates.yml` - Pull request validation
- `version.yml` - Automated versioning
- `package.yml` - VSIX packaging
- `deploy.yml` - Marketplace deployment
- `rollback.yml` - Rollback capability

## Documentation

For detailed information about the CI/CD pipeline, see:
- `.kiro/specs/github-actions-marketplace-deploy/requirements.md`
- `.kiro/specs/github-actions-marketplace-deploy/design.md`
- `docs/deployment/` (to be created)
