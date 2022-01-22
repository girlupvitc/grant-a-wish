require('esbuild').build({
    entryPoints: ['src/main.ts'],
    bundle: true,
    outfile: 'dist/built.js',
    platform: 'node',
    external: ['better-sqlite3']
})