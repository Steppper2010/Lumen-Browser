const { readdirSync, statSync } = require('fs');
const { join, extname } = require('path');
const { spawnSync } = require('child_process');

const root = join(__dirname, '..');
const files = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.git') continue;

    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (extname(fullPath) === '.js') {
      files.push(fullPath);
    }
  }
}

walk(join(root, 'src'));

for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], {
    encoding: 'utf8'
  });

  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout);
    process.exit(result.status || 1);
  }
}

console.log(`Syntax OK (${files.length} files)`);
