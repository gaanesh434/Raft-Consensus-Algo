const { ChaosEngine } = require('../dist/server/chaos-engine.js');

describe('ChaosEngine', () => {
  let chaosEngine;
  let mockRaftEngine;

  beforeEach(() => {
    mockRaftEngine = {
      getNodes: jest.fn(() => [
        { id: 'node-1', isAlive: true },
        { id: 'node-2', isAlive: true },
        { id: 'node-3', isAlive: false }
      ]),
      failNode: jest.fn(),
      restartNode: jest.fn(),
      togglePartition: jest.fn(),
      setNetworkDelay: jest.fn()
    };
    
    chaosEngine = new ChaosEngine(mockRaftEngine);
  });

  test('should start chaos mode', () => {
    chaosEngine.start();
    const config = chaosEngine.getConfig();
    expect(config.enabled).toBe(true);
  });

  test('should stop chaos mode', () => {
    chaosEngine.start();
    chaosEngine.stop();
    const config = chaosEngine.getConfig();
    expect(config.enabled).toBe(false);
  });

  test('should update configuration', () => {
    const newConfig = {
      nodeFailureRate: 0.5,
      recoveryRate: 0.8
    };
    
    chaosEngine.updateConfig(newConfig);
    const config = chaosEngine.getConfig();
    
    expect(config.nodeFailureRate).toBe(0.5);
    expect(config.recoveryRate).toBe(0.8);
  });
});