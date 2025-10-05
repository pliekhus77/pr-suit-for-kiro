/**
 * Cucumber Configuration
 * 
 * This configuration file sets up Cucumber for BDD testing of the
 * Pragmatic Rhino SUIT VS Code extension.
 */

module.exports = {
  default: {
    // Feature files location
    paths: ['tests/bdd/features/**/*.feature'],
    
    // Step definitions location
    require: [
      'tests/bdd/step-definitions/**/*.ts',
      'tests/bdd/support/**/*.ts'
    ],
    
    // TypeScript support
    requireModule: ['ts-node/register'],
    
    // Format options
    format: [
      'progress-bar',
      'html:tests/bdd/reports/cucumber-report.html',
      'json:tests/bdd/reports/cucumber-report.json',
      'junit:tests/bdd/reports/cucumber-report.xml'
    ],
    
    // Parallel execution
    parallel: 2,
    
    // Retry failed scenarios
    retry: 1,
    
    // Fail fast on first failure (set to false for CI)
    failFast: false,
    
    // Strict mode - fail if there are undefined or pending steps
    strict: true,
    
    // Dry run to check for undefined steps
    dryRun: false,
    
    // Publish results to Cucumber Reports
    publish: false,
    
    // World parameters (can be overridden via CLI)
    worldParameters: {
      // VS Code extension test configuration
      extensionDevelopmentPath: __dirname,
      extensionTestsPath: './tests/bdd',
      
      // Playwright configuration
      headless: true,
      slowMo: 0,
      timeout: 30000
    }
  },
  
  // CI configuration
  ci: {
    paths: ['tests/bdd/features/**/*.feature'],
    require: [
      'tests/bdd/step-definitions/**/*.ts',
      'tests/bdd/support/**/*.ts'
    ],
    requireModule: ['ts-node/register'],
    format: [
      'progress',
      'json:tests/bdd/reports/cucumber-report.json',
      'junit:tests/bdd/reports/cucumber-report.xml'
    ],
    parallel: 4,
    retry: 2,
    failFast: false,
    strict: true,
    publish: false
  },
  
  // Debug configuration (single thread, verbose)
  debug: {
    paths: ['tests/bdd/features/**/*.feature'],
    require: [
      'tests/bdd/step-definitions/**/*.ts',
      'tests/bdd/support/**/*.ts'
    ],
    requireModule: ['ts-node/register'],
    format: ['progress-bar'],
    parallel: 1,
    retry: 0,
    failFast: true,
    strict: true,
    publish: false,
    worldParameters: {
      extensionDevelopmentPath: __dirname,
      extensionTestsPath: './tests/bdd',
      headless: false,
      slowMo: 100,
      timeout: 60000
    }
  }
};
