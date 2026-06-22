const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src');

function walkDir(d, callback) {
  fs.readdirSync(d).forEach(f => {
    let dirPath = path.join(d, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(d, f));
  });
}

const replacements = [
  { pattern: /AquaSense/g, replacement: 'AquaCare' },
  { pattern: /AQUASENSE/g, replacement: 'AQUACARE' },
  { pattern: /aquasense/g, replacement: 'aquacare' }
];

walkDir(dir, function(filePath) {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.html') || filePath.endsWith('.css')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    for (const { pattern, replacement } of replacements) {
      content = content.replace(pattern, replacement);
    }
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated:', filePath);
    }
  }
});

const indexHtml = path.join(__dirname, 'index.html');
if (fs.existsSync(indexHtml)) {
  let content = fs.readFileSync(indexHtml, 'utf8');
  let original = content;
  for (const { pattern, replacement } of replacements) {
    content = content.replace(pattern, replacement);
  }
  if (content !== original) {
    fs.writeFileSync(indexHtml, content, 'utf8');
    console.log('Updated:', indexHtml);
  }
}
