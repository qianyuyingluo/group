import os from 'node:os';
import { createServer } from 'vite';

const DEFAULT_PORT = 5173;

const server = await createServer({
  server: {
    host: '0.0.0.0',
    port: DEFAULT_PORT,
    strictPort: false,
  },
});

await server.listen();

const address = server.httpServer.address();
const port = typeof address === 'object' && address ? address.port : DEFAULT_PORT;
const localUrl = `http://localhost:${port}/`;
const networkUrls = getNetworkUrls(port);

console.log('\n晶体点群可视化服务已启动');
console.log(`本机访问: ${localUrl}`);
if (networkUrls.length > 0) {
  console.log('局域网访问:');
  networkUrls.forEach((url) => console.log(`  ${url}`));
  console.log('同一 Wi-Fi / 局域网内的其他设备可使用上面的地址访问。');
} else {
  console.log('未检测到局域网 IPv4 地址。');
}
console.log('按 Ctrl+C 停止服务。\n');

function getNetworkUrls(portNumber) {
  const urls = [];
  const interfaces = os.networkInterfaces();

  Object.values(interfaces).forEach((entries = []) => {
    entries.forEach((entry) => {
      if (entry.family === 'IPv4' && !entry.internal) {
        urls.push(`http://${entry.address}:${portNumber}/`);
      }
    });
  });

  return urls;
}
