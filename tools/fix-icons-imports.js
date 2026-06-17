const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', 'clipcraft-web', 'src');

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full);
    else if (/\.(tsx?|jsx?|ts)$/.test(name)) processFile(full);
  }
}

function processFile(file) {
  let src = fs.readFileSync(file, 'utf8');
  if (src.includes("@/icons")) {
    const updated = src.replace(/@\/icons/g, '@/components/icons');
    fs.writeFileSync(file, updated, 'utf8');
    console.log('Patched', path.relative(process.cwd(), file));
  }
}

walk(root);
console.log('Done icons fix.');
