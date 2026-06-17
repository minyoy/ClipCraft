const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', 'clipcraft-web', 'src');
const allowedRoots = [
  'components', 'pages', 'lib', 'types', 'api', 'mock', 'assets', 'router', 'styles', 'icons', 'App', 'main'
];

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full);
    else if (/\.(tsx?|jsx?)$/.test(name)) processFile(full);
  }
}

function processFile(file) {
  let src = fs.readFileSync(file, 'utf8');
  const regex = /((?:from|import)\s+|\bimport\()(['"])(\.\.?\/?)([^'"\)]+)(['"]|\))/g;
  let changed = false;
  src = src.replace(regex, (m, p1, quote, dots, rest, quoteOrParen) => {
    // resolve the import target relative to the file
    const fileDir = path.dirname(file);
    const resolved = path.resolve(fileDir, dots + rest);
    if (resolved.startsWith(root)) {
      const rel = path.relative(root, resolved).replace(/\\\\/g, '/');
      changed = true;
      return `${p1}${quote}@/${rel}${quoteOrParen}`;
    }
    return m;
  });
  if (changed) {
    fs.writeFileSync(file, src, 'utf8');
    console.log('Updated', path.relative(process.cwd(), file));
  }
}

walk(root);
console.log('Done.');
