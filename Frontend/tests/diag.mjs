import { readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FRONTEND = join(__dirname, '..');
console.log('FRONTEND:', FRONTEND);

const adminDir = join(FRONTEND, 'src', 'app', 'admin');
console.log('adminDir:', adminDir);
console.log('adminDir exists:', existsSync(adminDir));

const admins = readdirSync(adminDir, { withFileTypes: true })
  .filter(d => d.isDirectory() && existsSync(join(adminDir, d.name, 'page.tsx')));
console.log('Admin pages found:', admins.length);
admins.slice(0, 5).forEach(d => console.log(' -', d.name));

const dashDir = join(FRONTEND, 'src', 'app', 'dashboard');
console.log('dashDir exists:', existsSync(dashDir));
const dashes = readdirSync(dashDir, { withFileTypes: true })
  .filter(d => d.isDirectory() && existsSync(join(dashDir, d.name, 'page.tsx')));
console.log('Dashboard pages found:', dashes.length);
