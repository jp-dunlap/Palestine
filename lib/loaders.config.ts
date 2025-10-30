import fs from 'node:fs';
import path from 'node:path';

export function loadMapConfig() {
  const p = path.join(process.cwd(), 'data', 'map.config.json');
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
