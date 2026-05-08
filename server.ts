import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Simulated Real-time Traffic Data
  // This would normally read from /proc/net/dev on a real Linux system
  app.get("/api/network/traffic", (req, res) => {
    const data = {
      timestamp: Date.now(),
      wan: {
        rx: Math.floor(Math.random() * 5000) + 1000,
        tx: Math.floor(Math.random() * 2000) + 500,
      },
      lan: {
        rx: Math.floor(Math.random() * 3000) + 500,
        tx: Math.floor(Math.random() * 4000) + 1000,
      }
    };
    res.json(data);
  });

  // API Route: Simulated Interface List (reflecting common linux names)
  app.get("/api/network/interfaces", (req, res) => {
    res.json([
      { id: "eth0", name: "wan", type: "ethernet", status: "up", ipv4: "203.0.113.45", mac: "00:0c:29:ab:cd:ef" },
      { id: "eth1", name: "lan", type: "ethernet", status: "up", ipv4: "192.168.1.1", mac: "00:0c:29:ab:cd:f0" },
      { id: "wlan0", name: "wifi", type: "wifi", status: "up", ipv4: "192.168.2.1", mac: "00:0c:29:ab:cd:f1" },
    ]);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NexusOS Server running on http://localhost:${PORT}`);
  });
}

startServer();
