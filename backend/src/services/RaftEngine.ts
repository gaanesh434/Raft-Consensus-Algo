import { RaftNode, IRaftNode, ILogEntry } from '../models/RaftNode.js';
import { NetworkMessage, INetworkMessage } from '../models/NetworkMessage.js';
import { logger } from '../utils/logger.js';
import { Server } from 'socket.io';

export class RaftEngine {
  private io: Server;
  private partitionedNodes = new Set<string>();
  private networkDelay = new Map<string, number>();
  private electionTimeouts = new Map<string, NodeJS.Timeout>();
  
  private readonly HEARTBEAT_INTERVAL = 1500;
  private readonly ELECTION_TIMEOUT_MIN = 3000;
  private readonly ELECTION_TIMEOUT_MAX = 5000;

  constructor(io: Server) {
    this.io = io;
    this.startPeriodicTasks();
  }

  async registerNode(node: IRaftNode): Promise<void> {
    logger.info(`Registering node: ${node.nodeId}`);
    this.resetElectionTimeout(node.nodeId);
    this.io.emit('node-registered', node);
  }

  async startElection(candidateId: string): Promise<void> {
    const candidate = await RaftNode.findOne({ nodeId: candidateId });
    if (!candidate || !candidate.isAlive || this.partitionedNodes.has(candidateId)) {
      return;
    }

    logger.info(`Starting election for candidate: ${candidateId}`);
    
    candidate.state = 'candidate';
    candidate.term += 1;
    candidate.votedFor = candidateId;
    candidate.votes = 1;
    await candidate.save();

    // Reset other nodes' votes for this term
    await RaftNode.updateMany(
      { 
        clusterId: candidate.clusterId,
        nodeId: { $ne: candidateId },
        term: { $lt: candidate.term }
      },
      {
        $set: {
          votedFor: null,
          term: candidate.term,
          state: 'follower'
        }
      }
    );

    // Send vote requests
    const nodes = await RaftNode.find({ 
      clusterId: candidate.clusterId,
      nodeId: { $ne: candidateId },
      isAlive: true
    });

    for (const node of nodes) {
      if (!this.partitionedNodes.has(node.nodeId)) {
        await this.sendVoteRequest(candidateId, node.nodeId, candidate.term);
      }
    }

    this.io.to(candidate.clusterId).emit('nodes-updated');
  }

  private async sendVoteRequest(candidateId: string, voterId: string, term: number): Promise<void> {
    const candidate = await RaftNode.findOne({ nodeId: candidateId });
    if (!candidate) return;

    const message = new NetworkMessage({
      type: 'vote_request',
      from: candidateId,
      to: voterId,
      term: term,
      data: {
        lastLogIndex: candidate.log.length - 1,
        lastLogTerm: candidate.log.length > 0 ? candidate.log[candidate.log.length - 1].term : 0
      },
      clusterId: candidate.clusterId
    });

    await message.save();
    this.io.to(candidate.clusterId).emit('message-sent', message);

    // Simulate network delay
    setTimeout(async () => {
      try {
        await this.handleVoteRequest(candidateId, voterId, term, message.data);
      } catch (error) {
        logger.error(`Error handling vote request: ${error}`);
      }
    }, this.networkDelay.get(voterId) || 100);
  }

  private async handleVoteRequest(candidateId: string, voterId: string, term: number, data: any): Promise<void> {
    const voter = await RaftNode.findOne({ nodeId: voterId });
    const candidate = await RaftNode.findOne({ nodeId: candidateId });
    
    if (!voter || !candidate || !voter.isAlive || this.partitionedNodes.has(voterId)) {
      return;
    }

    let voteGranted = false;
    
    if (term > voter.term && (voter.votedFor === null || voter.votedFor === candidateId)) {
      const voterLastLogIndex = voter.log.length - 1;
      const voterLastLogTerm = voter.log.length > 0 ? voter.log[voterLastLogIndex].term : 0;
      
      if (data.lastLogTerm > voterLastLogTerm || 
          (data.lastLogTerm === voterLastLogTerm && data.lastLogIndex >= voterLastLogIndex)) {
        voteGranted = true;
        voter.votedFor = candidateId;
        voter.term = term;
        await voter.save();
      }
    }

    const responseMessage = new NetworkMessage({
      type: 'vote_response',
      from: voterId,
      to: candidateId,
      term: term,
      data: { granted: voteGranted },
      clusterId: voter.clusterId,
      success: voteGranted
    });

    await responseMessage.save();
    this.io.to(voter.clusterId).emit('message-sent', responseMessage);

    if (voteGranted && candidate.state === 'candidate') {
      candidate.votes += 1;
      await candidate.save();
      
      const majorityCount = await this.getMajorityCount(candidate.clusterId);
      if (candidate.votes >= majorityCount) {
        await this.becomeLeader(candidateId);
      }
    }
  }

  private async becomeLeader(leaderId: string): Promise<void> {
    const leader = await RaftNode.findOne({ nodeId: leaderId });
    if (!leader) return;

    logger.info(`Node ${leaderId} became leader for term ${leader.term}`);
    
    leader.state = 'leader';
    leader.lastHeartbeat = new Date();
    await leader.save();

    // Set other nodes as followers
    await RaftNode.updateMany(
      { 
        clusterId: leader.clusterId,
        nodeId: { $ne: leaderId },
        state: 'candidate'
      },
      {
        $set: {
          state: 'follower',
          votes: 0
        }
      }
    );

    this.clearElectionTimeout(leaderId);
    this.startHeartbeats(leaderId);
    this.io.to(leader.clusterId).emit('leader-elected', { leaderId, term: leader.term });
  }

