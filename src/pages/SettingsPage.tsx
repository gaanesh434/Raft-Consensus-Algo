import React, { useState } from 'react';
import { Box, Typography, Paper, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel, TextField, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import { AppState, Handlers } from '../types';

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

export default function SettingsPage({ state, handlers }: { state: AppState; handlers: Handlers }) {
    const [settings, setSettings] = useState({
        theme: 'dark',
        language: 'en',
        notifications: true,
        autoSave: true,
        logLevel: 'info',
        maxLogEntries: 1000,
        heartbeatInterval: 3000,
        electionTimeout: 1500
    });

    const logLevels = ['debug', 'info', 'warning', 'error'];
    const languages = ['en', 'es', 'fr', 'de'];

    const handleSettingChange = (field: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleThemeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setSettings({ ...settings, theme: event.target.value as 'light' | 'dark' });
    };

    const handleLanguageChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setSettings({ ...settings, language: event.target.value as 'en' | 'es' | 'fr' });
    };

    const handleNotificationsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSettings({ ...settings, notifications: event.target.checked });
    };

    const handleAutoSaveChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSettings({ ...settings, autoSave: event.target.checked });
    };

    const handleSave = () => {
        // TODO: Implement save logic
        alert('Settings saved!');
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Settings
            </Typography>

            <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    General Settings
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                    <Box sx={{ width: '100%' }}>
                        <FormControl fullWidth>
                            <InputLabel>Theme</InputLabel>
                            <Select
                                value={state.theme}
                                onChange={(e) => {
                                    const newTheme = e.target.value as 'light' | 'dark';
                                    // handlers.handleThemeChange(newTheme);
                                }}
                            >
                                <MenuItem value="light">Light</MenuItem>
                                <MenuItem value="dark">Dark</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    <Box sx={{ width: '100%' }}>
                        <FormControl fullWidth>
                            <InputLabel>Language</InputLabel>
                            <Select
                                value={state.language}
                                onChange={(e) => {
                                    const newLanguage = e.target.value as 'en' | 'es' | 'fr';
                                    // handlers.handleLanguageChange(newLanguage);
                                }}
                            >
                                <MenuItem value="en">English</MenuItem>
                                <MenuItem value="es">Español</MenuItem>
                                <MenuItem value="fr">Français</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    <Box sx={{ width: '100%' }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={state.notifications}
                                    onChange={(e) => {
                                        // handlers.handleNotificationChange(e.target.checked)
                                    }}
                                />
                            }
                            label="Enable Notifications"
                        />
                    </Box>
                    <Box sx={{ width: '100%' }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={state.autoSave}
                                    onChange={(e) => {
                                        // handlers.handleAutoSaveChange(e.target.checked)
                                    }}
                                />
                            }
                            label="Auto Save"
                        />
                    </Box>
                </Box>
            </Paper>

            <Paper sx={{ p: 3, mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Advanced Settings
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                    <Box sx={{ width: '100%' }}>
                        <FormControl fullWidth>
                            <InputLabel>Log Level</InputLabel>
                            <Select
                                value={settings.logLevel}
                                label="Log Level"
                                onChange={(e) => handleSettingChange('logLevel', e.target.value)}
                            >
                                {logLevels.map(level => (
                                    <MenuItem key={level} value={level}>
                                        {level.toUpperCase()}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <Box sx={{ width: '100%' }}>
                        <TextField
                            fullWidth
                            label="Max Log Entries"
                            type="number"
                            value={settings.maxLogEntries}
                            onChange={(e) => handleSettingChange('maxLogEntries', Number(e.target.value))}
                        />
                    </Box>

                    <Box sx={{ width: '100%' }}>
                        <TextField
                            fullWidth
                            label="Heartbeat Interval (ms)"
                            type="number"
                            value={settings.heartbeatInterval}
                            onChange={(e) => handleSettingChange('heartbeatInterval', Number(e.target.value))}
                        />
                    </Box>

                    <Box sx={{ width: '100%' }}>
                        <TextField
                            fullWidth
                            label="Election Timeout (ms)"
                            type="number"
                            value={settings.electionTimeout}
                            onChange={(e) => handleSettingChange('electionTimeout', Number(e.target.value))}
                        />
                    </Box>
                </Box>
            </Paper>

            <Paper sx={{ p: 3, mt: 4 }}>
                <Alert severity="info">
                    Changes will take effect after refreshing the page.
                </Alert>
            </Paper>
        </Box>
    );
};


