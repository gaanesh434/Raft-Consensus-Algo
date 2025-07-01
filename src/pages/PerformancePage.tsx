import React from 'react';
import { Box, Typography, Paper, CircularProgress, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Container, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { AppState, Handlers, Node } from '../types';

interface PerformanceStats {
    nodeCount: number;
    messageCount: number;
    memoryUsage: {
        rss: number;
        heapUsed: number;
        heapTotal: number;
        external: number;
    };
    uptime: number;
}

const StyledGrid = styled(Grid)(({ theme }) => ({
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        width: '100%',
    },
    [theme.breakpoints.up('md')]: {
        width: '50%',
    },
    [theme.breakpoints.up('lg')]: {
        width: '33.33%',
    },
}));

export default function PerformancePage({ state, handlers }: { state: AppState; handlers: Handlers }) {
    const calculateMemoryUsage = () => {
        const { memoryUsage } = state.performanceStats;
        const totalMemory = memoryUsage.heapTotal;
        const usedMemory = memoryUsage.heapUsed;
        return (usedMemory / totalMemory) * 100;
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <Container maxWidth="lg">
        <Grid container spacing={3}>
            <StyledGrid>
                <Typography variant="h5" gutterBottom>
                    Performance Statistics
                </Typography>
            </StyledGrid>
            <StyledGrid>
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Memory Usage
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CircularProgress
                            variant="determinate"
                            value={calculateMemoryUsage()}
                            size={100}
                            sx={{ mr: 2 }}
                        />
                        <Box>
                            <Typography variant="h6">
                                {calculateMemoryUsage().toFixed(1)}%
                            </Typography>
                            <Typography variant="body2">
                                {formatBytes(state.performanceStats.memoryUsage.heapUsed)} / {formatBytes(state.performanceStats.memoryUsage.heapTotal)}
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </StyledGrid>
            <StyledGrid>
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Node Status
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <LinearProgress
                            variant="determinate"
                            value={(state.nodes.filter(n => n.isAlive).length / state.nodes.length) * 100}
                        />
                        <Typography variant="body1">
                            Active Nodes: {state.nodes.filter(n => n.isAlive).length}/{state.nodes.length}
                        </Typography>
                    </Box>
                </Paper>
            </StyledGrid>
            <StyledGrid>
                <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Network Statistics
                    </Typography>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Parameter</TableCell>
                                    <TableCell align="right">Value</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Message Throughput</TableCell>
                                    <TableCell align="right">{state.messages.length} messages</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Message Rate</TableCell>
                                    <TableCell align="right">{0.00} msg/s</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Network Latency</TableCell>
                                    <TableCell align="right">{0.00} ms</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </StyledGrid>
        </Grid>
    </Container>
    );
};
