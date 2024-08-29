import React, { useState } from 'react';
import { Box, Typography, TextField, Button, IconButton, Container, Paper } from '@mui/material';
import { ArrowBack, Add } from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { darkTheme } from '../../theme';
import { useNavigate } from 'react-router-dom'; // 追加

interface AddLocationScreenProps {
  onAddLocation: (newLocation: string) => void;
}

const AddLocationScreen: React.FC<AddLocationScreenProps> = ({ onAddLocation }) => {
  const [newLocation, setNewLocation] = useState('');
  const navigate = useNavigate(); // 追加

  const handleAddLocation = () => {
    if (newLocation.trim()) {
      onAddLocation(newLocation.trim());
      setNewLocation('');
    }
  };

  const handleBack = () => {
    navigate('/welcome'); // 追加
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
        }}
      >
        <Container maxWidth="sm" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', my: 3 }}>
            <IconButton color="primary" onClick={handleBack} sx={{ mr: 2 }}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h5" fontWeight="bold">
              Add New Location
            </Typography>
          </Box>

          <Paper
            elevation={3}
            sx={{
              p: 3,
              mt: 2,
              borderRadius: 2,
              bgcolor: 'background.paper',
              flexGrow: 1,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="Enter new location name"
                variant="outlined"
                fullWidth
                InputProps={{
                  startAdornment: <Add color="primary" sx={{ mr: 1 }} />,
                }}
              />
              <Button
                variant="contained"
                onClick={handleAddLocation}
                disabled={!newLocation.trim()}
                sx={{
                  py: 1.5,
                  fontWeight: 'bold',
                  textTransform: 'none',
                  borderRadius: 2,
                }}
              >
                Add Location
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default AddLocationScreen;