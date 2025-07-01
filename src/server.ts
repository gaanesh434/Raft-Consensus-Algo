import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { RaftEngine } from './server/raft-engine.js';
import { ChaosEngine } from './server/chaos-engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:4173"],
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client')));

// Initialize engines
const raftEngine = new RaftEngine(io);
const chaosEngine = new ChaosEngine(raftEngine);

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send current state to new client
  socket.emit('nodes-updated', raftEngine.getNodes());
  socket.emit('messages-updated', raftEngine.getMessages());

  // Node management
  socket.on('register-node', (nodeId: string) => {
    raftEngine.registerNode(nodeId);
    console.log(`Node ${nodeId} registered`);
    io.emit('nodes-updated', raftEngine.getNodes());
  });

  socket.on('start-election', ({ candidateId }: { candidateId: string }) => {
    raftEngine.startElection(candidateId);
    io.emit('nodes-updated', raftEngine.getNodes());
  });

  socket.on('add-log-entry', ({ command }: { command: string }) => {
    const success = raftEngine.addLogEntry(command);
    if (!success) {
      socket.emit('error', 'No leader available');
    } else {
      io.emit('nodes-updated', raftEngine.getNodes());
    }
  });

  socket.on('node-failure', ({ nodeId }: { nodeId: string }) => {
    raftEngine.failNode(nodeId);
    console.log(`Node ${nodeId} failed`);
    io.emit('nodes-updated', raftEngine.getNodes());
  });

  socket.on('node-restart', ({ nodeId }: { nodeId: string }) => {
    raftEngine.restartNode(nodeId);
    console.log(`Node ${nodeId} restarted`);
    io.emit('nodes-updated', raftEngine.getNodes());
  });

  socket.on('network-partition', ({ nodeId }: { nodeId: string }) => {
    raftEngine.togglePartition(nodeId);
    console.log(`Network partition toggled for ${nodeId}`);
    io.emit('nodes-updated', raftEngine.getNodes());
  });

  socket.on('set-network-delay', ({ nodeId, delay }: { nodeId: string, delay: number }) => {
    raftEngine.setNetworkDelay(nodeId, delay);
    console.log(`Network delay for ${nodeId} set to ${delay}ms`);
  });

  // Chaos engineering
  socket.on('start-chaos', () => {
    chaosEngine.start();
    console.log('🔥 Chaos mode started');
    socket.emit('chaos-status', { enabled: true });
  });

  socket.on('stop-chaos', () => {
    chaosEngine.stop();
    console.log('🛑 Chaos mode stopped');
    socket.emit('chaos-status', { enabled: false });
  });

  socket.on('update-chaos-config', (config) => {
    chaosEngine.updateConfig(config);
    console.log('Chaos config updated:', config);
  });

  socket.on('get-chaos-config', () => {
    socket.emit('chaos-config', chaosEngine.getConfig());
  });

  // Performance monitoring
  socket.on('get-performance-stats', () => {
    const stats = {
      nodeCount: raftEngine.getNodes().length,
      messageCount: raftEngine.getMessages().length,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    };
    socket.emit('performance-stats', stats);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Main Raft tick loop
setInterval(() => {
  raftEngine.tick();
  io.emit('nodes-updated', raftEngine.getNodes());
  io.emit('messages-updated', raftEngine.getMessages());
}, 1500);

// Performance monitoring
setInterval(() => {
  const stats = {
    nodeCount: raftEngine.getNodes().length,
    messageCount: raftEngine.getMessages().length,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime()
  };
  io.emit('performance-stats', stats);
}, 5000);

// Serve client files in production
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Raft Consensus Server running on port ${PORT}`);
  console.log(`📊 Dashboard available at http://localhost:${PORT}`);
});