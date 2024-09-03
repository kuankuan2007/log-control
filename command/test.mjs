
await import('./build.mjs');
import esbuild from 'esbuild';

esbuild.buildSync({
  entryPoints: ['test/src/index.ts'],
  outdir: 'test/dist',
  sourcemap: true,
});

await import('../test/dist/index.js');
console.log('[debug] index.js loaded');
