import React from 'react';
import { Box, Typography, Paper, Button, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Switch, Alert } from '@mui/material';
import { AppState, Handlers, Node } from '../types';

interface ChaosActions {
    value: string;
    label: string;
}

const ChaosPage: React.FC<{ state: AppState; handlers: Handlers }> = ({ state, handlers }) => {
    const [chaosLevel, setChaosLevel] = React.useState(50);
    const [autoChaos, setAutoChaos] = React.useState(false);
    const [chaosInterval, setChaosInterval] = React.useState(5000);
    const [selectedAction, setSelectedAction] = React.useState('fail');

    const chaosActions = [
        { value: 'fail', label: 'Node Failure' },
        { value: 'partition', label: 'Network Partition' },
        { value: 'restart', label: 'Node Restart' },
        { value: 'remove', label: 'Remove Node' }
    ];

    React.useEffect(() => {
        if (autoChaos) {
            const interval = setInterval(() => {
                if (!state.chaosMode) {
                    clearInterval(interval);
                    return;
                }

                const randomNode = state.nodes[Math.floor(Math.random() * state.nodes.length)];
                handlers.handleNodeAction(randomNode.nodeId, 'fail');

                // Reset after chaosInterval
                setTimeout(() => {
                    handlers.handleToggleChaos();
                }, chaosInterval);
            }, chaosInterval);

            return () => clearInterval(interval);
        }
    }, [autoChaos, chaosInterval, state, handlers]);

    return (
        <Box>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Chaos Mode Controls
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <FormControl fullWidth>
                        <InputLabel>Chaos Level</InputLabel>
                        <Select
                            value={chaosLevel}
                            onChange={(e) => setChaosLevel(Number(e.target.value))}
                        >
                            <MenuItem value={0}>0% (Normal)</MenuItem>
                            <MenuItem value={25}>25% (Mild)</MenuItem>
                            <MenuItem value={50}>50% (Moderate)</MenuItem>
                            <MenuItem value={75}>75% (Severe)</MenuItem>
                            <MenuItem value={100}>100% (Complete Chaos)</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={state.chaosMode}
                                onChange={(e) => {
                                    handlers.handleToggleChaos();
                                }}
                            />
                        }
                        label="Enable Chaos Mode"
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={autoChaos}
                                onChange={(e) => {
                                    setAutoChaos(e.target.checked);
                                    if (e.target.checked) {
                                        handlers.handleToggleChaos();
                                    }
                                }}
                            />
                        }
                        label="Enable Auto Chaos"
                    />
                    <FormControl fullWidth>
                        <InputLabel>Chaos Interval</InputLabel>
                        <Select
                            value={chaosInterval}
                            onChange={(e) => setChaosInterval(Number(e.target.value))}
                        >
                            <MenuItem value={1000}>1s</MenuItem>
                            <MenuItem value={5000}>5s</MenuItem>
                            <MenuItem value={10000}>10s</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Paper>

            <Paper sx={{ p: 3, mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Chaos Actions
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <FormControl fullWidth>
                        <InputLabel>Chaos Action</InputLabel>
                        <Select
                            value={selectedAction}
                            onChange={(e) => setSelectedAction(e.target.value as string)}
                        >
                            {chaosActions.map((action) => (
                                <MenuItem key={action.value} value={action.value}>
                                    {action.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => {
                            if (selectedAction === 'fail') {
                                const randomNode = state.nodes[Math.floor(Math.random() * state.nodes.length)];
                                handlers.handleNodeAction(randomNode.nodeId, 'fail');
                            } else if (selectedAction === 'restart') {
                                const randomNode = state.nodes[Math.floor(Math.random() * state.nodes.length)];
                                handlers.handleNodeAction(randomNode.nodeId, 'restart');
                            } else if (selectedAction === 'partition') {
                                const nodes = [...state.nodes];
                                const partitionSize = Math.floor(nodes.length / 2);
                                const partition1 = nodes.slice(0, partitionSize);
                                const partition2 = nodes.slice(partitionSize);
                                handlers.handleNodeAction('partition', JSON.stringify({ partition1, partition2 }));
                            }
                        }}
                    >
                        Apply Chaos Action
                    </Button>
                </Box>
            </Paper>

            <Paper sx={{ p: 3, mt: 4 }}>
                <Alert severity="warning">
                    Chaos mode is currently {state.chaosMode ? 'enabled' : 'disabled'}. This mode can cause unpredictable behavior in your cluster.
                </Alert>
            </Paper>
        </Box>
    );
};

export default ChaosPage;
