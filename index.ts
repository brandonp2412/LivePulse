import type { Server, ServerWebSocket } from "bun";

const clients: Set<ServerWebSocket<unknown>> = new Set();

const server: Server = Bun.serve({
  port: 3000,
  hostname: "0.0.0.0",
  fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/ws") {
      const success = server.upgrade(req);
      return success
        ? undefined
        : new Response("WebSocket upgrade failed", { status: 400 });
    }

    if (url.pathname === "/") {
      return new Response(Bun.file("./index.html"));
    }

    return new Response("Not Found", { status: 404 });
  },
  websocket: {
    open(ws) {
      clients.add(ws);
      console.log("Client connected");
    },
    message(ws, message) {
      for (const client of clients) {
        if (client !== ws) {
          client.send(message);
        }
      }
    },
    close(ws) {
      clients.delete(ws);
      console.log("Client disconnected");
    },
  },
});

console.log(`⚡ Server running at http://${server.hostname}:${server.port}`);
