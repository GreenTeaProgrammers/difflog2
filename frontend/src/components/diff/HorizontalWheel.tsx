import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

interface HorizontalWheelProps {
  items: string[];
  onSelect: (item: string) => void;
}

const HorizontalWheel: React.FC<HorizontalWheelProps> = ({ items, onSelect }) => {
  const [selectedIndex, setSelectedIndex] = useState(Math.floor(items.length / 2));
  const wheelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (wheelRef.current) {
      const wheelWidth = wheelRef.current.offsetWidth;
      const itemWidth = wheelWidth / 5; // Display 5 items at a time
      wheelRef.current.scrollLeft = (selectedIndex - 2) * itemWidth;
    }
  }, [selectedIndex]);

  const handleScroll = () => {
    if (wheelRef.current) {
      const wheelWidth = wheelRef.current.offsetWidth;
      const itemWidth = wheelWidth / 5;
      const scrollPosition = wheelRef.current.scrollLeft;
      const newIndex = Math.round(scrollPosition / itemWidth) + 2;
      
      if (newIndex !== selectedIndex && newIndex >= 0 && newIndex < items.length) {
        setSelectedIndex(newIndex);
        onSelect(items[newIndex]);
      }
    }
  };

  return (
    <Box
      ref={wheelRef}
      sx={{
        display: 'flex',
        overflowX: 'auto',
        scrollSnapType: 'x mandatory',
        '&::-webkit-scrollbar': { display: 'none' },
        scrollbarWidth: 'none',
        mx: 'auto',
        maxWidth: '100%',
        bgcolor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 2,
        py: 2,
      }}
      onScroll={handleScroll}
    >
      {items.map((item, index) => (
        <Box
          key={item}
          sx={{
            flex: '0 0 20%',
            scrollSnapAlign: 'center',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'all 0.3s',
            opacity: index === selectedIndex ? 1 : 0.5,
            transform: index === selectedIndex ? 'scale(1.2)' : 'scale(1)',
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: 'white',
              fontWeight: index === selectedIndex ? 'bold' : 'normal',
            }}
          >
            {item}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default HorizontalWheel;