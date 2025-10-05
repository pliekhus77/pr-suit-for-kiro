const fs = require('fs');
const path = require('path');

const categories = [
  'architecture',
  'testing',
  'security',
  'devops',
  'cloud',
  'infrastructure',
  'work-management'
];

const manifest = {
  version: '1.0.0',
  frameworks: []
};

// Generate 100 frameworks
for (let i = 0; i < 100; i++) {
  const category = categories[i % categories.length];
  const framework = {
    id: `framework-${i + 1}`,
    name: `Framework ${i + 1}`,
    description: `This is test framework number ${i + 1} for performance testing with large manifests`,
    category: category,
    version: `1.${Math.floor(i / 10)}.${i % 10}`,
    fileName: `framework-${i + 1}.md`,
    dependencies: []
  };
  
  // Add some dependencies for variety
  if (i > 0 && i % 5 === 0) {
    framework.dependencies = [`framework-${i}`, `framework-${Math.max(1, i - 1)}`];
  }
  
  manifest.frameworks.push(framework);
}

const outputPath = path.join(__dirname, 'manifest-100-frameworks.json');
fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));

console.log(`Generated manifest with ${manifest.frameworks.length} frameworks`);
console.log(`File location: ${outputPath}`);
console.log(`File size: ${(JSON.stringify(manifest).length / 1024).toFixed(2)} KB`);
