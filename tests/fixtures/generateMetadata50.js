const fs = require('fs');
const path = require('path');

const metadata = {
  frameworks: []
};

// Generate 50 installed frameworks
for (let i = 0; i < 50; i++) {
  const installedDate = new Date(2025, 0, 1 + i); // January 1-50, 2025
  const isCustomized = i % 5 === 0; // Every 5th framework is customized
  const customizedDate = isCustomized ? new Date(2025, 0, 15 + i) : undefined;
  
  const framework = {
    id: `framework-${i + 1}`,
    version: `1.${Math.floor(i / 10)}.${i % 10}`,
    installedAt: installedDate.toISOString(),
    customized: isCustomized
  };
  
  if (isCustomized) {
    framework.customizedAt = customizedDate.toISOString();
  }
  
  metadata.frameworks.push(framework);
}

const outputPath = path.join(__dirname, 'metadata-50-installed.json');
fs.writeFileSync(outputPath, JSON.stringify(metadata, null, 2));

console.log(`Generated metadata with ${metadata.frameworks.length} installed frameworks`);
console.log(`Customized frameworks: ${metadata.frameworks.filter(f => f.customized).length}`);
console.log(`File location: ${outputPath}`);
console.log(`File size: ${(JSON.stringify(metadata).length / 1024).toFixed(2)} KB`);
