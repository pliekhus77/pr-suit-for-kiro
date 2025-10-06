/**
 * Unit tests for collect-metrics.js
 * 
 * Tests metrics collection, parsing, and formatting for workflow metrics.
 */

const fs = require('fs');
const {
  parseArgs,
  validateOptions,
  calculateTimingMetrics,
  parseTestResults,
  parseCoverageMetrics,
  collectSummaryMetrics,
  formatAsJson,
  formatAsMarkdown,
  collectMetrics
} = require('../collect-metrics.js');

describe('collect-metrics', () => {
  
  describe('parseArgs', () => {
    let originalArgv;

    beforeEach(() => {
      originalArgv = process.argv;
    });

    afterEach(() => {
      process.argv = originalArgv;
    });

    it('should parse basic arguments', () => {
      process.argv = ['node', 'script.js', '--type', 'timing'];
      const options = parseArgs();
      
      expect(options.type).toBe('timing');
    });

    it('should parse all available arguments', () => {
      process.argv = [
        'node', 'script.js',
        '--type', 'summary',
        '--start-time', '2024-01-01T12:00:00Z',
        '--end-time', '2024-01-01T12:05:00Z',
        '--test-file', 'test-results.json',
        '--coverage-file', 'coverage-summary.json',
        '--output', 'json'
      ];
      const options = parseArgs();
      
      expect(options.type).toBe('summary');
      expect(options.startTime).toBe('2024-01-01T12:00:00Z');
      expect(options.endTime).toBe('2024-01-01T12:05:00Z');
      expect(options.testFile).toBe('test-results.json');
      expect(options.coverageFile).toBe('coverage-summary.json');
      expect(options.output).toBe('json');
    });

    it('should use default values for missing arguments', () => {
      process.argv = ['node', 'script.js'];
      const options = parseArgs();
      
      expect(options.type).toBe('summary');
      expect(options.startTime).toBeNull();
      expect(options.endTime).toBeNull();
      expect(options.testFile).toBeNull();
      expect(options.coverageFile).toBeNull();
      expect(options.output).toBe('github-summary');
    });

    it('should convert kebab-case to camelCase', () => {
      process.argv = [
        'node', 'script.js',
        '--start-time', '2024-01-01T12:00:00Z',
        '--end-time', '2024-01-01T12:05:00Z',
        '--test-file', 'test.json',
        '--coverage-file', 'coverage.json'
      ];
      const options = parseArgs();
      
      expect(options.startTime).toBe('2024-01-01T12:00:00Z');
      expect(options.endTime).toBe('2024-01-01T12:05:00Z');
      expect(options.testFile).toBe('test.json');
      expect(options.coverageFile).toBe('coverage.json');
    });
  });

  describe('validateOptions', () => {
    it('should accept valid timing options', () => {
      const options = {
        type: 'timing',
        startTime: '2024-01-01T12:00:00Z',
        endTime: '2024-01-01T12:05:00Z',
        output: 'json'
      };
      
      expect(() => validateOptions(options)).not.toThrow();
    });

    it('should accept valid test-results options', () => {
      const options = {
        type: 'test-results',
        testFile: 'test-results.json',
        output: 'markdown'
      };
      
      expect(() => validateOptions(options)).not.toThrow();
    });

    it('should accept valid coverage options', () => {
      const options = {
        type: 'coverage',
        coverageFile: 'coverage-summary.json',
        output: 'github-summary'
      };
      
      expect(() => validateOptions(options)).not.toThrow();
    });

    it('should reject invalid type', () => {
      const options = {
        type: 'invalid',
        output: 'json'
      };
      
      expect(() => validateOptions(options)).toThrow('Invalid type');
    });

    it('should reject invalid output', () => {
      const options = {
        type: 'summary',
        output: 'invalid'
      };
      
      expect(() => validateOptions(options)).toThrow('Invalid output');
    });

    it('should require start-time and end-time for timing metrics', () => {
      const options = {
        type: 'timing',
        output: 'json'
      };
      
      expect(() => validateOptions(options)).toThrow('Timing metrics require');
    });

    it('should require test-file for test-results metrics', () => {
      const options = {
        type: 'test-results',
        output: 'json'
      };
      
      expect(() => validateOptions(options)).toThrow('Test results metrics require');
    });

    it('should require coverage-file for coverage metrics', () => {
      const options = {
        type: 'coverage',
        output: 'json'
      };
      
      expect(() => validateOptions(options)).toThrow('Coverage metrics require');
    });
  });

  describe('calculateTimingMetrics', () => {
    it('should calculate duration correctly', () => {
      const startTime = '2024-01-01T12:00:00Z';
      const endTime = '2024-01-01T12:05:30Z';
      
      const metrics = calculateTimingMetrics(startTime, endTime);
      
      expect(metrics.durationSeconds).toBe(330);
      expect(metrics.durationMinutes).toBe(5);
      expect(metrics.durationFormatted).toBe('5m 30s');
    });

    it('should detect when within build target', () => {
      const startTime = '2024-01-01T12:00:00Z';
      const endTime = '2024-01-01T12:04:00Z'; // 4 minutes
      
      const metrics = calculateTimingMetrics(startTime, endTime);
      
      expect(metrics.thresholds.withinBuildTarget).toBe(true);
    });

    it('should detect when exceeding build target', () => {
      const startTime = '2024-01-01T12:00:00Z';
      const endTime = '2024-01-01T12:06:00Z'; // 6 minutes
      
      const metrics = calculateTimingMetrics(startTime, endTime);
      
      expect(metrics.thresholds.withinBuildTarget).toBe(false);
    });

    it('should detect when within test target', () => {
      const startTime = '2024-01-01T12:00:00Z';
      const endTime = '2024-01-01T12:01:30Z'; // 1.5 minutes
      
      const metrics = calculateTimingMetrics(startTime, endTime);
      
      expect(metrics.thresholds.withinTestTarget).toBe(true);
    });

    it('should throw error for invalid date format', () => {
      expect(() => {
        calculateTimingMetrics('invalid', '2024-01-01T12:00:00Z');
      }).toThrow('Invalid date format');
    });

    it('should handle same start and end time', () => {
      const time = '2024-01-01T12:00:00Z';
      
      const metrics = calculateTimingMetrics(time, time);
      
      expect(metrics.durationSeconds).toBe(0);
      expect(metrics.durationFormatted).toBe('0m 0s');
    });
  });

  describe('parseTestResults', () => {
    let mockTestResults;

    beforeEach(() => {
      mockTestResults = {
        success: true,
        numTotalTests: 100,
        numPassedTests: 98,
        numFailedTests: 2,
        numPendingTests: 0,
        numTotalTestSuites: 10,
        numPassedTestSuites: 9,
        numFailedTestSuites: 1
      };

      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(mockTestResults));
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should parse test results correctly', () => {
      const metrics = parseTestResults('test-results.json');
      
      expect(metrics.totalTests).toBe(100);
      expect(metrics.passedTests).toBe(98);
      expect(metrics.failedTests).toBe(2);
      expect(metrics.skippedTests).toBe(0);
      expect(metrics.passRate).toBe(98.00);
    });

    it('should calculate pass rate correctly', () => {
      const metrics = parseTestResults('test-results.json');
      
      expect(metrics.passRate).toBe(98.00);
      expect(metrics.thresholds.meetsTarget).toBe(false);
    });

    it('should detect 100% pass rate', () => {
      mockTestResults.numPassedTests = 100;
      mockTestResults.numFailedTests = 0;
      jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(mockTestResults));
      
      const metrics = parseTestResults('test-results.json');
      
      expect(metrics.passRate).toBe(100.00);
      expect(metrics.thresholds.meetsTarget).toBe(true);
    });

    it('should throw error if file does not exist', () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);
      
      expect(() => {
        parseTestResults('nonexistent.json');
      }).toThrow('Test results file not found');
    });

    it('should handle zero tests', () => {
      mockTestResults.numTotalTests = 0;
      mockTestResults.numPassedTests = 0;
      jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(mockTestResults));
      
      const metrics = parseTestResults('test-results.json');
      
      expect(metrics.totalTests).toBe(0);
      expect(metrics.passRate).toBe(0);
    });

    it('should parse test suite information', () => {
      const metrics = parseTestResults('test-results.json');
      
      expect(metrics.testSuites.total).toBe(10);
      expect(metrics.testSuites.passed).toBe(9);
      expect(metrics.testSuites.failed).toBe(1);
    });
  });

  describe('parseCoverageMetrics', () => {
    let mockCoverage;

    beforeEach(() => {
      mockCoverage = {
        total: {
          lines: { total: 1000, covered: 850, skipped: 0, pct: 85 },
          statements: { total: 1200, covered: 1000, skipped: 0, pct: 83.33 },
          functions: { total: 200, covered: 170, skipped: 0, pct: 85 },
          branches: { total: 400, covered: 320, skipped: 0, pct: 80 }
        }
      };

      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(mockCoverage));
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should parse coverage metrics correctly', () => {
      const metrics = parseCoverageMetrics('coverage-summary.json');
      
      expect(metrics.lines.pct).toBe(85);
      expect(metrics.statements.pct).toBe(83.33);
      expect(metrics.functions.pct).toBe(85);
      expect(metrics.branches.pct).toBe(80);
    });

    it('should detect when all thresholds are met', () => {
      const metrics = parseCoverageMetrics('coverage-summary.json');
      
      expect(metrics.thresholds.linesMet).toBe(true);
      expect(metrics.thresholds.statementsMet).toBe(true);
      expect(metrics.thresholds.functionsMet).toBe(true);
      expect(metrics.thresholds.branchesMet).toBe(true);
      expect(metrics.thresholds.allMet).toBe(true);
    });

    it('should detect when thresholds are not met', () => {
      mockCoverage.total.lines.pct = 75;
      jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(mockCoverage));
      
      const metrics = parseCoverageMetrics('coverage-summary.json');
      
      expect(metrics.thresholds.linesMet).toBe(false);
      expect(metrics.thresholds.allMet).toBe(false);
    });

    it('should throw error if file does not exist', () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);
      
      expect(() => {
        parseCoverageMetrics('nonexistent.json');
      }).toThrow('Coverage file not found');
    });

    it('should parse covered and total counts', () => {
      const metrics = parseCoverageMetrics('coverage-summary.json');
      
      expect(metrics.lines.total).toBe(1000);
      expect(metrics.lines.covered).toBe(850);
      expect(metrics.statements.total).toBe(1200);
      expect(metrics.statements.covered).toBe(1000);
    });
  });

  describe('collectSummaryMetrics', () => {
    beforeEach(() => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'readFileSync').mockImplementation((file) => {
        if (file.includes('test')) {
          return JSON.stringify({
            success: true,
            numTotalTests: 100,
            numPassedTests: 100,
            numFailedTests: 0,
            numPendingTests: 0
          });
        } else if (file.includes('coverage')) {
          return JSON.stringify({
            total: {
              lines: { total: 1000, covered: 850, pct: 85 },
              statements: { total: 1200, covered: 1000, pct: 83.33 },
              functions: { total: 200, covered: 170, pct: 85 },
              branches: { total: 400, covered: 320, pct: 80 }
            }
          });
        }
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should collect all available metrics', () => {
      const options = {
        startTime: '2024-01-01T12:00:00Z',
        endTime: '2024-01-01T12:05:00Z',
        testFile: 'test-results.json',
        coverageFile: 'coverage-summary.json'
      };
      
      const summary = collectSummaryMetrics(options);
      
      expect(summary.metrics.timing).toBeDefined();
      expect(summary.metrics.testResults).toBeDefined();
      expect(summary.metrics.coverage).toBeDefined();
      expect(summary.timestamp).toBeDefined();
    });

    it('should handle missing timing metrics', () => {
      const options = {
        testFile: 'test-results.json',
        coverageFile: 'coverage-summary.json'
      };
      
      const summary = collectSummaryMetrics(options);
      
      expect(summary.metrics.timing).toBeUndefined();
      expect(summary.metrics.testResults).toBeDefined();
      expect(summary.metrics.coverage).toBeDefined();
    });

    it('should handle errors gracefully', () => {
      const options = {
        startTime: 'invalid',
        endTime: '2024-01-01T12:00:00Z'
      };
      
      const summary = collectSummaryMetrics(options);
      
      expect(summary.metrics.timing.error).toBeDefined();
    });
  });

  describe('formatAsJson', () => {
    it('should format metrics as JSON', () => {
      const metrics = {
        durationSeconds: 300,
        passRate: 100
      };
      
      const json = formatAsJson(metrics);
      
      expect(json).toContain('"durationSeconds": 300');
      expect(json).toContain('"passRate": 100');
    });

    it('should format with proper indentation', () => {
      const metrics = { test: 'value' };
      
      const json = formatAsJson(metrics);
      
      expect(json).toContain('  ');
    });
  });

  describe('formatAsMarkdown', () => {
    it('should format timing metrics as markdown', () => {
      const metrics = {
        durationFormatted: '5m 30s',
        durationSeconds: 330,
        startTime: '2024-01-01T12:00:00Z',
        endTime: '2024-01-01T12:05:30Z',
        thresholds: {
          buildTarget: 300,
          withinBuildTarget: false
        }
      };
      
      const markdown = formatAsMarkdown(metrics, 'timing');
      
      expect(markdown).toContain('⏱️ Timing Metrics');
      expect(markdown).toContain('5m 30s');
      expect(markdown).toContain('330s');
    });

    it('should format test results as markdown', () => {
      const metrics = {
        totalTests: 100,
        passedTests: 100,
        failedTests: 0,
        skippedTests: 0,
        passRate: 100,
        testSuites: { total: 10, passed: 10, failed: 0 },
        thresholds: { meetsTarget: true }
      };
      
      const markdown = formatAsMarkdown(metrics, 'test-results');
      
      expect(markdown).toContain('🧪 Test Results');
      expect(markdown).toContain('100%');
      expect(markdown).toContain('**Total Tests:** 100');
    });

    it('should format coverage metrics as markdown table', () => {
      const metrics = {
        lines: { pct: 85, covered: 850, total: 1000 },
        statements: { pct: 83.33, covered: 1000, total: 1200 },
        functions: { pct: 85, covered: 170, total: 200 },
        branches: { pct: 80, covered: 320, total: 400 },
        thresholds: {
          linesMet: true,
          statementsMet: true,
          functionsMet: true,
          branchesMet: true,
          allMet: true
        }
      };
      
      const markdown = formatAsMarkdown(metrics, 'coverage');
      
      expect(markdown).toContain('📊 Coverage Metrics');
      expect(markdown).toContain('| Metric | Coverage |');
      expect(markdown).toContain('85.00%');
    });

    it('should format summary with all metrics', () => {
      const summary = {
        timestamp: '2024-01-01T12:00:00Z',
        metrics: {
          timing: {
            durationFormatted: '5m 0s',
            durationSeconds: 300,
            startTime: '2024-01-01T12:00:00Z',
            endTime: '2024-01-01T12:05:00Z',
            thresholds: { withinBuildTarget: true }
          },
          testResults: {
            totalTests: 100,
            passedTests: 100,
            failedTests: 0,
            skippedTests: 0,
            passRate: 100,
            testSuites: { total: 10, passed: 10, failed: 0 },
            thresholds: { meetsTarget: true }
          },
          coverage: {
            lines: { pct: 85, covered: 850, total: 1000 },
            statements: { pct: 85, covered: 1020, total: 1200 },
            functions: { pct: 85, covered: 170, total: 200 },
            branches: { pct: 85, covered: 340, total: 400 },
            thresholds: { allMet: true }
          }
        }
      };
      
      const markdown = formatAsMarkdown(summary, 'summary');
      
      expect(markdown).toContain('📈 Workflow Metrics Summary');
      expect(markdown).toContain('⏱️ Timing Metrics');
      expect(markdown).toContain('🧪 Test Results');
      expect(markdown).toContain('📊 Coverage Metrics');
      expect(markdown).toContain('Generated at:');
    });
  });

  describe('collectMetrics', () => {
    beforeEach(() => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'readFileSync').mockImplementation((file) => {
        if (file.includes('test')) {
          return JSON.stringify({
            success: true,
            numTotalTests: 100,
            numPassedTests: 100,
            numFailedTests: 0,
            numPendingTests: 0
          });
        } else if (file.includes('coverage')) {
          return JSON.stringify({
            total: {
              lines: { total: 1000, covered: 850, pct: 85 },
              statements: { total: 1200, covered: 1000, pct: 83.33 },
              functions: { total: 200, covered: 170, pct: 85 },
              branches: { total: 400, covered: 320, pct: 80 }
            }
          });
        }
      });
      jest.spyOn(fs, 'appendFileSync').mockImplementation();
    });

    afterEach(() => {
      jest.restoreAllMocks();
      delete process.env.GITHUB_STEP_SUMMARY;
    });

    it('should collect timing metrics with json output', () => {
      const options = {
        type: 'timing',
        startTime: '2024-01-01T12:00:00Z',
        endTime: '2024-01-01T12:05:00Z',
        output: 'json'
      };
      
      const result = collectMetrics(options);
      
      expect(result.success).toBe(true);
      expect(result.metrics.durationSeconds).toBe(300);
      expect(result.output).toBe('json');
    });

    it('should collect test results with markdown output', () => {
      const options = {
        type: 'test-results',
        testFile: 'test-results.json',
        output: 'markdown'
      };
      
      const result = collectMetrics(options);
      
      expect(result.success).toBe(true);
      expect(result.metrics.totalTests).toBe(100);
      expect(result.output).toBe('markdown');
    });

    it('should write to GitHub summary when available', () => {
      process.env.GITHUB_STEP_SUMMARY = '/tmp/summary.md';
      
      const options = {
        type: 'coverage',
        coverageFile: 'coverage-summary.json',
        output: 'github-summary'
      };
      
      const result = collectMetrics(options);
      
      expect(result.success).toBe(true);
      expect(result.writtenToSummary).toBe(true);
      expect(fs.appendFileSync).toHaveBeenCalled();
    });

    it('should handle missing GitHub summary file', () => {
      delete process.env.GITHUB_STEP_SUMMARY;
      
      const options = {
        type: 'summary',
        startTime: '2024-01-01T12:00:00Z',
        endTime: '2024-01-01T12:05:00Z',
        testFile: 'test-results.json',
        coverageFile: 'coverage-summary.json',
        output: 'github-summary'
      };
      
      const result = collectMetrics(options);
      
      expect(result.success).toBe(true);
      expect(result.writtenToSummary).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very short durations', () => {
      const metrics = calculateTimingMetrics(
        '2024-01-01T12:00:00.000Z',
        '2024-01-01T12:00:00.500Z'
      );
      
      expect(metrics.durationSeconds).toBe(0);
      expect(metrics.durationFormatted).toBe('0m 0s');
    });

    it('should handle very long durations', () => {
      const metrics = calculateTimingMetrics(
        '2024-01-01T12:00:00Z',
        '2024-01-01T14:30:45Z'
      );
      
      expect(metrics.durationMinutes).toBe(150);
      expect(metrics.durationFormatted).toBe('150m 45s');
    });

    it('should handle empty test results', () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify({}));
      
      const metrics = parseTestResults('test-results.json');
      
      expect(metrics.totalTests).toBe(0);
      expect(metrics.passRate).toBe(0);
    });

    it('should handle empty coverage data', () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify({ total: {} }));
      
      const metrics = parseCoverageMetrics('coverage-summary.json');
      
      expect(metrics.lines.pct).toBe(0);
      expect(metrics.thresholds.allMet).toBe(false);
    });
  });
});
