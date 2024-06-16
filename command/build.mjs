import esbuild from 'esbuild';
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
const TARGET_PATH = path.relative(process.cwd(), './dist');
const SOURCE_PATH = path.relative(process.cwd(), './src');

if (fs.existsSync(path.join(TARGET_PATH))) {
  fs.rmSync(TARGET_PATH, { recursive: true });
}
fs.mkdirSync(TARGET_PATH);

execSync('tsc');

esbuild.buildSync({
  entryPoints: [path.join(SOURCE_PATH, 'index.ts')],
  bundle: true,
  platform: 'node',
  minify: true,
  outdir: TARGET_PATH,
  format: 'esm',
  outExtension: {
    '.js': '.mjs',
  },
});
esbuild.buildSync({
  entryPoints: [path.join(SOURCE_PATH, 'index.ts')],
  bundle: true,
  platform: 'node',
  minify: true,
  outdir: TARGET_PATH,
  format: 'cjs',
  outExtension: {
    '.js': '.cjs',
  },
});
