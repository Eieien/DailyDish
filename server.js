// Standalone Node server for this Expo Router project's API routes
// (app/api/*.ts). Unlike EAS Hosting's edge/Workers runtime, this runs under
// plain Node — which supports the raw TCP Postgres connections `postgres-js`
// needs (db/index.ts). Run `bunx expo export -p web` first to (re)generate
// dist/server, then `bun server.js` (or `node server.js`) to serve it.
const http = require('http');
const path = require('path');
const { createRequestHandler } = require('expo-server/adapter/http');

const handler = createRequestHandler({
  build: path.join(__dirname, 'dist/server'),
});

const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  handler(req, res, () => {
    res.statusCode = 404;
    res.end('Not found');
  });
});

server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
