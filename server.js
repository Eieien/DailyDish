// Standalone Node server for this Expo Router project's API routes
// (app/api/*.ts). Unlike EAS Hosting's edge/Workers runtime, this runs under
// plain Node — which supports the raw TCP Postgres connections `postgres-js`
// needs (db/index.ts). Run `bunx expo export -p web` first to (re)generate
// dist/server, then `bun server.js` (or `node server.js`) to serve it.
const fs = require('fs');
const http = require('http');
const path = require('path');

process.on('uncaughtException', (err) => {
  console.error('[server] Uncaught exception:', err);
});
process.on('unhandledRejection', (err) => {
  console.error('[server] Unhandled rejection:', err);
});

const port = process.env.PORT || 3000;
const buildDir = path.join(__dirname, 'dist/server');

console.log(`[server] Booting. PORT env = ${process.env.PORT ?? '(not set)'}, using port ${port}`);
console.log(`[server] Expecting build output at: ${buildDir}`);
console.log(`[server] Build directory exists: ${fs.existsSync(buildDir)}`);

const { createRequestHandler } = require('expo-server/adapter/http');

const handler = createRequestHandler({
  build: buildDir,
});

const server = http.createServer((req, res) => {
  handler(req, res, () => {
    res.statusCode = 404;
    res.end('Not found');
  });
});

server.listen(port, () => {
  console.log(`[server] Listening on http://0.0.0.0:${port}`);
});
