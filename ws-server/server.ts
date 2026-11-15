import { WebSocketServer, WebSocket } from "ws";

// Set the port for our WebSocket server (default to 3001)
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

// Create the WebSocket server instance
const wss = new WebSocketServer({ port: PORT });

console.log(`===========================================`);
console.log(`🚀 WebSocket server is running on port ${PORT}`);
console.log(`===========================================`);

// Listen for new client connections (e.g. from the browser)
wss.on("connection", (ws: WebSocket) => {
  console.log("🟢 A user connected to the board!");

  // Listen for messages sent by this client
  ws.on("message", (rawMessage: Buffer | string) => {
    try {
      // Convert raw message to string and parse as JSON
      const messageString = rawMessage.toString();
      const data = JSON.parse(messageString);

      console.log(`📩 Received action: ${data.action}`);

      // Broadcast this message to every OTHER connected user
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(messageString);
        }
      });
    } catch (error) {
      console.error("❌ Failed to parse or broadcast message:", error);
    }
  });

  // When this user disconnects (e.g. closes browser tab)
  ws.on("close", () => {
    console.log("🔴 A user disconnected from the board.");
  });

  // Handle any unexpected connection errors
  ws.on("error", (err) => {
    console.error("⚠️ WebSocket error:", err);
  });
});
