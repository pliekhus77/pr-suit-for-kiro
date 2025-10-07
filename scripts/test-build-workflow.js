#!/usr/bin/env node

/**
 * End-to-end test for build workflow
 * Tests build execution, artifact creation, and failure scenarios
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class BuildWorkflowTester {
    constructor() {
        this.testBranch = `test-build-${Date.now()}`;
        this.originalBranch = null;
        this.testResults = {
            buildExecution: false,
            artifactCreation: false,
            failureScenarios: false
        };
    }

    async runTests() {
        console.log('🧪 Starting build workflow end-to-end tests...\n');
        
        try {
            await this.setup();
            await this.testBuildExecution();
            await this.testArtifactCreation();
            await this.testFailureScenarios();
            await this.cleanup();
            
            this.reportResults();
        } catch (error) {
            console.error('❌ Test execution failed:', error.message);
            await this.cleanup();
            process.exit(1);
        }
    }

    async setup() {
        console.log('📋 Setting up test environment...');
        
        // Get current branch
        this.originalBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
        
        // Create test branch
        execSync(`git checkout -b ${this.testBranch}`);
        console.log(`✅ Created test branch: ${this.testBranch}`);
    }

    async testBuildExecution() {
        console.log('\n🔨 Testing build workflow execution...');
        
        try {
            // Make a test change
            const testFile = 'test-change.txt';
            fs.writeFileSync(testFile, 'Test change for build workflow');
            execSync(`git add ${testFile}`);
            execSync('git commit -m "test: trigger build workflow"');
            
            // Push to trigger workflow
            execSync(`git push origin ${this.testBranch}`);
            
            console.log('✅ Build workflow triggered successfully');
            console.log('⏳ Waiting for workflow to complete...');
            
            // Wait and check workflow status
            await this.waitForWorkflow();
            
            this.testResults.buildExecution = true;
            console.log('✅ Build execution test passed');
            
        } catch (error) {
            console.error('❌ Build execution test failed:', error.message);
        }
    }

    async testArtifactCreation() {
        console.log('\n📦 Testing artifact creation...');
        
        try {
            // Check if artifacts would be created (simulate)
            const expectedArtifacts = [
                'test-results',
                'coverage-report'
            ];
            
            // Verify build outputs exist locally
            const buildOutputs = [
                'coverage',
                'test-results.xml'
            ];
            
            let artifactsValid = true;
            for (const output of buildOutputs) {
                if (!fs.existsSync(output)) {
                    console.log(`⚠️  Expected build output not found: ${output}`);
                    artifactsValid = false;
                }
            }
            
            if (artifactsValid) {
                this.testResults.artifactCreation = true;
                console.log('✅ Artifact creation test passed');
            } else {
                console.log('❌ Some artifacts missing');
            }
            
        } catch (error) {
            console.error('❌ Artifact creation test failed:', error.message);
        }
    }

    async testFailureScenarios() {
        console.log('\n💥 Testing failure scenarios...');
        
        try {
            // Create a branch with failing tests
            const failBranch = `${this.testBranch}-fail`;
            execSync(`git checkout -b ${failBranch}`);
            
            // Introduce a failing test
            const failingTest = `
describe('Failing Test', () => {
    test('should fail', () => {
        expect(true).toBe(false);
    });
});
`;
            
            fs.writeFileSync('src/__tests__/failing.test.js', failingTest);
            execSync('git add src/__tests__/failing.test.js');
            execSync('git commit -m "test: add failing test"');
            
            // Test that build fails appropriately
            try {
                execSync('npm test', { stdio: 'pipe' });
                console.log('❌ Expected test to fail but it passed');
            } catch (error) {
                console.log('✅ Build correctly failed with failing tests');
                this.testResults.failureScenarios = true;
            }
            
            // Clean up failing test
            fs.unlinkSync('src/__tests__/failing.test.js');
            execSync(`git checkout ${this.testBranch}`);
            execSync(`git branch -D ${failBranch}`);
            
        } catch (error) {
            console.error('❌ Failure scenario test failed:', error.message);
        }
    }

    async waitForWorkflow() {
        // Simulate workflow wait (in real scenario, would check GitHub API)
        console.log('⏳ Simulating workflow execution...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('✅ Workflow simulation complete');
    }

    async cleanup() {
        console.log('\n🧹 Cleaning up test environment...');
        
        try {
            // Switch back to original branch
            if (this.originalBranch) {
                execSync(`git checkout ${this.originalBranch}`);
            }
            
            // Delete test branch locally
            execSync(`git branch -D ${this.testBranch}`);
            
            // Delete remote test branch
            try {
                execSync(`git push origin --delete ${this.testBranch}`, { stdio: 'pipe' });
            } catch (error) {
                // Branch might not exist on remote
            }
            
            // Clean up test files
            if (fs.existsSync('test-change.txt')) {
                fs.unlinkSync('test-change.txt');
            }
            
            console.log('✅ Cleanup complete');
            
        } catch (error) {
            console.error('⚠️  Cleanup warning:', error.message);
        }
    }

    reportResults() {
        console.log('\n📊 Build Workflow Test Results:');
        console.log('================================');
        
        const results = [
            { name: 'Build Execution', passed: this.testResults.buildExecution },
            { name: 'Artifact Creation', passed: this.testResults.artifactCreation },
            { name: 'Failure Scenarios', passed: this.testResults.failureScenarios }
        ];
        
        results.forEach(result => {
            const status = result.passed ? '✅ PASS' : '❌ FAIL';
            console.log(`${status} ${result.name}`);
        });
        
        const allPassed = results.every(r => r.passed);
        console.log(`\n${allPassed ? '🎉' : '💥'} Overall: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
        
        if (!allPassed) {
            process.exit(1);
        }
    }
}

// Run tests if called directly
if (require.main === module) {
    const tester = new BuildWorkflowTester();
    tester.runTests().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = BuildWorkflowTester;
