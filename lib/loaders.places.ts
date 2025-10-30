import fs from 'node:fs';
import path from 'node:path';
import type { Place } from '@/lib/types';

const GZ_FILE = path.join(process.cwd(), 'data', 'gazetteer.json');

export function loadGazetteer(): Place[] {
  const raw = fs.readFileSync(GZ_FILE, 'utf8');
  const data = JSON.parse(raw) as Place[];
  return data;
}
