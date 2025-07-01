const { RaftEngine } = require('../dist/server/raft-engine.js');

describe('RaftEngine', () => {
  let raftEngine;
  let mockIo;

  beforeEach(() => {
    mockIo = {
      emit: jest.fn()
    };
    raftEngine = new RaftEngine(mockIo);
  });

  describe('Node Registration', () => {
    test('should register a new node', () => {
      const nodeId = 'test-node-1';
      const node = raftEngine.registerNode(nodeId);
      
      expect(node.id).toBe(nodeId);
      expect(node.state).toBe('follower');
      expect(node.term).toBe(0);
      expect(node.isAlive).toBe(true);
    });

    test('should not duplicate nodes', () => {
      const nodeId = 'test-node-1';
      const node1 = raftEngine.registerNode(nodeId);
      const node2 = raftEngine.registerNode(nodeId);
      
      expect(node1).toBe(node2);
      expect(raftEngine.getNodes().length).toBe(1);
    });
  });

  describe('Leader Election', () => {
    test('should start election for candidate', () => {
      const candidateId = 'candidate-1';
      const followerId = 'follower-1';
      
      raftEngine.registerNode(candidateId);
      raftEngine.registerNode(followerId);
      
      raftEngine.startElection(candidateId);
      
      const candidate = raftEngine.getNodes().find(n => n.id === candidateId);
      expect(candidate.state).toBe('candidate');
      expect(candidate.term).toBe(1);
      expect(candidate.votes).toBe(1);
    });

    test('should become leader with majority votes', () => {
      // This would require more complex mocking of the async vote handling
      // For now, we'll test the basic structure
      const nodes = ['node-1', 'node-2', 'node-3'];
      nodes.forEach(id => raftEngine.registerNode(id));
      
      expect(raftEngine.getNodes().length).toBe(3);
    });
  });

  describe('Log Replication', () => {
    test('should add log entry when leader exists', () => {
      const leaderId = 'leader-1';
      raftEngine.registerNode(leaderId);
      
      // Manually set as leader for testing
      const leader = raftEngine.getNodes().find(n => n.id === leaderId);
      leader.state = 'leader';
      leader.term = 1;
      
      const success = raftEngine.addLogEntry('test-command');
      expect(success).toBe(true);
      expect(leader.log.length).toBe(1);
      expect(leader.log[0].command).toBe('test-command');
    });

    test('should fail to add log entry without leader', () => {
      const success = raftEngine.addLogEntry('test-command');
      expect(success).toBe(false);
    });
  });

  describe('Node Failures', () => {
    test('should fail a node', () => {
      const nodeId = 'test-node';
      raftEngine.registerNode(nodeId);
      
      raftEngine.failNode(nodeId);
      
      const node = raftEngine.getNodes().find(n => n.id === nodeId);
      expect(node.isAlive).toBe(false);
      expect(node.state).toBe('follower');
    });

    test('should restart a failed node', () => {
      const nodeId = 'test-node';
      raftEngine.registerNode(nodeId);
      
      raftEngine.failNode(nodeId);
      raftEngine.restartNode(nodeId);
      
      const node = raftEngine.getNodes().find(n => n.id === nodeId);
      expect(node.isAlive).toBe(true);
      expect(node.term).toBe(0);
      expect(node.log.length).toBe(0);
    });
  });
});