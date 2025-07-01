// Web Worker for heavy Raft computations
interface RaftWorkerMessage {
  type: 'CALCULATE_CONSENSUS' | 'SIMULATE_NETWORK' | 'PROCESS_LOGS';
  payload: any;
}

interface RaftWorkerResponse {
  type: string;
  result: any;
}

self.onmessage = function(e: MessageEvent<RaftWorkerMessage>) {
  const { type, payload } = e.data;

  switch (type) {
    case 'CALCULATE_CONSENSUS':
      const consensusResult = calculateConsensus(payload.nodes, payload.messages);
      self.postMessage({ type: 'CONSENSUS_CALCULATED', result: consensusResult });
      break;

    case 'SIMULATE_NETWORK':
      const networkResult = simulateNetworkConditions(payload.nodes, payload.config);
      self.postMessage({ type: 'NETWORK_SIMULATED', result: networkResult });
      break;

    case 'PROCESS_LOGS':
      const logResult = processLogEntries(payload.logs, payload.commitIndex);
      self.postMessage({ type: 'LOGS_PROCESSED', result: logResult });
      break;

    default:
      console.warn('Unknown worker message type:', type);
  }
};

function calculateConsensus(nodes: any[], messages: any[]) {
  // Heavy computation for consensus analysis
  const analysis = {
    leaderCount: nodes.filter(n => n.state === 'leader').length,
    followerCount: nodes.filter(n => n.state === 'follower').length,
    candidateCount: nodes.filter(n => n.state === 'candidate').length,
    networkHealth: calculateNetworkHealth(nodes, messages),
    consensusStrength: calculateConsensusStrength(nodes),
  };

  return analysis;
}

function simulateNetworkConditions(nodes: any[], config: any) {
  // Simulate network partitions, delays, and failures
  const simulation = {
    partitions: generateNetworkPartitions(nodes, config.partitionRate),
    delays: generateNetworkDelays(nodes, config.delayRange),
    failures: generateNodeFailures(nodes, config.failureRate),
  };

  return simulation;
}

function processLogEntries(logs: any[], commitIndex: number) {
  // Process and validate log entries
  const processed = logs.map((log, index) => ({
    ...log,
    isCommitted: index <= commitIndex,
    isConsistent: validateLogConsistency(log, index, logs),
  }));

  return {
    processedLogs: processed,
    consistencyScore: calculateLogConsistency(processed),
  };
}

function calculateNetworkHealth(nodes: any[], messages: any[]): number {
  const totalNodes = nodes.length;
  const aliveNodes = nodes.filter(n => n.isAlive).length;
  const recentMessages = messages.filter(m => 
    Date.now() - new Date(m.timestamp).getTime() < 10000
  );
  
  const successRate = recentMessages.length > 0 
    ? recentMessages.filter(m => m.success !== false).length / recentMessages.length 
    : 1;

  return (aliveNodes / totalNodes) * successRate;
}

function calculateConsensusStrength(nodes: any[]): number {
  const aliveNodes = nodes.filter(n => n.isAlive);
  const leaders = aliveNodes.filter(n => n.state === 'leader');
  
  if (leaders.length === 1) {
    const leader = leaders[0];
    const followers = aliveNodes.filter(n => n.state === 'follower');
    const majoritySize = Math.floor(aliveNodes.length / 2) + 1;
    
    return followers.length >= majoritySize - 1 ? 1 : 0.5;
  }
  
  return leaders.length === 0 ? 0.3 : 0.1; // No leader or split brain
}

function generateNetworkPartitions(nodes: any[], partitionRate: number) {
  return nodes
    .filter(() => Math.random() < partitionRate)
    .map(node => ({
      nodeId: node.nodeId,
      partitionedFrom: nodes
        .filter(n => n.nodeId !== node.nodeId && Math.random() < 0.5)
        .map(n => n.nodeId),
    }));
}

function generateNetworkDelays(nodes: any[], delayRange: [number, number]) {
  return nodes.map(node => ({
    nodeId: node.nodeId,
    delay: Math.random() * (delayRange[1] - delayRange[0]) + delayRange[0],
  }));
}

function generateNodeFailures(nodes: any[], failureRate: number) {
  return nodes
    .filter(() => Math.random() < failureRate)
    .map(node => ({
      nodeId: node.nodeId,
      failureType: Math.random() < 0.5 ? 'crash' : 'partition',
      duration: Math.random() * 10000 + 5000, // 5-15 seconds
    }));
}

function validateLogConsistency(log: any, index: number, logs: any[]): boolean {
  if (index === 0) return true;
  
  const prevLog = logs[index - 1];
  return log.term >= prevLog.term && log.index === prevLog.index + 1;
}

function calculateLogConsistency(logs: any[]): number {
  if (logs.length === 0) return 1;
  
  const consistentLogs = logs.filter(log => log.isConsistent).length;
  return consistentLogs / logs.length;
}

export {};