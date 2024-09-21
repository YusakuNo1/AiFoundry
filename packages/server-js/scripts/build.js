// build.js
const esbuild = require('esbuild');
esbuild.build({
  entryPoints: ['./dist/server.js'],
  bundle: true,
  outfile: './release/server.js',
  platform: 'node'
}).catch(() => process.exit(1));
