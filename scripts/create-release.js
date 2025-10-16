#!/usr/bin/env node

/**
 * Release Creation Helper Script
 * 
 * This script helps create releases by:
 * 1. Validating the current state
 * 2. Updating version in package.json
 * 3. Creating and pushing git tag
 * 4. Providing next steps
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

function log(message, color = 'white') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
    log(`❌ ${message}`, 'red');
}

function success(message) {
    log(`✅ ${message}`, 'green');
}

function warning(message) {
    log(`⚠️ ${message}`, 'yellow');
}

function info(message) {
    log(`ℹ️ ${message}`, 'blue');
}

function execCommand(command, options = {}) {
    try {
        const result = execSync(command, { 
            encoding: 'utf8', 
            stdio: options.silent ? 'pipe' : 'inherit',
            ...options 
        });
        return result ? result.trim() : '';
    } catch (err) {
        if (!options.silent) {
            error(`Command failed: ${command}`);
            error(err.message);
        }
        throw err;
    }
}

function validateGitState() {
    info('Validating git state...');
    
    // Check if we're in a git repository
    try {
        execCommand('git rev-parse --git-dir', { silent: true });
    } catch {
        error('Not in a git repository');
        process.exit(1);
    }
    
    // Check for uncommitted changes
    try {
        const status = execCommand('git status --porcelain', { silent: true });
        if (status) {
            error('Uncommitted changes detected:');
            console.log(status);
            error('Please commit or stash changes before creating a release');
            process.exit(1);
        }
    } catch {
        error('Failed to check git status');
        process.exit(1);
    }
    
    // Check current branch
    try {
        const branch = execCommand('git branch --show-current', { silent: true });
        if (branch !== 'main' && branch !== 'master') {
            warning(`Currently on branch '${branch}'. Consider releasing from main/master branch.`);
        }
    } catch {
        warning('Could not determine current branch');
    }
    
    success('Git state validation passed');
}

function validatePackageJson() {
    info('Validating package.json...');
    
    const packagePath = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(packagePath)) {
        error('package.json not found');
        process.exit(1);
    }
    
    try {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        // Validate required fields
        const requiredFields = ['name', 'version', 'publisher'];
        for (const field of requiredFields) {
            if (!packageJson[field]) {
                error(`Missing required field in package.json: ${field}`);
                process.exit(1);
            }
        }
        
        // Validate version format
        const versionRegex = /^\d+\.\d+\.\d+(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?(\+[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?$/;
        if (!versionRegex.test(packageJson.version)) {
            error(`Invalid version format in package.json: ${packageJson.version}`);
            error('Expected semantic version format: MAJOR.MINOR.PATCH');
            process.exit(1);
        }
        
        success(`Package validation passed - ${packageJson.name} v${packageJson.version}`);
        return packageJson;
    } catch (err) {
        error(`Failed to parse package.json: ${err.message}`);
        process.exit(1);
    }
}

function runTests() {
    info('Running tests...');
    
    try {
        // Run linting
        info('Running ESLint...');
        execCommand('npm run lint');
        success('Linting passed');
        
        // Run tests with coverage
        info('Running tests with coverage...');
        execCommand('npm test -- --coverage --coverageReporters=json-summary');
        
        // Check coverage
        const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
        if (fs.existsSync(coveragePath)) {
            const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
            const linesCoverage = coverage.total.lines.pct;
            
            if (linesCoverage < 80) {
                error(`Code coverage below threshold: ${linesCoverage}% (minimum: 80%)`);
                process.exit(1);
            }
            
            success(`Tests passed with ${linesCoverage}% coverage`);
        } else {
            warning('Coverage report not found, skipping coverage check');
        }
        
    } catch (err) {
        error('Tests failed');
        process.exit(1);
    }
}

function updateVersion(currentVersion, versionType) {
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    
    switch (versionType) {
        case 'patch':
            return `${major}.${minor}.${patch + 1}`;
        case 'minor':
            return `${major}.${minor + 1}.0`;
        case 'major':
            return `${major + 1}.0.0`;
        default:
            return versionType; // Assume it's a specific version
    }
}

function createTag(version) {
    const tag = `v${version}`;
    
    info(`Creating git tag: ${tag}`);
    
    try {
        // Check if tag already exists
        try {
            execCommand(`git rev-parse ${tag}`, { silent: true });
            error(`Tag ${tag} already exists`);
            process.exit(1);
        } catch {
            // Tag doesn't exist, which is what we want
        }
        
        // Create tag
        execCommand(`git tag ${tag}`);
        success(`Tag ${tag} created locally`);
        
        // Push tag
        info(`Pushing tag to origin...`);
        execCommand(`git push origin ${tag}`);
        success(`Tag ${tag} pushed to origin`);
        
        return tag;
    } catch (err) {
        error(`Failed to create/push tag: ${err.message}`);
        process.exit(1);
    }
}

function showNextSteps(tag, version) {
    log('\n' + '='.repeat(60), 'cyan');
    log('🚀 RELEASE PROCESS INITIATED', 'cyan');
    log('='.repeat(60), 'cyan');
    
    log(`\n📦 Version: ${version}`, 'green');
    log(`🏷️ Tag: ${tag}`, 'green');
    
    log('\n📋 What happens next:', 'blue');
    log('1. ✅ Git tag has been pushed to origin', 'white');
    log('2. 🔄 GitHub Actions will automatically:', 'white');
    log('   - Build and test the extension', 'white');
    log('   - Create VSIX package', 'white');
    log('   - Create GitHub release', 'white');
    log('   - Publish to VS Code Marketplace (if configured)', 'white');
    
    log('\n🔗 Monitor progress:', 'blue');
    log('   - GitHub Actions: https://github.com/pliekhus77/pr-suit-for-kiro/actions', 'white');
    log('   - Releases: https://github.com/pliekhus77/pr-suit-for-kiro/releases', 'white');
    
    log('\n⏱️ Expected timeline:', 'blue');
    log('   - Build & Package: ~3-5 minutes', 'white');
    log('   - GitHub Release: ~1-2 minutes', 'white');
    log('   - Marketplace Publishing: ~5-10 minutes', 'white');
    
    log('\n📝 If something goes wrong:', 'yellow');
    log('   - Check workflow logs for error details', 'white');
    log('   - Delete tag if needed: git tag -d ' + tag + ' && git push origin :refs/tags/' + tag, 'white');
    log('   - Fix issues and create new tag', 'white');
    
    log('\n' + '='.repeat(60), 'cyan');
}

function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        log('🚀 Pragmatic Rhino SUIT Release Creator', 'cyan');
        log('');
        log('Usage:', 'blue');
        log('  node scripts/create-release.js <version-type>', 'white');
        log('  node scripts/create-release.js <specific-version>', 'white');
        log('');
        log('Version Types:', 'blue');
        log('  patch   - Increment patch version (1.2.3 → 1.2.4)', 'white');
        log('  minor   - Increment minor version (1.2.3 → 1.3.0)', 'white');
        log('  major   - Increment major version (1.2.3 → 2.0.0)', 'white');
        log('');
        log('Specific Version Examples:', 'blue');
        log('  1.2.3         - Stable release', 'white');
        log('  1.2.3-beta.1  - Beta pre-release', 'white');
        log('  1.2.3-alpha.1 - Alpha pre-release', 'white');
        log('  1.2.3-rc.1    - Release candidate', 'white');
        log('');
        log('Examples:', 'blue');
        log('  node scripts/create-release.js patch', 'white');
        log('  node scripts/create-release.js minor', 'white');
        log('  node scripts/create-release.js 1.2.3-beta.1', 'white');
        log('');
        log('Prerequisites:', 'yellow');
        log('  - Clean git working directory', 'white');
        log('  - All tests passing', 'white');
        log('  - Code coverage ≥ 80%', 'white');
        log('  - Updated CHANGELOG.md', 'white');
        return;
    }
    
    const versionInput = args[0];
    
    log('🚀 Starting release process...', 'cyan');
    log('');
    
    // Validate environment
    validateGitState();
    const packageJson = validatePackageJson();
    
    // Determine new version
    let newVersion;
    if (['patch', 'minor', 'major'].includes(versionInput)) {
        newVersion = updateVersion(packageJson.version, versionInput);
        log(`📈 Version increment: ${packageJson.version} → ${newVersion}`, 'blue');
    } else {
        newVersion = versionInput;
        log(`📌 Specific version: ${newVersion}`, 'blue');
    }
    
    // Validate new version format
    const versionRegex = /^\d+\.\d+\.\d+(-[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?(\+[0-9A-Za-z-]+(\.[0-9A-Za-z-]+)*)?$/;
    if (!versionRegex.test(newVersion)) {
        error(`Invalid version format: ${newVersion}`);
        error('Expected semantic version format: MAJOR.MINOR.PATCH');
        process.exit(1);
    }
    
    // Update package.json if version changed
    if (newVersion !== packageJson.version) {
        info(`Updating package.json version to ${newVersion}...`);
        packageJson.version = newVersion;
        
        const packagePath = path.join(process.cwd(), 'package.json');
        fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
        
        // Commit the version change
        execCommand('git add package.json');
        execCommand(`git commit -m "chore: bump version to ${newVersion}"`);
        execCommand('git push origin HEAD');
        
        success(`Version updated and committed`);
    }
    
    // Run quality checks
    runTests();
    
    // Create and push tag
    const tag = createTag(newVersion);
    
    // Show next steps
    showNextSteps(tag, newVersion);
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = {
    validateGitState,
    validatePackageJson,
    runTests,
    updateVersion,
    createTag
};