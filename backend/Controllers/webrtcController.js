import { WebSocketServer } from 'ws';
import { verifyToken } from '../utils/auth.js'; // Reuse your JWT logic

// Map to track connected clients (PC or Pi)
const clients = new Map();

export const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws, request) => {
  // Extract JWT from cookies/headers (reuse your auth logic)
  const token = request.headers.cookie?.split('token=')[1]?.split(';')[0];
  
  // Verify token (reuse your existing auth middleware)
  const userId = verifyToken(token);
  if (!userId) {
    ws.close(1008, 'Unauthorized');
    return;
  }

  // Store the WebSocket connection by userId
  clients.set(userId, ws);

  // Relay messages between PC and Pi
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    
    // Broadcast to other clients (e.g., PC → Pi or vice versa)
    clients.forEach((client, id) => {
      if (id !== userId && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  });

  // Clean up on disconnect
  ws.on('close', () => {
    clients.delete(userId);
  });
});