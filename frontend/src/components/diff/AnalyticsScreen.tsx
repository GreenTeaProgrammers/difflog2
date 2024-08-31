import React, { useState } from 'react';
import { Box, Typography, IconButton, ThemeProvider } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import HorizontalWheel from './HorizontalWheel';
import { useCommitData } from '../../hooks/useCommitData';
import { useAppSelector } from "../../../store";
import { lightTheme, darkTheme } from "../../theme";

const AnalyticsScreen: React.FC = () =>
{
  const [selectedLocation, setSelectedLocation] = useState('desk');
  const navigate = useNavigate();
  const { data, loading, error } = useCommitData(selectedLocation);
  const isDarkMode = useAppSelector((state) => state.userSetting.isDarkMode);
  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
  };

  const handleBack = () => {
    navigate('/welcome');
  };

  const locations = ['books', 'kitchen', 'desk', 'store'];

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default', color: 'text.primary' }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
          <IconButton color="primary" onClick={handleBack} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6">Analytics</Typography>
        </Box>

        <Box sx={{ flexGrow: 1, p: 2 }}>
          {loading ? (
            <Typography>Loading...</Typography>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#FF8C00" fill="#FF8C00" fillOpacity={0.5} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Box>

        <Box sx={{ p: 2 }}>
          <HorizontalWheel items={locations} onSelect={handleLocationChange} />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AnalyticsScreen;