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
  { pattern: /#00E5FF/ig, replacement: '#00A896' },
  { pattern: /#005B96/ig, replacement: '#1B4F72' },
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
