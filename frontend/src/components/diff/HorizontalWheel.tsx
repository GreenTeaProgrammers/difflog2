import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { fetchLocations } from '../../../services/locationService'; // Ensure this matches your actual import path

interface Location {
  id: string;
  name: string;
}

const HorizontalWheel: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const fetchedLocations = await fetchLocations();
        setLocations(fetchedLocations);
        setSelectedLocation(fetchedLocations[Math.floor(fetchedLocations.length / 2)]); // Default to the middle item
      } catch (error) {
        console.error('Failed to load locations', error);
      }
    };

    loadLocations();
  }, []);

  const handleSelectLocation = (location: Location) => {
    setSelectedLocation(location);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        overflowX: 'auto',
        mx: 'auto',
        maxWidth: '100%',
        bgcolor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 2,
        py: 2,
      }}
    >
      {locations.map((location) => (
        <Box
          key={location.id}
          sx={{
            flex: '0 0 20%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s',
            opacity: selectedLocation?.id === location.id ? 1 : 0.5,
            transform: selectedLocation?.id === location.id ? 'scale(1.2)' : 'scale(1)',
          }}
          onClick={() => handleSelectLocation(location)}
        >
          <Typography
            variant="body1"
            sx={{
              color: 'white',
              fontWeight: selectedLocation?.id === location.id ? 'bold' : 'normal',
            }}
          >
            {location.name}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default HorizontalWheel;