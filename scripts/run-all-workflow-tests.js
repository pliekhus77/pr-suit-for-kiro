#!/usr/bin/env node

/**
 * Master test runner for all GitHub Actions workflow tests
 * Executes all end-to-end tests in sequence and reports overall results
 */

const BuildWorkflowTester = require('./test-build-workflow');
const PRWorkflowTester = require('./test-pr-workflow');
const VersionWorkflowTester = require('./test-version-workflow');
const PackageWorkflowTester = require('./test-package-workflow');
const DeployWorkflowTester = require('./test-deploy-workflow');
const RollbackWorkflowTester = require('./test-rollback-workflow');
const SecurityValidationTester = require('./test-security-validation');

class MasterWorkflowTester {
    constructor() {
        this.testSuites = [
            { name: 'Build Workflow', tester: BuildWorkflowTester, id: '12.2' },
            { name: 'PR Workflow', tester: PRWorkflowTester, id: '12.3' },
            { name: 'Version Workflow', tester: VersionWorkflowTester, id: '12.4' },
            { name: 'Package Workflow', tester: PackageWorkflowTester, id: '12.5' },
            { name: 'Deploy Workflow', tester: DeployWorkflowTester, id: '12.6' },
            { name: 'Rollback Workflow', tester: RollbackWorkflowTester, id: '12.7' },
            { name: 'Security Validation', tester: SecurityValidationTester, id: '12.8' }
        ];
        this.results = {};
        this.startTime = Date.now();
    }

    async runAllTests() {
        console.log('🚀 GitHub Actions Workflow End-to-End Test Suite');
        console.log('==================================================\n');
        
        console.log(`📅 Started: ${new Date().toISOString()}`);
        console.log(`🧪 Test Suites: ${this.testSuites.length}`);
        console.log('');
        
        let overallSuccess = true;
        
        for (const suite of this.testSuites) {
            console.log(`\n${'='.repeat(60)}`);
            console.log(`🧪 Running: ${suite.name} (Task ${suite.id})`);
            console.log(`${'='.repeat(60)}`);
            
            try {
                const tester = new suite.tester();
                await tester.runTests();
                
                this.results[suite.name] = {
                    status: 'PASSED',
                    error: null,
                    duration: this.getTestDuration()
                };
                
                console.log(`\n✅ ${suite.name} completed successfully`);
                
            } catch (error) {
                this.results[suite.name] = {
                    status: 'FAILED',
                    error: error.message,
                    duration: this.getTestDuration()
                };
                
                console.error(`\n❌ ${suite.name} failed: ${error.message}`);
                overallSuccess = false;
                
                // Continue with other tests even if one fails
            }
        }
        
        this.reportOverallResults(overallSuccess);
        
        if (!overallSuccess) {
            process.exit(1);
        }
    }

    getTestDuration() {
        return ((Date.now() - this.startTime) / 1000).toFixed(2);
    }

    reportOverallResults(success) {
        const endTime = Date.now();
        const totalDuration = ((endTime - this.startTime) / 1000).toFixed(2);
        
        console.log('\n' + '='.repeat(80));
        console.log('📊 OVERALL TEST RESULTS');
        console.log('='.repeat(80));
        
        console.log(`\n📅 Completed: ${new Date().toISOString()}`);
        console.log(`⏱️  Total Duration: ${totalDuration}s`);
        console.log('');
        
        // Results summary
        const passed = Object.values(this.results).filter(r => r.status === 'PASSED').length;
        const failed = Object.values(this.results).filter(r => r.status === 'FAILED').length;
        
        console.log('📋 Test Suite Results:');
        console.log('-'.repeat(40));
        
        this.testSuites.forEach(suite => {
            const result = this.results[suite.name];
            if (result) {
                const status = result.status === 'PASSED' ? '✅ PASS' : '❌ FAIL';
                console.log(`${status} ${suite.name} (${suite.id})`);
                
                if (result.error) {
                    console.log(`     Error: ${result.error}`);
                }
            } else {
                console.log(`⚠️  SKIP ${suite.name} (${suite.id}) - Not executed`);
            }
        });
        
        console.log('');
        console.log('📈 Summary:');
        console.log(`   ✅ Passed: ${passed}`);
        console.log(`   ❌ Failed: ${failed}`);
        console.log(`   📊 Success Rate: ${((passed / this.testSuites.length) * 100).toFixed(1)}%`);
        
        console.log('');
        if (success) {
            console.log('🎉 ALL WORKFLOW TESTS PASSED!');
            console.log('   GitHub Actions CI/CD pipeline is ready for production use.');
        } else {
            console.log('💥 SOME WORKFLOW TESTS FAILED!');
            console.log('   Please review failed tests and fix issues before deployment.');
        }
        
        console.log('\n' + '='.repeat(80));
        
        // Generate test report
        this.generateTestReport();
    }

    generateTestReport() {
        const report = {
            timestamp: new Date().toISOString(),
            totalDuration: ((Date.now() - this.startTime) / 1000).toFixed(2),
            testSuites: this.testSuites.length,
            results: this.results,
            summary: {
                passed: Object.values(this.results).filter(r => r.status === 'PASSED').length,
                failed: Object.values(this.results).filter(r => r.status === 'FAILED').length,
                successRate: ((Object.values(this.results).filter(r => r.status === 'PASSED').length / this.testSuites.length) * 100).toFixed(1)
            }
        };
        
        const fs = require('fs');
        fs.writeFileSync('workflow-test-report.json', JSON.stringify(report, null, 2));
        console.log('📄 Test report saved: workflow-test-report.json');
    }
}

// Command line options
const args = process.argv.slice(2);
const options = {
    suite: args.find(arg => arg.startsWith('--suite='))?.split('=')[1],
    verbose: args.includes('--verbose'),
    help: args.includes('--help')
};

if (options.help) {
    console.log(`
GitHub Actions Workflow Test Runner

Usage:
  node run-all-workflow-tests.js [options]

Options:
  --suite=<name>    Run specific test suite only
  --verbose         Enable verbose output
  --help           Show this help message

Available test suites:
  - build          Build Workflow (12.2)
  - pr             PR Workflow (12.3)
  - version        Version Workflow (12.4)
  - package        Package Workflow (12.5)
  - deploy         Deploy Workflow (12.6)
  - rollback       Rollback Workflow (12.7)
  - security       Security Validation (12.8)

Examples:
  node run-all-workflow-tests.js
  node run-all-workflow-tests.js --suite=build
  node run-all-workflow-tests.js --verbose
`);
    process.exit(0);
}

// Run specific suite if requested
if (options.suite) {
    const suiteMap = {
        'build': BuildWorkflowTester,
        'pr': PRWorkflowTester,
        'version': VersionWorkflowTester,
        'package': PackageWorkflowTester,
        'deploy': DeployWorkflowTester,
        'rollback': RollbackWorkflowTester,
        'security': SecurityValidationTester
    };
    
    const TesterClass = suiteMap[options.suite];
    if (TesterClass) {
        console.log(`🧪 Running single test suite: ${options.suite}`);
        const tester = new TesterClass();
        tester.runTests().catch(error => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
    } else {
        console.error(`❌ Unknown test suite: ${options.suite}`);
        console.error('Available suites:', Object.keys(suiteMap).join(', '));
        process.exit(1);
    }
} else {
    // Run all tests
    const masterTester = new MasterWorkflowTester();
    masterTester.runAllTests().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}
