import React, { useState } from 'react';
import { Box, Typography, IconButton, Slider, Grid, Paper, Drawer } from '@mui/material';
import { Info, ZoomIn, ZoomOut, Close } from '@mui/icons-material';
import HorizontalWheel from './HorizontalWheel';

interface WelcomeScreenProps {
  username: string;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ username }) => {
  const [selectedLocation, setSelectedLocation] = useState('desk');
  const [zoomLevel, setZoomLevel] = useState(1); // 1: Year, 2: Month, 3: Day
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const locations = ['books', 'kitchen', 'desk', 'store'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    console.log(`Selected location: ${location}`); // 選択されたロケーションをログ出力
  };

  const handleZoomChange = (event: Event, newValue: number | number[]) => {
    setZoomLevel(newValue as number);
  };

  const toggleInfoDrawer = () => {
    setIsInfoOpen(!isInfoOpen);
  };

  const renderYearView = () => (
    <Grid container spacing={1}>
      {months.map((month) => (
        <Grid item xs={3} key={month}>
          <Paper elevation={3} sx={{ p: 1, bgcolor: 'grey.900', color: 'white' }}>
            <Typography variant="subtitle2">{month}</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
              {[...Array(31)].map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    width: '100%',
                    paddingBottom: '100%',
                    backgroundColor: 'grey.800',
                    borderRadius: 1,
                  }}
                />
              ))}
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  const renderMonthView = () => (
    <Grid container spacing={1}>
      {[...Array(31)].map((_, day) => (
        <Grid item xs={2} key={day}>
          <Paper elevation={3} sx={{ p: 1, bgcolor: 'grey.900', color: 'white', textAlign: 'center' }}>
            <Typography variant="h6">{day + 1}</Typography>
            <Box sx={{ height: 50, bgcolor: 'grey.800', borderRadius: 1, mt: 1 }} />
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  const renderDayView = () => (
    <Box sx={{ p: 2, bgcolor: 'grey.900', borderRadius: 2 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>August 30, 2024</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {[...Array(5)].map((_, index) => (
          <Paper key={index} elevation={3} sx={{ p: 2, bgcolor: 'grey.800', color: 'white' }}>
            <Typography variant="body1">Item {index + 1} in {selectedLocation}</Typography>
            <Typography variant="body2" color="text.secondary">Details about the item...</Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );

  const renderContent = () => {
    switch (Math.round(zoomLevel)) {
      case 1:
        return renderYearView();
      case 2:
        return renderMonthView();
      case 3:
        return renderDayView();
      default:
        return renderYearView();
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'black', color: 'white' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <IconButton color="inherit" onClick={toggleInfoDrawer}>
          <Info />
        </IconButton>
        <Typography variant="h6">2024 - {selectedLocation}</Typography>
        <IconButton color="inherit" onClick={() => setZoomLevel(1)}>
          <ZoomOut />
        </IconButton>
      </Box>

      <Box sx={{ flexGrow: 1, overflow: 'auto', px: 2 }}>
        {renderContent()}
      </Box>

      <Box sx={{ p: 2 }}>
        <HorizontalWheel items={locations} onSelect={handleLocationSelect} />
      </Box>

      <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center' }}>
        <ZoomOut />
        <Slider
          value={zoomLevel}
          min={1}
          max={3}
          step={0.1}
          onChange={handleZoomChange}
          sx={{ mx: 2, color: 'orange' }}
        />
        <ZoomIn />
      </Box>

      <Drawer
        anchor="left"
        open={isInfoOpen}
        onClose={toggleInfoDrawer}
        PaperProps={{
          sx: {
            backgroundColor: 'black',
            color: 'white',
            width: 300,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Information</Typography>
            <IconButton color="inherit" onClick={toggleInfoDrawer}>
              <Close />
            </IconButton>
          </Box>
          <Typography variant="body1">
            This is the Difflog app. Use the slider at the bottom to zoom in and out between year, month, and day views.
            Select different locations using the wheel at the bottom of the screen.
          </Typography>
        </Box>
      </Drawer>
    </Box>
  );
};

export default WelcomeScreen;