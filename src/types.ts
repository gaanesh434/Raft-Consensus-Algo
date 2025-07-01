export interface Node {
  nodeId: string;
  state: 'follower' | 'candidate' | 'leader';
  term: number;
  isAlive: boolean;
  position: { x: number; y: number };
  votes: number;
  log: LogEntry[];
  commitIndex: number;
  lastApplied: number;
  votedFor: string | null;
  lastHeartbeat: string;
  isPartitioned?: boolean;
}

export interface LogEntry {
  term: number;
  index: number;
  command: string;
  timestamp: string;
  committed: boolean;
}

export interface Message {
  type: string;
  from: string;
  to: string;
  term: number;
  timestamp: string;
  success?: boolean;
  data?: any;
  message?: string;
}

export interface AppState {
  nodes: Node[];
  messages: Message[];
  connected: boolean;
  socket: any;
  selectedNode: string | null;
  error: string | null;
  isLoading: boolean;
  performanceStats: any;
  chaosMode: boolean;
  currentPage: string;
  showHelp: boolean;
  theme: 'light' | 'dark';
  language: 'en' | 'es' | 'fr';
  notifications: boolean;
  autoSave: boolean;
}

export interface Handlers {
  handleNodeSelect: (nodeId: string | null) => void;
  handleAddSampleNodes: () => void;
  handleStartElection: () => void;
  handleAddLogEntry: (command: string) => void;
  handleNodeAction: (nodeId: string, action: string) => void;
  handleToggleChaos: () => void;
}