  async addLogEntry(clusterId: string, command: string): Promise<boolean> {
    const leader = await RaftNode.findOne({ clusterId, state: 'leader', isAlive: true });
    if (!leader) return false;

    const logEntry: ILogEntry = {
      term: leader.term,
      index: leader.log.length,
      command,
      timestamp: new Date(),
      committed: false
    };

    leader.log.push(logEntry);
    await leader.save();

    await this.replicateLog(leader.nodeId);
    return true;
  }

  private async replicateLog(leaderId: string): Promise<void> {
    const leader = await RaftNode.findOne({ nodeId: leaderId });
    if (!leader || leader.state !== 'leader') return;

    const followers = await RaftNode.find({
      clusterId: leader.clusterId,
      nodeId: { $ne: leaderId },
      isAlive: true
    });

    for (const follower of followers) {
      if (!this.partitionedNodes.has(follower.nodeId)) {
        await this.sendAppendEntries(leaderId, follower.nodeId);
      }
    }
  }

  private async sendAppendEntries(leaderId: string, followerId: string): Promise<void> {
    const leader = await RaftNode.findOne({ nodeId: leaderId });
    if (!leader) return;

    const prevLogIndex = leader.log.length - 1;
    const prevLogTerm = prevLogIndex >= 0 ? leader.log[prevLogIndex].term : 0;

    const message = new NetworkMessage({
      type: 'append_entries',
      from: leaderId,
      to: followerId,
      term: leader.term,
      data: {
        prevLogIndex,
        prevLogTerm,
        entries: leader.log.slice(-1), // Send latest entry
        leaderCommit: leader.commitIndex
      },
      clusterId: leader.clusterId
    });

    await message.save();
    this.io.to(leader.clusterId).emit('message-sent', message);
  }

  async failNode(nodeId: string): Promise<void> {
    await RaftNode.findOneAndUpdate(
      { nodeId },
      { 
        isAlive: false,
        state: 'follower',
        votedFor: null,
        votes: 0
      }
    );
    
    this.clearElectionTimeout(nodeId);
    logger.info(`Node ${nodeId} failed`);
  }

  async restartNode(nodeId: string): Promise<void> {
    const node = await RaftNode.findOneAndUpdate(
      { nodeId },
      { 
        isAlive: true,
        state: 'follower',
        term: 0,
        votedFor: null,
        votes: 0,
        log: [],
        commitIndex: -1,
        lastApplied: -1,
        lastHeartbeat: new Date()
      },
      { new: true }
    );

    if (node) {
      this.resetElectionTimeout(nodeId);
      logger.info(`Node ${nodeId} restarted`);
    }
  }

  togglePartition(nodeId: string): void {
    if (this.partitionedNodes.has(nodeId)) {
      this.partitionedNodes.delete(nodeId);
    } else {
      this.partitionedNodes.add(nodeId);
    }
  }

  setNetworkDelay(nodeId: string, delay: number): void {
    this.networkDelay.set(nodeId, delay);
  }

  private async getMajorityCount(clusterId: string): Promise<number> {
    const aliveNodes = await RaftNode.countDocuments({ 
      clusterId, 
      isAlive: true 
    });
    return Math.floor(aliveNodes / 2) + 1;
  }

  private resetElectionTimeout(nodeId: string): void {
    this.clearElectionTimeout(nodeId);
    
    const timeout = this.getRandomTimeout();
    const timeoutId = setTimeout(async () => {
      try {
        const node = await RaftNode.findOne({ nodeId, isAlive: true });
        if (node && node.state === 'follower') {
          await this.startElection(nodeId);
        }
      } catch (error) {
        logger.error(`Error in election timeout for node ${nodeId}: ${error}`);
      }
    }, timeout);
    
    this.electionTimeouts.set(nodeId, timeoutId);
  }

  private clearElectionTimeout(nodeId: string): void {
    const timeoutId = this.electionTimeouts.get(nodeId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.electionTimeouts.delete(nodeId);
    }
  }

  private async startHeartbeats(leaderId: string): Promise<void> {
    const leader = await RaftNode.findOne({ nodeId: leaderId });
    if (!leader || leader.state !== 'leader') return;

    const followers = await RaftNode.find({
      clusterId: leader.clusterId,
      nodeId: { $ne: leaderId },
      isAlive: true
    });

    for (const follower of followers) {
      if (!this.partitionedNodes.has(follower.nodeId)) {
        await this.sendAppendEntries(leaderId, follower.nodeId);
      }
    }
  }

  private startPeriodicTasks(): void {
    // Heartbeat interval
    setInterval(async () => {
      try {
        const leaders = await RaftNode.find({ state: 'leader', isAlive: true });
        for (const leader of leaders) {
          await this.startHeartbeats(leader.nodeId);
        }
      } catch (error) {
        logger.error(`Error in heartbeat interval: ${error}`);
      }
    }, this.HEARTBEAT_INTERVAL);

    // Performance stats
    setInterval(async () => {
      try {
        const stats = {
          nodeCount: await RaftNode.countDocuments({ isAlive: true }),
          messageCount: await NetworkMessage.countDocuments(),
          memoryUsage: process.memoryUsage(),
          uptime: process.uptime()
        };
        this.io.emit('performance-stats', stats);
      } catch (error) {
        logger.error(`Error collecting performance stats: ${error}`);
      }
    }, 5000);
  }

  private getRandomTimeout(): number {
    return Math.floor(Math.random() * (this.ELECTION_TIMEOUT_MAX - this.ELECTION_TIMEOUT_MIN)) + this.ELECTION_TIMEOUT_MIN;
  }
}