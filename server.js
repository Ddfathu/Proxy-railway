const http = require('http');
const setupProxy = require('proxy');

// Railway menyediakan port via environment variable PORT
const port = process.env.PORT || 3000;

// Membuat HTTP server dasar
const server = http.createServer();

// Pasang logic proxy ke server
setupProxy(server);

// (Opsional) Menambahkan Basic Authentication agar aman
const USERNAME = process.env.PROXY_USER || "admin";
const PASSWORD = process.env.PROXY_PASSWORD || "rahasia123";

server.authenticate = function (req, callback) {
  const auth = req.headers['proxy-authorization'];
  if (!auth) {
    return callback(null, false); // Tolak jika tidak ada auth header
  }

  // Decode basic auth
  const parts = auth.split(' ');
  if (parts[0].toLowerCase() !== 'basic') return callback(null, false);
  
  const credentials = Buffer.from(parts[1], 'base64').toString().split(':');
  const user = credentials[0];
  const pass = credentials[1];

  // Validasi cocokkan dengan env variable
  if (user === USERNAME && pass === PASSWORD) {
    callback(null, true);
  } else {
    callback(null, false);
  }
};

// Jalankan server
server.listen(port, () => {
  console.log(`Proxy server is running on port ${port}`);
});
