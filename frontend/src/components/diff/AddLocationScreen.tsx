import React, { useState } from 'react';
import { Box, Typography, TextField, Button, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

interface AddLocationScreenProps {
  onAddLocation: (newLocation: string) => void;
  onBack: () => void;
}

const AddLocationScreen: React.FC<AddLocationScreenProps> = ({ onAddLocation, onBack }) => {
  const [newLocation, setNewLocation] = useState('');

  const handleAddLocation = () => {
    if (newLocation.trim()) {
      onAddLocation(newLocation.trim());
      setNewLocation('');
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'black', color: 'white', p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton color="inherit" onClick={onBack}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" sx={{ ml: 2 }}>Add New Location</Typography>
      </Box>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          value={newLocation}
          onChange={(e) => setNewLocation(e.target.value)}
          placeholder="Enter new location name"
          variant="outlined"
          fullWidth
          InputProps={{
            sx: { color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.500' } }
          }}
        />
        <Button
          variant="contained"
          onClick={handleAddLocation}
          disabled={!newLocation.trim()}
          sx={{
            bgcolor: 'orange',
            color: 'black',
            '&:hover': { bgcolor: 'darkorange' },
            '&.Mui-disabled': { bgcolor: 'grey.700', color: 'grey.500' }
          }}
        >
          Add Location
        </Button>
      </Box>
    </Box>
  );
};

export default AddLocationScreen;