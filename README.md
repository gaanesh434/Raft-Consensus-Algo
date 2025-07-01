# 🔗 Raft Consensus Algorithm Simulator

A comprehensive, interactive visualization of the Raft consensus algorithm with beautiful UI, enhanced logic, and educational features.

## 🌟 Features

### 🎯 Core Raft Implementation
- ✅ **Leader Election** with proper voting logic and majority consensus
- ✅ **Log Replication** with consistency guarantees and commit rules
- ✅ **Safety Properties** (Election Safety, Leader Append-Only, Log Matching)
- ✅ **Fault Tolerance** with automatic leader failover
- ✅ **Network Partitions** and split-brain scenario handling

### 🎨 Beautiful Visualization
- ✅ **Animated Nodes** with state-specific colors and icons
- ✅ **Real-time Message Flow** with animated arrows and effects
- ✅ **Interactive Elements** with hover effects and smooth transitions
- ✅ **Responsive Design** that works on all screen sizes
- ✅ **Glassmorphism UI** with backdrop blur and modern aesthetics

### 🔥 Advanced Features
- ✅ **Chaos Engineering** with configurable failure injection
- ✅ **Performance Monitoring** with real-time metrics
- ✅ **Interactive Help System** with step-by-step tutorials
- ✅ **Component Tooltips** explaining each feature
- ✅ **Multiple View Modes** (Network, Timeline, 3D - coming soon)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Modern web browser with ES6+ support

### Installation & Setup

```bash
# Clone the repository
git clone <repository-url>
cd raft-consensus-simulator

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

## 📚 How to Use

### 🎮 Getting Started
1. **Launch the app** - The simulator starts with 3 pre-configured nodes
2. **Explore the interface** - Click the "📚 How to Use" button for guided tutorials
3. **Interact with nodes** - Click on any node to see detailed information
4. **Watch consensus** - Observe real-time message passing and state changes

### 🔗 Understanding Node States

| State | Icon | Color | Description |
|-------|------|-------|-------------|
| **Leader** | 👑 | Green | Handles client requests and replicates logs |
| **Candidate** | 🗳️ | Yellow | Requesting votes during election |
| **Follower** | 👤 | Blue | Responds to leader and candidate requests |
| **Failed** | 💥 | Red | Node is offline or unreachable |

### ⚡ Core Operations

#### 🗳️ Leader Election
- Triggered when leader fails or times out
- Candidates request votes from other nodes
- Node with majority votes becomes new leader
- **Try it:** Click "Start Election" to trigger manually

#### 📝 Log Replication
- Leader receives client commands
- Replicates entries to follower nodes
- Commits when majority acknowledges
- **Try it:** Add log entries like "SET x=1"

#### 💓 Heartbeats
- Leaders send periodic heartbeats
- Maintains leadership authority
- Prevents unnecessary elections
- **Watch:** Green pulse animation on leader

### 🎛️ Interactive Controls

#### ➕ Node Management
- **Add Nodes:** Create new cluster members
- **Custom IDs:** Specify unique node identifiers
- **Auto-positioning:** Nodes placed automatically in visualization

#### 🔧 Node Actions
- **Fail Node:** Simulate server crashes
- **Restart Node:** Bring failed nodes back online
- **Network Partition:** Isolate nodes from cluster
- **Real-time Updates:** See immediate effects on consensus

#### 🔥 Chaos Engineering
- **Random Failures:** Automated fault injection
- **Configurable Rates:** Adjust failure probabilities
- **Resilience Testing:** Verify cluster stability
- **Recovery Simulation:** Automatic node recovery

## 🏗️ Architecture

### 📁 Project Structure
```
src/
├── components/           # Reusable UI components
│   ├── RaftVisualization.tsx    # Main cluster visualization
│   ├── EnhancedControlPanel.tsx # Interactive controls
│   ├── HowToUse.tsx            # Tutorial system
│   ├── ComponentTooltip.tsx    # Help tooltips
│   └── ...
├── pages/               # Application pages
│   ├── Dashboard.tsx    # Main dashboard
│   ├── VisualizationPage.tsx   # Advanced visualization
│   └── ...
└── App.tsx             # Main application logic
```

### 🧠 Core Logic

#### Consensus Algorithm
```typescript
// Leader Election Validation
const validateElection = (candidateId: string, nodes: Node[]) => {
  const aliveNodes = nodes.filter(n => n.isAlive && !n.isPartitioned);
  const majorityThreshold = Math.floor(aliveNodes.length / 2) + 1;
  return candidate.votes >= majorityThreshold;
};

