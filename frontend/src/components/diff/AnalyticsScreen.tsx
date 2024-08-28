import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const dummyData = [
  { date: '2024-01', value: 10 },
  { date: '2024-02', value: 15 },
  { date: '2024-03', value: 13 },
  { date: '2024-04', value: 17 },
  { date: '2024-05', value: 20 },
  { date: '2024-06', value: 18 },
];

const AnalyticsScreen: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState('desk');

  const handleLocationChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedLocation(newValue);
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'black', color: 'white' }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">Analytics</Typography>
      </Box>

      <Box sx={{ flexGrow: 1, p: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dummyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      <Tabs
        value={selectedLocation}
        onChange={handleLocationChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          bgcolor: 'black',
          '& .MuiTab-root': { color: 'white' },
          '& .Mui-selected': { color: 'orange' },
        }}
      >
        <Tab label="books" value="books" />
        <Tab label="kitchen" value="kitchen" />
        <Tab label="desk" value="desk" />
        <Tab label="store" value="store" />
      </Tabs>
    </Box>
  );
};

export default AnalyticsScreen;