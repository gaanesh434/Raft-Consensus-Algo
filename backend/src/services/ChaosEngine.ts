import { RaftEngine } from './RaftEngine.js';
import { logger } from '../utils/logger.js';

export interface ChaosConfig {
  failureRate: number;
  networkDelayRange: [number, number];
  partitionProbability: number;
  recoveryTime: number;
}

export class ChaosEngine {
  private raftEngine: RaftEngine;
  private chaosIntervals: Map<string, NodeJS.Timeout> = new Map();
  private defaultConfig: ChaosConfig = {
    failureRate: 0.1,
    networkDelayRange: [100, 1000],
    partitionProbability: 0.05,
    recoveryTime: 5000
  };
  private configs: Map<string, ChaosConfig> = new Map();

  constructor(raftEngine: RaftEngine) {
    this.raftEngine = raftEngine;
  }

  start(clusterId: string): void {
    if (this.chaosIntervals.has(clusterId)) {
      logger.warn(`Chaos engineering already running for cluster ${clusterId}`);
      return;
    }

    const config = this.configs.get(clusterId) || this.defaultConfig;
    
    const interval = setInterval(() => {
      this.executeRandomChaos(clusterId, config);
    }, 2000); // Execute chaos every 2 seconds

    this.chaosIntervals.set(clusterId, interval);
    logger.info(`Chaos engineering started for cluster ${clusterId}`);
  }

  stop(clusterId: string): void {
    const interval = this.chaosIntervals.get(clusterId);
    if (interval) {
      clearInterval(interval);
      this.chaosIntervals.delete(clusterId);
      logger.info(`Chaos engineering stopped for cluster ${clusterId}`);
    }
  }

  updateConfig(clusterId: string, config: Partial<ChaosConfig>): void {
    const currentConfig = this.configs.get(clusterId) || this.defaultConfig;
    const newConfig = { ...currentConfig, ...config };
    this.configs.set(clusterId, newConfig);
    logger.info(`Chaos config updated for cluster ${clusterId}:`, newConfig);
  }

  private executeRandomChaos(clusterId: string, config: ChaosConfig): void {
    const random = Math.random();

    if (random < config.failureRate) {
      this.simulateNodeFailure(clusterId);
    } else if (random < config.failureRate + config.partitionProbability) {
      this.simulateNetworkPartition(clusterId);
    } else if (random < config.failureRate + config.partitionProbability + 0.1) {
      this.simulateNetworkDelay(clusterId, config);
    }
  }

  private simulateNodeFailure(clusterId: string): void {
    // This would interact with the RaftEngine to fail a random node
    logger.info(`Simulating node failure in cluster ${clusterId}`);
    // Implementation would depend on RaftEngine methods
  }

  private simulateNetworkPartition(clusterId: string): void {
    // This would interact with the RaftEngine to create network partitions
    logger.info(`Simulating network partition in cluster ${clusterId}`);
    // Implementation would depend on RaftEngine methods
  }

  private simulateNetworkDelay(clusterId: string, config: ChaosConfig): void {
    const [min, max] = config.networkDelayRange;
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    logger.info(`Simulating network delay of ${delay}ms in cluster ${clusterId}`);
    // Implementation would depend on RaftEngine methods
  }

  isRunning(clusterId: string): boolean {
    return this.chaosIntervals.has(clusterId);
  }

  getConfig(clusterId: string): ChaosConfig {
    return this.configs.get(clusterId) || this.defaultConfig;
  }
}