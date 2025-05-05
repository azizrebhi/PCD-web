import { useEffect, useRef } from 'react';
import SimplePeer from 'simple-peer';

export default function ScreenSender({ onClose }) {
  const peerRef = useRef();

  useEffect(() => {
    const ws = new WebSocket('ws://YOUR_PC_IP:5000'); // Replace with your PC's local IP

    navigator.mediaDevices.getDisplayMedia({ video: true })
      .then(stream => {
        const peer = new SimplePeer({ initiator: true, stream });

        peer.on('signal', data => {
          ws.send(JSON.stringify({ 
            target: 'pi-viewer', // Hardcoded target for Pi
            signal: data 
          }));
        });

        ws.onmessage = (event) => {
          const { signal } = JSON.parse(event.data);
          peer.signal(signal);
        };

        peerRef.current = peer;
      });

    return () => {
      if (peerRef.current) peerRef.current.destroy();
      ws.close();
    };
  }, []);

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <button 
        onClick={onClose}
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
      >
        Stop Sharing
      </button>
    </div>
  );
}