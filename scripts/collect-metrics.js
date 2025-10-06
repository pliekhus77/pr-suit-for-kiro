#!/usr/bin/env node

/**
 * Workflow Metrics Collection Script
 * 
 * Collects and reports metrics from GitHub Actions workflows including:
 * - Workflow timing metrics (build duration, test execution time)
 * - Test result metrics (pass rate, test count, failures)
 * - Coverage metrics (percentage, thresholds)
 * 
 * Usage:
 *   node scripts/collect-metrics.js --type <type> [options]
 * 
 * Options:
 *   --type          Metric type: timing, test-results, coverage, summary
 *   --start-time    Workflow start time (ISO 8601 format)
 *   --end-time      Workflow end time (ISO 8601 format)
 *   --test-file     Path to Jest test results JSON file
 *   --coverage-file Path to Jest coverage summary JSON file
 *   --output        Output format: json, markdown, github-summary
 */

const fs = require('fs');
const path = require('path');

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    type: 'summary',
    startTime: null,
    endTime: null,
    testFile: null,
    coverageFile: null,
    output: 'github-summary'
  };

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    const value = args[i + 1];
    
    // Convert kebab-case to camelCase
    const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    
    if (options.hasOwnProperty(camelKey)) {
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

  const validTypes = ['timing', 'test-results', 'coverage', 'summary'];
  if (!validTypes.includes(options.type)) {
    errors.push(`Invalid type: ${options.type}. Must be one of: ${validTypes.join(', ')}`);
  }

  const validOutputs = ['json', 'markdown', 'github-summary'];
  if (!validOutputs.includes(options.output)) {
    errors.push(`Invalid output: ${options.output}. Must be one of: ${validOutputs.join(', ')}`);
  }

  if (options.type === 'timing' && (!options.startTime || !options.endTime)) {
    errors.push('Timing metrics require --start-time and --end-time');
  }

  if (options.type === 'test-results' && !options.testFile) {
    errors.push('Test results metrics require --test-file');
  }

  if (options.type === 'coverage' && !options.coverageFile) {
    errors.push('Coverage metrics require --coverage-file');
  }

  if (errors.length > 0) {
    throw new Error(`Validation errors:\n${errors.join('\n')}`);
  }
}

/**
 * Calculate timing metrics
 */
function calculateTimingMetrics(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Invalid date format. Use ISO 8601 format (e.g., 2024-01-01T12:00:00Z)');
  }

  const durationMs = end.getTime() - start.getTime();
  const durationSeconds = Math.floor(durationMs / 1000);
  const durationMinutes = Math.floor(durationSeconds / 60);
  const remainingSeconds = durationSeconds % 60;

  return {
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    durationMs,
    durationSeconds,
    durationMinutes,
    durationFormatted: `${durationMinutes}m ${remainingSeconds}s`,
    thresholds: {
      buildTarget: 300, // 5 minutes
      testTarget: 120,  // 2 minutes
      withinBuildTarget: durationSeconds <= 300,
      withinTestTarget: durationSeconds <= 120
    }
  };
}

/**
 * Parse test results from Jest JSON output
 */
function parseTestResults(testFile) {
  if (!fs.existsSync(testFile)) {
    throw new Error(`Test results file not found: ${testFile}`);
  }

  const content = fs.readFileSync(testFile, 'utf8');
  const results = JSON.parse(content);

  const totalTests = results.numTotalTests || 0;
  const passedTests = results.numPassedTests || 0;
  const failedTests = results.numFailedTests || 0;
  const skippedTests = results.numPendingTests || 0;
  const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) : 0;

  return {
    totalTests,
    passedTests,
    failedTests,
    skippedTests,
    passRate: parseFloat(passRate),
    success: results.success || false,
    testSuites: {
      total: results.numTotalTestSuites || 0,
      passed: results.numPassedTestSuites || 0,
      failed: results.numFailedTestSuites || 0
    },
    thresholds: {
      passRateTarget: 100,
      meetsTarget: parseFloat(passRate) === 100
    }
  };
}

/**
 * Parse coverage metrics from Jest coverage summary
 */
