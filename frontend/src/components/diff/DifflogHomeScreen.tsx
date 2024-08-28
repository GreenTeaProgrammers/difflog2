import React, { useState } from 'react';
import { Box, Typography, IconButton, Slider, Tabs, Tab } from '@mui/material';
import { Info, LocationOn, Camera, Home } from '@mui/icons-material';
import { useParams } from 'react-router-dom';

const monthNames = ["Jan.", "Feb.", "Mar.", "Apr.", "May.", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];

const DifflogHomeScreen = () => {
  const { username } = useParams();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState('desk');
  const [tabValue, setTabValue] = useState(2); // Default to 'Home' tab

  const handleZoomChange = (_, newValue) => {
    setZoomLevel(newValue);
  };

  const handleTabChange = (_, newValue) => {
    setTabValue(newValue);
  };

  const renderCalendarTiles = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return [...Array(daysInMonth)].map((_, index) => (
      <Box
        key={index}
        sx={{
          width: 20,
          height: 20,
          backgroundColor: index === today.getDate() - 1 ? 'orange' : 'grey.700',
          m: 0.5,
        }}
      />
    ));
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'black', color: 'white' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <IconButton color="inherit">
          <Info />
        </IconButton>
        <Typography variant="h6">2024</Typography>
        <Box sx={{ width: 40 }} /> {/* Placeholder for balance */}
      </Box>

      <Box sx={{ flexGrow: 1, overflow: 'auto', px: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
          {renderCalendarTiles()}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-around', p: 2 }}>
        {['books', 'kitchen', 'desk', 'store'].map((location) => (
          <Typography
            key={location}
            variant="body2"
            sx={{
              opacity: location === selectedLocation ? 1 : 0.5,
              cursor: 'pointer',
            }}
            onClick={() => setSelectedLocation(location)}
          >
            {location}
          </Typography>
        ))}
      </Box>

      <Slider
        orientation="vertical"
        value={zoomLevel}
        onChange={handleZoomChange}
        min={0.5}
        max={2}
        step={0.1}
        sx={{
          position: 'absolute',
          right: 16,
          top: '50%',
          height: 200,
          transform: 'translateY(-50%)',
        }}
      />

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          bgcolor: 'black',
          '& .MuiTab-root': { color: 'white' },
          '& .Mui-selected': { color: 'orange' },
        }}
      >
        <Tab icon={<LocationOn />} label="Location" />
        <Tab icon={<Camera />} label="Camera" />
        <Tab icon={<Home />} label="Home" />
        {/* Add more tabs as needed */}
      </Tabs>
    </Box>
  );
};

export default DifflogHomeScreen;
