import { Request, Response } from 'express';
import { RaftNode } from '../models/RaftNode.js';
import { NetworkMessage } from '../models/NetworkMessage.js';
import { RaftEngine } from '../services/RaftEngine.js';
import { logger } from '../utils/logger.js';

export class RaftController {
  private raftEngine: RaftEngine;

  constructor(raftEngine: RaftEngine) {
    this.raftEngine = raftEngine;
  }

  // Get all nodes in a cluster
  getNodes = async (req: Request, res: Response) => {
    try {
      const { clusterId } = req.params;
      const nodes = await RaftNode.find({ clusterId }).sort({ nodeId: 1 });
      res.json(nodes);
    } catch (error) {
      logger.error('Error fetching nodes:', error);
      res.status(500).json({ error: 'Failed to fetch nodes' });
    }
  };

  // Create a new node
  createNode = async (req: Request, res: Response) => {
    try {
      const { clusterId } = req.params;
      const { nodeId, position } = req.body;

      const existingNode = await RaftNode.findOne({ clusterId, nodeId });
      if (existingNode) {
        return res.status(400).json({ error: 'Node already exists' });
      }

      const node = new RaftNode({
        nodeId,
        clusterId,
        position: position || { x: Math.random() * 800, y: Math.random() * 600 }
      });

      await node.save();
      this.raftEngine.registerNode(node);
      
      res.status(201).json(node);
    } catch (error) {
      logger.error('Error creating node:', error);
      res.status(500).json({ error: 'Failed to create node' });
    }
  };

  // Update node position (for drag and drop)
  updateNodePosition = async (req: Request, res: Response) => {
    try {
      const { clusterId, nodeId } = req.params;
      const { x, y } = req.body;

      const node = await RaftNode.findOneAndUpdate(
        { clusterId, nodeId },
        { position: { x, y } },
        { new: true }
      );

      if (!node) {
        return res.status(404).json({ error: 'Node not found' });
      }

      res.json(node);
    } catch (error) {
      logger.error('Error updating node position:', error);
      res.status(500).json({ error: 'Failed to update node position' });
    }
  };

  // Get network messages
  getMessages = async (req: Request, res: Response) => {
    try {
      const { clusterId } = req.params;
      const limit = parseInt(req.query.limit as string) || 100;
      
      const messages = await NetworkMessage
        .find({ clusterId })
        .sort({ timestamp: -1 })
        .limit(limit);
      
      res.json(messages.reverse());
    } catch (error) {
      logger.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  };

  // Start election
  startElection = async (req: Request, res: Response) => {
    try {
      const { clusterId, nodeId } = req.params;
      
      const node = await RaftNode.findOne({ clusterId, nodeId });
      if (!node) {
        return res.status(404).json({ error: 'Node not found' });
      }

      await this.raftEngine.startElection(nodeId);
      res.json({ message: 'Election started', nodeId });
    } catch (error) {
      logger.error('Error starting election:', error);
      res.status(500).json({ error: 'Failed to start election' });
    }
  };

  // Add log entry
  addLogEntry = async (req: Request, res: Response) => {
    try {
      const { clusterId } = req.params;
      const { command } = req.body;

      const success = await this.raftEngine.addLogEntry(clusterId, command);
      
      if (!success) {
        return res.status(400).json({ error: 'No leader available' });
      }

      res.json({ message: 'Log entry added', command });
    } catch (error) {
      logger.error('Error adding log entry:', error);
      res.status(500).json({ error: 'Failed to add log entry' });
    }
  };

  // Simulate node failure
  failNode = async (req: Request, res: Response) => {
    try {
      const { clusterId, nodeId } = req.params;
      
      await this.raftEngine.failNode(nodeId);
      res.json({ message: 'Node failed', nodeId });
    } catch (error) {
      logger.error('Error failing node:', error);
      res.status(500).json({ error: 'Failed to fail node' });
    }
  };

  // Restart node
  restartNode = async (req: Request, res: Response) => {
    try {
      const { clusterId, nodeId } = req.params;
      
      await this.raftEngine.restartNode(nodeId);
      res.json({ message: 'Node restarted', nodeId });
    } catch (error) {
      logger.error('Error restarting node:', error);
      res.status(500).json({ error: 'Failed to restart node' });
    }
  };
}