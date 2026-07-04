const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
const watch = args.includes('--watch');

async function build() {
  const config = {
    entryPoints: [path.resolve(__dirname, 'src/code.ts')],
    outfile: path.resolve(__dirname, 'dist/code.js'),
    bundle: true,
    minify: true,
    target: 'ES2022',
    format: 'iife',
    platform: 'browser',
    logLevel: 'info',
  };

  const distDir = path.resolve(__dirname, 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  if (watch) {
    const ctx = await esbuild.context(config);
    await ctx.watch();
    console.log('👀 Watching for changes...');
  } else {
    await esbuild.build(config);
    fs.copyFileSync(path.resolve(__dirname, 'manifest.json'), path.resolve(distDir, 'manifest.json'));
    fs.copyFileSync(path.resolve(__dirname, 'src/ui.html'), path.resolve(distDir, 'ui.html'));
    console.log('✓ Plugin built → dist/');
    const stats = fs.statSync(path.resolve(distDir, 'code.js'));
    console.log(`  code.js: ${(stats.size / 1024).toFixed(1)} KB`);
  }
}

build().catch(err => {
  console.error(err);
  process.exit(1);
});