// Log Replication
const replicateLogEntry = (leaderId: string, entry: LogEntry, nodes: Node[]) => {
  // Replicate to followers with 90% success rate
  // Commit when majority acknowledges
};
```

#### State Management
- **React Hooks** for local state management
- **Immutable Updates** for predictable state changes
- **Event-driven Architecture** for real-time updates

## 🎨 Design System

### 🌈 Color Palette
- **Primary:** Purple gradients for UI elements
- **Success:** Green for healthy states and leaders
- **Warning:** Yellow/Orange for candidates and partitions
- **Error:** Red for failures and critical states
- **Neutral:** Gray tones for secondary information

### ✨ Animations
- **Framer Motion** for smooth transitions
- **CSS Animations** for continuous effects
- **SVG Animations** for message flows
- **Micro-interactions** for enhanced UX

### 🎯 Accessibility
- **High Contrast** colors for visibility
- **Keyboard Navigation** support
- **Screen Reader** friendly markup
- **Responsive Design** for all devices

## 🔧 Configuration

### 🎛️ Raft Parameters
```typescript
const RAFT_CONFIG = {
  HEARTBEAT_INTERVAL: 3000,      // ms
  ELECTION_TIMEOUT_MIN: 5000,    // ms
  ELECTION_TIMEOUT_MAX: 8000,    // ms
  REPLICATION_SUCCESS_RATE: 0.9  // 90%
};
```

### 🔥 Chaos Engineering
```typescript
const CHAOS_CONFIG = {
  nodeFailureRate: 0.15,         // 15% chance
  networkPartitionRate: 0.1,     // 10% chance
  recoveryRate: 0.3,             // 30% chance
  chaosInterval: 5000            // 5 seconds
};
```

## 🎓 Educational Value

### 📖 Learning Objectives
- **Distributed Consensus** fundamentals
- **Fault Tolerance** in distributed systems
- **Network Partitions** and CAP theorem
- **Leader Election** algorithms
- **Log Replication** and consistency

### 🎯 Use Cases
- **Computer Science Education** - Visualize complex algorithms
- **System Design Interviews** - Demonstrate understanding
- **Research & Development** - Test consensus scenarios
- **Team Training** - Interactive learning sessions

## 🚀 Advanced Features

### 📊 Performance Monitoring
- **Real-time Metrics** - Node count, message throughput
- **Memory Usage** - Heap utilization and garbage collection
- **Network Health** - Connection status and latency
- **Historical Data** - Performance trends over time

### 🔍 Debugging Tools
- **Message Inspector** - Detailed protocol analysis
- **State Viewer** - Complete node state examination
- **Log Browser** - Entry-by-entry log inspection
- **Timeline Replay** - Step through consensus events

### 🌐 Multi-View Support
- **Network View** - Interactive node graph (current)
- **Timeline View** - Historical event progression (coming soon)
- **3D View** - Spatial cluster representation (coming soon)
- **Split View** - Multiple perspectives simultaneously

## 🤝 Contributing

### 🛠️ Development Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests (when available)
npm test

# Build for production
npm run build
```

### 📝 Code Style
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for formatting
- **Conventional Commits** for git history

### 🐛 Bug Reports
Please include:
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS information
- Console error messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Raft Paper** by Diego Ongaro and John Ousterhout
- **Framer Motion** for beautiful animations
- **Tailwind CSS** for utility-first styling
- **React** ecosystem for component architecture

## 📞 Support

- 🐛 **Issues:** [GitHub Issues](https://github.com/yourusername/raft-simulator/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/yourusername/raft-simulator/discussions)
- 📧 **Email:** your.email@example.com

---

**⭐ Star this repository if you found it helpful for learning distributed systems!**

## 🔗 Quick Links

- **Live Demo:** [Coming Soon]
- **Documentation:** [GitHub Wiki](https://github.com/yourusername/raft-simulator/wiki)
- **Tutorial Videos:** [Coming Soon]
- **Blog Post:** [Coming Soon]