import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const root = process.cwd();
const watchedDirectories = ['app', 'components', 'styles'];
const allowedExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.mdx', '.md', '.html', '.mjs', '.cjs']);
const bannedPatterns = [/fonts\.googleapis\.com/i, /fonts\.gstatic\.com/i];

describe('privacy: bundle avoids external font hosts', () => {
  const files: string[] = [];

  for (const directory of watchedDirectories) {
    const fullPath = join(root, directory);
    collectFiles(fullPath, files);
  }

  it('removes Google Fonts links from the codebase', () => {
    for (const file of files) {
      if (!allowedExtensions.has(extname(file))) {
        continue;
      }

      const contents = readFileSync(file, 'utf8');
      for (const pattern of bannedPatterns) {
        expect(contents).not.toMatch(pattern);
      }
    }
  });
});

function collectFiles(directory: string, accumulator: string[]) {
  const entries = readdirSync(directory);
  for (const entry of entries) {
    const absolute = join(directory, entry);
    const stats = statSync(absolute);

    if (stats.isDirectory()) {
      collectFiles(absolute, accumulator);
      continue;
    }

    accumulator.push(absolute);
  }
}