function parseCoverageMetrics(coverageFile) {
  if (!fs.existsSync(coverageFile)) {
    throw new Error(`Coverage file not found: ${coverageFile}`);
  }

  const content = fs.readFileSync(coverageFile, 'utf8');
  const coverage = JSON.parse(content);

  const total = coverage.total || {};
  
  const metrics = {
    lines: {
      total: total.lines?.total || 0,
      covered: total.lines?.covered || 0,
      skipped: total.lines?.skipped || 0,
      pct: total.lines?.pct || 0
    },
    statements: {
      total: total.statements?.total || 0,
      covered: total.statements?.covered || 0,
      skipped: total.statements?.skipped || 0,
      pct: total.statements?.pct || 0
    },
    functions: {
      total: total.functions?.total || 0,
      covered: total.functions?.covered || 0,
      skipped: total.functions?.skipped || 0,
      pct: total.functions?.pct || 0
    },
    branches: {
      total: total.branches?.total || 0,
      covered: total.branches?.covered || 0,
      skipped: total.branches?.skipped || 0,
      pct: total.branches?.pct || 0
    },
    thresholds: {
      target: 80,
      linesMet: total.lines?.pct >= 80,
      statementsMet: total.statements?.pct >= 80,
      functionsMet: total.functions?.pct >= 80,
      branchesMet: total.branches?.pct >= 80,
      allMet: total.lines?.pct >= 80 && 
              total.statements?.pct >= 80 && 
              total.functions?.pct >= 80 && 
              total.branches?.pct >= 80
    }
  };

  return metrics;
}

/**
 * Collect all metrics for summary
 */
function collectSummaryMetrics(options) {
  const summary = {
    timestamp: new Date().toISOString(),
    metrics: {}
  };

  // Collect timing metrics if available
  if (options.startTime && options.endTime) {
    try {
      summary.metrics.timing = calculateTimingMetrics(options.startTime, options.endTime);
    } catch (error) {
      summary.metrics.timing = { error: error.message };
    }
  }

  // Collect test results if available
  if (options.testFile) {
    try {
      summary.metrics.testResults = parseTestResults(options.testFile);
    } catch (error) {
      summary.metrics.testResults = { error: error.message };
    }
  }

  // Collect coverage metrics if available
  if (options.coverageFile) {
    try {
      summary.metrics.coverage = parseCoverageMetrics(options.coverageFile);
    } catch (error) {
      summary.metrics.coverage = { error: error.message };
    }
  }

  return summary;
}

/**
 * Format metrics as JSON
 */
function formatAsJson(metrics) {
  return JSON.stringify(metrics, null, 2);
}

/**
 * Format timing metrics as markdown
 */
function formatTimingAsMarkdown(metrics) {
  const status = metrics.thresholds.withinBuildTarget ? '✅' : '⚠️';
  
  return `### ⏱️ Timing Metrics

${status} **Duration:** ${metrics.durationFormatted} (${metrics.durationSeconds}s)

- **Start Time:** ${metrics.startTime}
- **End Time:** ${metrics.endTime}
- **Target:** < 5 minutes (${metrics.thresholds.buildTarget}s)
- **Status:** ${metrics.thresholds.withinBuildTarget ? 'Within target' : 'Exceeds target'}
`;
}

/**
 * Format test results as markdown
 */
function formatTestResultsAsMarkdown(metrics) {
  const status = metrics.thresholds.meetsTarget ? '✅' : '❌';
  
  return `### 🧪 Test Results

${status} **Pass Rate:** ${metrics.passRate}%

- **Total Tests:** ${metrics.totalTests}
- **Passed:** ${metrics.passedTests}
- **Failed:** ${metrics.failedTests}
- **Skipped:** ${metrics.skippedTests}
- **Test Suites:** ${metrics.testSuites.passed}/${metrics.testSuites.total} passed
- **Target:** 100% pass rate
- **Status:** ${metrics.thresholds.meetsTarget ? 'All tests passed' : 'Some tests failed'}
`;
}

/**
 * Format coverage metrics as markdown
 */
