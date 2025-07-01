import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3001",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    },
    transports: ['websocket'],
    pingTimeout: 60000,
    pingInterval: 25000
});
// Security middleware
app.use(helmet());
app.use(compression());
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3001",
    credentials: true
}));
// Rate limiting
app.use('/api', rateLimiter);
// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
// In-memory storage for demo
let nodes = [];
let messages = [];
let nodeCounter = 0;
// Helper functions
const createNode = (nodeId) => ({
    nodeId,
    state: 'follower',
    term: 0,
    votedFor: null,
    log: [],
    isAlive: true,
    lastHeartbeat: new Date().toISOString(),
    votes: 0,
    commitIndex: -1,
    lastApplied: -1,
    clusterId: 'default',
    position: {
        x: Math.random() * 600 + 100,
        y: Math.random() * 400 + 100
    }
});
const addMessage = (type, from, to, term, data = {}, success = true) => {
    const message = {
        type,
        from,
        to,
        term,
        data,
        timestamp: new Date().toISOString(),
        success
    };
    messages.push(message);
    if (messages.length > 100) {
        messages.shift();
    }
    return message;
};
// API Routes
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        database: 'in-memory',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});
// Cluster routes
app.get('/api/clusters/:clusterId/nodes', (req, res) => {
    try {
        const { clusterId } = req.params;
        const clusterNodes = nodes.filter(n => n.clusterId === clusterId);
        res.json(clusterNodes);
    }
    catch (error) {
        logger.error('Error fetching nodes:', error);
        res.status(500).json({ error: 'Failed to fetch nodes' });
    }
});
app.post('/api/clusters/:clusterId/nodes', (req, res) => {
    try {
        const { clusterId } = req.params;
        const { nodeId, position } = req.body;
        const existingNode = nodes.find(n => n.clusterId === clusterId && n.nodeId === nodeId);
        if (existingNode) {
            return res.status(400).json({ error: 'Node already exists' });
        }
        const node = createNode(nodeId);
        node.clusterId = clusterId;
        if (position) {
            node.position = position;
        }
        nodes.push(node);
        res.status(201).json(node);
    }
    catch (error) {
        logger.error('Error creating node:', error);
        res.status(500).json({ error: 'Failed to create node' });
    }
});
app.get('/api/clusters/:clusterId/messages', (req, res) => {
    try {
        const { clusterId } = req.params;
        const limit = parseInt(req.query.limit) || 100;
        const clusterMessages = messages
            .filter(m => nodes.some(n => n.clusterId === clusterId && (n.nodeId === m.from || n.nodeId === m.to)))
            .slice(-limit);
        res.json(clusterMessages);
    }
    catch (error) {
        logger.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});
// Error handling
app.use(errorHandler);
// Socket.IO event handlers
io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);
    socket.on('join-cluster', (clusterId) => {
        socket.join(clusterId);
        logger.info(`Client ${socket.id} joined cluster ${clusterId}`);
        const clusterNodes = nodes.filter(n => n.clusterId === clusterId);
        const clusterMessages = messages.filter(m => nodes.some(n => n.clusterId === clusterId && (n.nodeId === m.from || n.nodeId === m.to)));
        socket.emit('nodes-updated', clusterNodes);
        socket.emit('messages-updated', clusterMessages);
    });
    socket.on('register-node', (nodeId) => {
        try {
            if (!nodeId) {
                nodeId = `node-${++nodeCounter}`;
            }
            const existingNode = nodes.find(n => n.nodeId === nodeId);
            if (!existingNode) {
                const newNode = createNode(nodeId);
                nodes.push(newNode);
                logger.info(`Node ${nodeId} registered`);
            }
            io.emit('nodes-updated', nodes);
        }
        catch (error) {
            logger.error('Error registering node:', error);
        }
    });
    socket.on('start-election', ({ candidateId }) => {
        try {
            const candidate = nodes.find(n => n.nodeId === candidateId);
            if (candidate && candidate.isAlive) {
                candidate.state = 'candidate';
                candidate.term += 1;
                candidate.votedFor = candidateId;
                candidate.votes = 1;
                nodes.forEach(node => {
                    if (node.nodeId !== candidateId && node.isAlive) {
                        addMessage('vote_request', candidateId, node.nodeId, candidate.term);
                        setTimeout(() => {
                            try {
                                const voteGranted = Math.random() > 0.3;
                                addMessage('vote_response', node.nodeId, candidateId, candidate.term, { granted: voteGranted }, voteGranted);
                                if (voteGranted) {
                                    candidate.votes += 1;
                                }
                                const majority = Math.floor(nodes.filter(n => n.isAlive).length / 2) + 1;
                                if (candidate.votes >= majority && candidate.state === 'candidate') {
                                    candidate.state = 'leader';
                                    nodes.forEach(n => {
                                        if (n.nodeId !== candidateId) {
                                            n.state = 'follower';
                                            n.votes = 0;
                                        }
                                    });
                                    logger.info(`${candidateId} became leader for term ${candidate.term}`);
                                }
                                io.emit('nodes-updated', nodes);
                                io.emit('messages-updated', messages);
                            }
                            catch (error) {
                                logger.error('Error in vote response:', error);
                            }
                        }, Math.random() * 1000 + 500);
                    }
                });
            }
            io.emit('nodes-updated', nodes);
        }
        catch (error) {
            logger.error('Error starting election:', error);
        }
    });
    socket.on('add-log-entry', ({ command }) => {
        try {
            const leader = nodes.find(n => n.state === 'leader' && n.isAlive);
            if (leader) {
                const logEntry = {
                    term: leader.term,
                    index: leader.log.length,
                    command,
                    timestamp: new Date().toISOString(),
                    committed: false
                };
                leader.log.push(logEntry);
                nodes.forEach(node => {
                    if (node.nodeId !== leader.nodeId && node.isAlive) {
                        addMessage('append_entries', leader.nodeId, node.nodeId, leader.term, { entries: [logEntry] });
                        setTimeout(() => {
                            try {
                                const success = Math.random() > 0.1;
                                addMessage('append_entries_response', node.nodeId, leader.nodeId, leader.term, {}, success);
                                if (success) {
                                    node.log.push({ ...logEntry });
                                }
                                io.emit('messages-updated', messages);
                            }
                            catch (error) {
                                logger.error('Error in append entries response:', error);
                            }
                        }, Math.random() * 500 + 200);
                    }
                });
                logger.info(`Log entry added: ${command}`);
            }
            else {
                socket.emit('error', 'No leader available');
            }
            io.emit('nodes-updated', nodes);
        }
        catch (error) {
            logger.error('Error adding log entry:', error);
        }
    });
    socket.on('node-failure', ({ nodeId }) => {
        try {
            const node = nodes.find(n => n.nodeId === nodeId);
            if (node) {
                node.isAlive = false;
                node.state = 'follower';
                node.votedFor = null;
                node.votes = 0;
                logger.info(`Node ${nodeId} failed`);
            }
            io.emit('nodes-updated', nodes);
        }
        catch (error) {
            logger.error('Error failing node:', error);
        }
    });
    socket.on('node-restart', ({ nodeId }) => {
        try {
            const node = nodes.find(n => n.nodeId === nodeId);
            if (node) {
                node.isAlive = true;
                node.state = 'follower';
                node.term = 0;
                node.votedFor = null;
                node.votes = 0;
                node.log = [];
                node.commitIndex = -1;
                node.lastApplied = -1;
                node.lastHeartbeat = new Date().toISOString();
                logger.info(`Node ${nodeId} restarted`);
            }
            io.emit('nodes-updated', nodes);
        }
        catch (error) {
            logger.error('Error restarting node:', error);
        }
    });
    socket.on('network-partition', ({ nodeId }) => {
        try {
            const node = nodes.find(n => n.nodeId === nodeId);
            if (node) {
                node.isPartitioned = !node.isPartitioned;
                logger.info(`Network partition toggled for ${nodeId}`);
            }
            io.emit('nodes-updated', nodes);
        }
        catch (error) {
            logger.error('Error toggling partition:', error);
        }
    });
    socket.on('get-performance-stats', () => {
        try {
            const stats = {
                nodeCount: nodes.length,
                messageCount: messages.length,
                memoryUsage: process.memoryUsage(),
                uptime: process.uptime()
            };
            socket.emit('performance-stats', stats);
        }
        catch (error) {
            logger.error('Error getting performance stats:', error);
        }
    });
    socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
    });
});
// Heartbeat simulation
setInterval(() => {
    try {
        const leaders = nodes.filter(n => n.state === 'leader' && n.isAlive);
        leaders.forEach(leader => {
            nodes.forEach(follower => {
                if (follower.nodeId !== leader.nodeId && follower.isAlive && !follower.isPartitioned) {
                    addMessage('heartbeat', leader.nodeId, follower.nodeId, leader.term);
                }
            });
        });
        if (leaders.length > 0) {
            io.emit('messages-updated', messages);
        }
    }
    catch (error) {
        logger.error('Error in heartbeat interval:', error);
    }
}, 2000);
// Performance stats broadcast
setInterval(() => {
    try {
        const stats = {
            nodeCount: nodes.length,
            messageCount: messages.length,
            memoryUsage: process.memoryUsage(),
            uptime: process.uptime()
        };
        io.emit('performance-stats', stats);
    }
    catch (error) {
        logger.error('Error broadcasting performance stats:', error);
    }
}, 5000);
// Start server
const PORT = process.env.PORT || 3002;
httpServer.listen(PORT, () => {
    logger.info(`🚀 Raft Consensus Server running on port ${PORT}`);
    logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    logger.info(`💾 Database: In-memory storage (MongoDB disabled)`);
    logger.info(`🌐 Running in WebContainer - using in-memory storage`);
});
// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    httpServer.close(() => {
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    httpServer.close(() => {
        process.exit(0);
    });
});
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
