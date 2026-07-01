const net = require('net');

const port = process.env.PORT || 3000;

const server = net.createServer((clientSocket) => {
  clientSocket.once('data', (data) => {
    const dataStr = data.toString();
    const isConnect = dataStr.startsWith('CONNECT');
    
    let host = '';
    let portTarget = 80;

    if (isConnect) {
      // Ambil host dan port dari baris "CONNECT google.com:443 HTTP/1.1"
      const line = dataStr.split('\r\n')[0];
      const parts = line.split(' ')[1];
      const hostParts = parts.split(':');
      host = hostParts[0];
      portTarget = parseInt(hostParts[1], 10) || 443;
    } else {
      // Request HTTP biasa (GET/POST)
      const hostMatch = dataStr.match(/Host:\s*([^\r\n]+)/i);
      if (!hostMatch) {
        clientSocket.end();
        return;
      }
      const hostParts = hostMatch[1].split(':');
      host = hostParts[0];
      portTarget = parseInt(hostParts[1], 10) || 80;
    }

    // Hubungkan langsung ke web target via TCP murni
    const targetSocket = net.connect(portTarget, host, () => {
      if (isConnect) {
        // Balas ke aplikasi VPN bahwa tunnel siap
        clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
      } else {
        // Kirim data awal jika HTTP biasa
        targetSocket.write(data);
      }
      
      // Pipa data dua arah secara murni (Passthrough)
      clientSocket.pipe(targetSocket);
      targetSocket.pipe(clientSocket);
    });

    targetSocket.on('error', () => clientSocket.end());
    clientSocket.on('error', () => targetSocket.end());
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`TCP HTTP Proxy running on port ${port}`);
});
