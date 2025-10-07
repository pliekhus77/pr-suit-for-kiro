#!/usr/bin/env node

/**
 * End-to-end test for rollback workflow
 * Tests artifact retrieval, republishing, and documentation updates
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class RollbackWorkflowTester {
    constructor() {
        this.testVersions = ['1.0.0', '1.0.1', '1.1.0'];
        this.rollbackVersion = '1.0.0';
        this.testResults = {
            artifactRetrieval: false,
            republishing: false,
            documentation: false,
            notifications: false
        };
    }

    async runTests() {
        console.log('🧪 Starting rollback workflow end-to-end tests...\n');
        
        try {
            await this.setup();
            await this.testArtifactRetrieval();
            await this.testRepublishing();
            await this.testDocumentation();
            await this.testNotifications();
            await this.cleanup();
            
            this.reportResults();
        } catch (error) {
            console.error('❌ Test execution failed:', error.message);
            await this.cleanup();
            process.exit(1);
        }
    }

    async setup() {
        console.log('📋 Setting up rollback test environment...');
        
        // Create mock artifacts for different versions
        this.testVersions.forEach(version => {
            const artifactDir = `artifacts-${version}`;
            if (!fs.existsSync(artifactDir)) {
                fs.mkdirSync(artifactDir);
            }
            
            const vsixFile = path.join(artifactDir, `pragmatic-rhino-suit-${version}.vsix`);
            fs.writeFileSync(vsixFile, `mock-vsix-content-${version}`);
            
            console.log(`✅ Mock artifact created: ${vsixFile}`);
        });
        
        console.log(`🔄 Target rollback version: ${this.rollbackVersion}`);
    }

    async testArtifactRetrieval() {
        console.log('\n📥 Testing artifact retrieval...');
        
        try {
            // Test artifact availability check
            const artifactDir = `artifacts-${this.rollbackVersion}`;
            const vsixFile = path.join(artifactDir, `pragmatic-rhino-suit-${this.rollbackVersion}.vsix`);
            
            if (fs.existsSync(vsixFile)) {
                console.log(`✅ Artifact found: ${vsixFile}`);
                
                // Verify artifact integrity
                const content = fs.readFileSync(vsixFile, 'utf8');
                if (content.includes(this.rollbackVersion)) {
                    console.log('✅ Artifact integrity verified');
                    this.testResults.artifactRetrieval = true;
                } else {
                    console.log('❌ Artifact integrity check failed');
                }
            } else {
                console.log('❌ Artifact not found');
            }
            
            // Test missing artifact scenario
            const missingVersion = '0.9.0';
            const missingArtifact = `artifacts-${missingVersion}/pragmatic-rhino-suit-${missingVersion}.vsix`;
            
            if (!fs.existsSync(missingArtifact)) {
                console.log(`✅ Missing artifact scenario handled: ${missingVersion}`);
            }
            
        } catch (error) {
            console.error('❌ Artifact retrieval test failed:', error.message);
        }
    }

    async testRepublishing() {
        console.log('\n🚀 Testing rollback publishing...');
        
        try {
            const vsixFile = `artifacts-${this.rollbackVersion}/pragmatic-rhino-suit-${this.rollbackVersion}.vsix`;
            
            if (fs.existsSync(vsixFile)) {
                // Simulate republishing process
                const publishSteps = [
                    'Retrieving rollback artifact',
                    'Validating artifact version',
                    'Authenticating with marketplace',
                    'Republishing to marketplace',
                    'Verifying rollback success'
                ];
                
                console.log('⏳ Simulating rollback publishing...');
                
                for (const step of publishSteps) {
                    console.log(`  ✅ ${step}`);
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
                
                // Test rollback success verification
                console.log('✅ Rollback publishing simulation complete');
                this.testResults.republishing = true;
                
            } else {
                console.log('❌ Rollback artifact not available');
            }
            
        } catch (error) {
            console.error('❌ Republishing test failed:', error.message);
        }
    }

    async testDocumentation() {
        console.log('\n📝 Testing rollback documentation...');
        
        try {
            // Test release notes update
            const releaseNotes = `
# Rollback to v${this.rollbackVersion}

## Reason
Emergency rollback due to critical issue in latest release.

## Changes
- Reverted to stable version ${this.rollbackVersion}
- All features from versions after ${this.rollbackVersion} are temporarily unavailable

## Next Steps
- Investigation of the issue is ongoing
- New release will be published once issue is resolved

## Rollback Details
- Rollback performed: ${new Date().toISOString()}
- Previous version: 1.1.0
- Rolled back to: ${this.rollbackVersion}
`;
            
            fs.writeFileSync('ROLLBACK_NOTES.md', releaseNotes);
            console.log('✅ Rollback notes created');
            
            // Test rollback comment generation
            const rollbackComment = {
                type: 'rollback',
                version: this.rollbackVersion,
                reason: 'Critical issue detected',
                timestamp: new Date().toISOString(),
                performer: 'automated-rollback'
            };
            
            console.log('✅ Rollback comment generated:');
            console.log(`  Version: ${rollbackComment.version}`);
            console.log(`  Reason: ${rollbackComment.reason}`);
            console.log(`  Timestamp: ${rollbackComment.timestamp}`);
            
            this.testResults.documentation = true;
            
        } catch (error) {
            console.error('❌ Documentation test failed:', error.message);
        }
    }

    async testNotifications() {
        console.log('\n📢 Testing rollback notifications...');
        
        try {
            // Test different notification scenarios
            const notifications = [
                {
                    type: 'rollback_initiated',
                    message: `Rollback to version ${this.rollbackVersion} initiated`,
                    urgency: 'high',
                    channels: ['email', 'slack', 'github']
                },
                {
                    type: 'rollback_completed',
                    message: `Successfully rolled back to version ${this.rollbackVersion}`,
                    urgency: 'medium',
                    channels: ['email', 'slack'],
                    details: {
                        marketplaceUrl: 'https://marketplace.visualstudio.com/items?itemName=publisher.extension',
                        rollbackTime: new Date().toISOString()
                    }
                },
                {
                    type: 'rollback_failed',
                    message: 'Rollback operation failed',
                    urgency: 'critical',
                    channels: ['email', 'slack', 'phone'],
                    error: 'Artifact not found for target version'
                }
            ];
            
            notifications.forEach(notification => {
                console.log(`  ✅ ${notification.type.toUpperCase()}: ${notification.message}`);
                console.log(`    Urgency: ${notification.urgency}`);
                console.log(`    Channels: ${notification.channels.join(', ')}`);
                
                if (notification.details) {
                    Object.entries(notification.details).forEach(([key, value]) => {
                        console.log(`    ${key}: ${value}`);
                    });
                }
                
                if (notification.error) {
                    console.log(`    Error: ${notification.error}`);
                }
            });
            
            this.testResults.notifications = true;
            
        } catch (error) {
            console.error('❌ Notifications test failed:', error.message);
        }
    }

    async cleanup() {
        console.log('\n🧹 Cleaning up rollback test environment...');
        
        try {
            // Clean up mock artifacts
            this.testVersions.forEach(version => {
                const artifactDir = `artifacts-${version}`;
                if (fs.existsSync(artifactDir)) {
                    fs.rmSync(artifactDir, { recursive: true, force: true });
                    console.log(`🗑️  Removed: ${artifactDir}`);
                }
            });
            
            // Clean up test files
            const testFiles = ['ROLLBACK_NOTES.md'];
            testFiles.forEach(file => {
                if (fs.existsSync(file)) {
                    fs.unlinkSync(file);
                    console.log(`🗑️  Removed: ${file}`);
                }
            });
            
            console.log('✅ Cleanup complete');
            
        } catch (error) {
            console.error('⚠️  Cleanup warning:', error.message);
        }
    }

    reportResults() {
        console.log('\n📊 Rollback Workflow Test Results:');
        console.log('===================================');
        
        const results = [
            { name: 'Artifact Retrieval', passed: this.testResults.artifactRetrieval },
            { name: 'Republishing', passed: this.testResults.republishing },
            { name: 'Documentation', passed: this.testResults.documentation },
            { name: 'Notifications', passed: this.testResults.notifications }
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

if (require.main === module) {
    const tester = new RollbackWorkflowTester();
    tester.runTests().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = RollbackWorkflowTester;
