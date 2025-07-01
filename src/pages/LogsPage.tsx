import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { AppState, Handlers, Message } from '../types';

interface LogsPageProps {
  state: AppState;
  handlers: Handlers;
}

interface LogEntryMessage {
  timestamp: string;
  type: 'info' | 'warning' | 'error';
  message: string;
}

const LogsPage: React.FC<LogsPageProps> = ({ state, handlers }) => {
    const [logs, setLogs] = React.useState<(Message | LogEntryMessage)[]>([]);

    React.useEffect(() => {
        // Use actual logs from state
        setLogs(state.messages.map(msg => {
            if ('from' in msg && 'to' in msg && 'term' in msg && 'data' in msg) {
                // Raft message
                return {
                    timestamp: msg.timestamp,
                    type: msg.type as 'info' | 'warning' | 'error',
                    message: `${msg.from} -> ${msg.to}: ${msg.data?.command || ''}`
                };
            }
            // System log message
            return {
                timestamp: msg.timestamp,
                type: msg.type as 'info' | 'warning' | 'error',
                message: msg.message || 'System Log'
            };
        }));
    }, [state.messages]);

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                System Logs
            </Typography>
            <Paper sx={{ p: 2 }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Timestamp</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Message</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {logs.map((log, index) => (
                                <TableRow key={index}>
                                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Typography 
                                            variant="body2" 
                                            color={log.type === 'error' ? 'error' : log.type === 'warning' ? 'warning' : 'primary'}
                                        >
                                            {log.type.toUpperCase()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        {log.type === 'info' ? log.message : 
                                         log.type === 'warning' ? log.message : 
                                         log.type === 'error' ? log.message : 
                                         'System Log'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default LogsPage;
