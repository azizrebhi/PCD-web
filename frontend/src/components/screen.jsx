import { useEffect, useRef, useState } from 'react';
import SimplePeer from 'simple-peer';
import { Buffer } from 'buffer/';
import process from 'process';

// Polyfills for compatibility
window.Buffer = Buffer;
window.process = process;

function Screen() {
  const videoRef = useRef(null);
  const [peer, setPeer] = useState(null);
  const [ws, setWs] = useState(null);
  const [isSocketOpen, setIsSocketOpen] = useState(false);

  // Create WebSocket connection once on mount
  useEffect(() => {
    const socket = new WebSocket('ws://192.168.1.105:3001'); // Replace with your server IP

    socket.onopen = () => {
      console.log('WebSocket connected');
      setIsSocketOpen(true);
    };

    socket.onclose = () => {
      console.warn('WebSocket closed');
      setIsSocketOpen(false);
    };

    socket.onerror = (err) => {
      console.error('WebSocket error:', err);
      setIsSocketOpen(false);
    };

    setWs(socket);

    return () => {
      socket.close(); // cleanup
    };
  }, []);

  // Safe WebSocket send
  const safeSend = (data) => {
    if (ws && isSocketOpen && ws.readyState === WebSocket.OPEN) {
      try {
        // Ensure data is a valid JSON object
        const jsonData = JSON.stringify(data);

        // Debugging: log the JSON string to make sure it's correct
        console.log('Sending signal:', jsonData); 

        ws.send(jsonData);
      } catch (error) {
        console.error('Error sending data:', error);
      }
    } else {
      console.warn('WebSocket is not ready. Cannot send:', data);
    }
  };

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (!ws) return;

    ws.onmessage = async (message) => {
      try {
        console.log('Received message:', message.data); // Debugging line to inspect raw data

        // Check if message is a Blob and convert it to text
        const messageData = message.data instanceof Blob
          ? await message.data.text()
          : message.data;

        // Try to parse the JSON from the message
        const signal = JSON.parse(messageData);

        if (peer) {
          peer.signal(signal);
        } else {
          const newPeer = new SimplePeer({ initiator: false, trickle: false });

          newPeer.on('signal', (data) => safeSend(data));
          newPeer.on('stream', (stream) => {
            videoRef.current.srcObject = stream;
          });

          newPeer.signal(signal);
          setPeer(newPeer);
        }
      } catch (error) {
        console.error('Error parsing message data:', error);
      }
    };
  }, [ws, peer]);

  // Start screen sharing
  const startSharing = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const newPeer = new SimplePeer({ initiator: true, trickle: false, stream });

      newPeer.on('signal', (data) => safeSend(data));
      setPeer(newPeer);
    } catch (err) {
      console.error('Error accessing display media:', err);
    }
  };

  return (
    <div>
      <button onClick={startSharing}>Share Screen</button>
<video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100vh', objectFit: 'cover' }} />
    </div>
  );
}

export default Screen;
