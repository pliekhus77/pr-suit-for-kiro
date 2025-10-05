const fs = require('fs');
const path = require('path');

console.log('=== Verifying Test Fixtures ===\n');

const fixtures = {
  'Valid Steering Document': 'validSteeringDocument.md',
  'Invalid Steering Document': 'invalidSteeringDocument.md',
  'Large Steering Document': 'largeSteeringDocument.md',
  'Customized Framework': 'customizedFramework.md',
  'Manifest 100 Frameworks': 'manifest-100-frameworks.json',
  'Manifest Corrupted': 'manifest-corrupted.json',
  'Metadata 50 Installed': 'metadata-50-installed.json',
  'Workspace 50 Frameworks': 'workspace-50-frameworks'
};

let allPassed = true;

for (const [name, file] of Object.entries(fixtures)) {
  const filePath = path.join(__dirname, file);
  const exists = fs.existsSync(filePath);
  
  if (exists) {
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    
    if (stats.isDirectory()) {
      const steeringPath = path.join(filePath, '.kiro', 'steering');
      if (fs.existsSync(steeringPath)) {
        const files = fs.readdirSync(steeringPath);
        console.log(`✓ ${name}: ${files.length} files`);
      } else {
        console.log(`✗ ${name}: Directory exists but no .kiro/steering`);
        allPassed = false;
      }
    } else {
      const size = stats.size > 1024 * 1024 ? `${sizeMB} MB` : `${sizeKB} KB`;
      console.log(`✓ ${name}: ${size}`);
      
      // Additional validation
      if (name === 'Large Steering Document' && stats.size < 1024 * 1024) {
        console.log(`  ⚠ Warning: Should be > 1MB`);
      }
    }
  } else {
    console.log(`✗ ${name}: NOT FOUND`);
    allPassed = false;
  }
}

console.log('\n=== Detailed Checks ===\n');

// Check valid steering document has required sections
const validDoc = fs.readFileSync(path.join(__dirname, 'validSteeringDocument.md'), 'utf-8');
const requiredSections = ['## Purpose', '## Key Concepts', '## Best Practices', '## Anti-Patterns', '## Summary'];
console.log('Valid Steering Document sections:');
requiredSections.forEach(section => {
  const has = validDoc.includes(section);
  console.log(`  ${has ? '✓' : '✗'} ${section}`);
  if (!has) allPassed = false;
});

// Check invalid steering document is missing sections
const invalidDoc = fs.readFileSync(path.join(__dirname, 'invalidSteeringDocument.md'), 'utf-8');
console.log('\nInvalid Steering Document (should be missing sections):');
console.log(`  ${!invalidDoc.includes('## Purpose') ? '✓' : '✗'} Missing Purpose`);
console.log(`  ${!invalidDoc.includes('## Summary') ? '✓' : '✗'} Missing Summary`);

// Check manifest has 100 frameworks
const manifest100 = JSON.parse(fs.readFileSync(path.join(__dirname, 'manifest-100-frameworks.json'), 'utf-8'));
console.log(`\nManifest 100 Frameworks:`);
console.log(`  ${manifest100.frameworks.length === 100 ? '✓' : '✗'} Has 100 frameworks (actual: ${manifest100.frameworks.length})`);
if (manifest100.frameworks.length !== 100) allPassed = false;

// Check metadata has 50 frameworks
const metadata50 = JSON.parse(fs.readFileSync(path.join(__dirname, 'metadata-50-installed.json'), 'utf-8'));
console.log(`\nMetadata 50 Installed:`);
console.log(`  ${metadata50.frameworks.length === 50 ? '✓' : '✗'} Has 50 frameworks (actual: ${metadata50.frameworks.length})`);
const customizedCount = metadata50.frameworks.filter(f => f.customized).length;
console.log(`  ✓ ${customizedCount} customized frameworks`);
if (metadata50.frameworks.length !== 50) allPassed = false;

// Check workspace has 50 steering documents
const workspacePath = path.join(__dirname, 'workspace-50-frameworks', '.kiro', 'steering');
if (fs.existsSync(workspacePath)) {
  const files = fs.readdirSync(workspacePath);
  console.log(`\nWorkspace 50 Frameworks:`);
  console.log(`  ${files.length === 50 ? '✓' : '✗'} Has 50 steering documents (actual: ${files.length})`);
  if (files.length !== 50) allPassed = false;
}

// Check corrupted manifest has expected issues
const manifestCorrupted = JSON.parse(fs.readFileSync(path.join(__dirname, 'manifest-corrupted.json'), 'utf-8'));
console.log(`\nManifest Corrupted:`);
console.log(`  ${manifestCorrupted.version === '' ? '✓' : '✗'} Has empty version`);
console.log(`  ${manifestCorrupted.frameworks.some(f => f.id === '') ? '✓' : '✗'} Has framework with empty ID`);
console.log(`  ${manifestCorrupted.frameworks.some(f => f.id === 'duplicate-id') ? '✓' : '✗'} Has duplicate IDs`);
console.log(`  ${manifestCorrupted.frameworks.some(f => f.version === 'not-a-version') ? '✓' : '✗'} Has invalid version`);

console.log('\n=== Summary ===\n');
console.log(allPassed ? '✓ All fixtures verified successfully!' : '✗ Some fixtures have issues');

process.exit(allPassed ? 0 : 1);
