import http from 'http';
import { WebSocketServer } from 'ws';

const server = http.createServer();
const wss = new WebSocketServer({ server });

// Track connected peers (no auth)
const peers = new Map();

wss.on('connection', (ws) => {
  const peerId = Math.random().toString(36).substring(2); // Random ID
  peers.set(peerId, ws);

  // Relay messages to other peers
  ws.on('message', (message) => {
    const { targetId, signal } = JSON.parse(message);
    if (peers.has(targetId)) {
      peers.get(targetId).send(JSON.stringify({ senderId: peerId, signal }));
    }
  });

  // Cleanup
  ws.on('close', () => {
    peers.delete(peerId);
  });
});

server.listen(5000, () => {
  console.log('WebSocket server running on ws://localhost:5000');
});