function formatCoverageAsMarkdown(metrics) {
  const status = metrics.thresholds.allMet ? '✅' : '❌';
  
  return `### 📊 Coverage Metrics

${status} **Overall Coverage:** ${metrics.lines.pct.toFixed(2)}%

| Metric | Coverage | Covered/Total | Status |
|--------|----------|---------------|--------|
| Lines | ${metrics.lines.pct.toFixed(2)}% | ${metrics.lines.covered}/${metrics.lines.total} | ${metrics.thresholds.linesMet ? '✅' : '❌'} |
| Statements | ${metrics.statements.pct.toFixed(2)}% | ${metrics.statements.covered}/${metrics.statements.total} | ${metrics.thresholds.statementsMet ? '✅' : '❌'} |
| Functions | ${metrics.functions.pct.toFixed(2)}% | ${metrics.functions.covered}/${metrics.functions.total} | ${metrics.thresholds.functionsMet ? '✅' : '❌'} |
| Branches | ${metrics.branches.pct.toFixed(2)}% | ${metrics.branches.covered}/${metrics.branches.total} | ${metrics.thresholds.branchesMet ? '✅' : '❌'} |

- **Target:** ≥ 80% for all metrics
- **Status:** ${metrics.thresholds.allMet ? 'All thresholds met' : 'Some thresholds not met'}
`;
}

/**
 * Format metrics as markdown
 */
function formatAsMarkdown(metrics, type) {
  if (type === 'timing') {
    return formatTimingAsMarkdown(metrics);
  } else if (type === 'test-results') {
    return formatTestResultsAsMarkdown(metrics);
  } else if (type === 'coverage') {
    return formatCoverageAsMarkdown(metrics);
  } else if (type === 'summary') {
    let markdown = '## 📈 Workflow Metrics Summary\n\n';
    
    if (metrics.metrics.timing && !metrics.metrics.timing.error) {
      markdown += formatTimingAsMarkdown(metrics.metrics.timing) + '\n';
    }
    
    if (metrics.metrics.testResults && !metrics.metrics.testResults.error) {
      markdown += formatTestResultsAsMarkdown(metrics.metrics.testResults) + '\n';
    }
    
    if (metrics.metrics.coverage && !metrics.metrics.coverage.error) {
      markdown += formatCoverageAsMarkdown(metrics.metrics.coverage) + '\n';
    }
    
    markdown += `\n*Generated at: ${metrics.timestamp}*\n`;
    
    return markdown;
  }
  
  return '';
}

/**
 * Write to GitHub Step Summary
 */
function writeToGitHubSummary(content) {
  const summaryFile = process.env.GITHUB_STEP_SUMMARY;
  
  if (!summaryFile) {
    console.warn('GITHUB_STEP_SUMMARY environment variable not set');
    return false;
  }
  
  try {
    fs.appendFileSync(summaryFile, content + '\n\n');
    return true;
  } catch (error) {
    console.error(`Failed to write to GitHub summary: ${error.message}`);
    return false;
  }
}

/**
 * Collect and output metrics
 */
function collectMetrics(options) {
  validateOptions(options);

  let metrics;

  switch (options.type) {
    case 'timing':
      metrics = calculateTimingMetrics(options.startTime, options.endTime);
      break;
    case 'test-results':
      metrics = parseTestResults(options.testFile);
      break;
    case 'coverage':
      metrics = parseCoverageMetrics(options.coverageFile);
      break;
    case 'summary':
      metrics = collectSummaryMetrics(options);
      break;
    default:
      throw new Error(`Unsupported metric type: ${options.type}`);
  }

  // Output based on format
  if (options.output === 'json') {
    const json = formatAsJson(metrics);
    console.log(json);
    return { success: true, metrics, output: 'json' };
  } else if (options.output === 'markdown') {
    const markdown = formatAsMarkdown(metrics, options.type);
    console.log(markdown);
    return { success: true, metrics, output: 'markdown' };
  } else if (options.output === 'github-summary') {
    const markdown = formatAsMarkdown(metrics, options.type);
    console.log(markdown);
    const written = writeToGitHubSummary(markdown);
    return { 
      success: true, 
      metrics, 
      output: 'github-summary',
      writtenToSummary: written
    };
  }

  return { success: false, error: 'Unknown output format' };
}

/**
 * Main execution
 */
function main() {
  try {
    const options = parseArgs();
    const result = collectMetrics(options);
    
    if (result.success) {
      console.log(`\n✅ Metrics collected successfully (${result.output})`);
      if (result.writtenToSummary) {
        console.log('✅ Written to GitHub Step Summary');
      }
      process.exit(0);
    } else {
      console.error(`❌ Failed to collect metrics: ${result.error}`);
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
    calculateTimingMetrics,
    parseTestResults,
    parseCoverageMetrics,
    collectSummaryMetrics,
    formatAsJson,
    formatAsMarkdown,
    collectMetrics
  };
}
