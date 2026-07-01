const http = require('http');
const setupProxy = require('proxy');

// Railway menyediakan port via environment variable PORT
const port = process.env.PORT || 3000;

// Membuat HTTP server dasar
const server = http.createServer();

// Pasang logic proxy ke server (Open Proxy / Tanpa Password)
setupProxy(server);

// Jalankan server
server.listen(port, () => {
  console.log(`Proxy server running tanpa password di port ${port}`);
});
