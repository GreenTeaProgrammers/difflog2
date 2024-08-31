import React, { useState } from 'react';
import { Box, Typography, TextField, Button, IconButton, Container, Paper } from '@mui/material';
import { ArrowBack, Add } from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { createLocation } from '../../../services/locationService'; // サービスのインポート
import { useAppSelector } from "../../../store";
import { lightTheme, darkTheme } from "../../theme";

interface AddLocationScreenProps {
  onAddLocation: (newLocation: any) => void; // 適切な型を指定する必要があります
}

const AddLocationScreen: React.FC<AddLocationScreenProps> = ({ onAddLocation }) => {
  const [newLocation, setNewLocation] = useState('');
  const navigate = useNavigate();
  const isDarkMode = useAppSelector((state) => state.userSetting.isDarkMode);

  const handleAddLocation = async () => {
    if (newLocation.trim()) {
      try {
        const location = {
          name: newLocation.trim(),
          lastCommitDate: null, // 初期値としてnullを設定
        };
  
        const createdLocation = await createLocation(location);
        onAddLocation(createdLocation);
        setNewLocation('');
        navigate('/welcome');
      } catch (error) {
        console.error('Error adding location:', error);
      }
    }
  };

  const handleBack = () => {
    navigate('/welcome');
  };

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.default",
        }}
      >
        <Container
          maxWidth="sm"
          sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
        >
          <Box sx={{ display: "flex", alignItems: "center", my: 3 }}>
            <IconButton color="primary" onClick={handleBack} sx={{ mr: 2 }}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h5" fontWeight="bold" color="text.primary">
              Add New Location
            </Typography>
          </Box>

          <Paper
            elevation={3}
            sx={{
              p: 3,
              mt: 2,
              borderRadius: 2,
              bgcolor: "background.paper",
              flexGrow: 1,
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
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
                  fontWeight: "bold",
                  textTransform: "none",
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
