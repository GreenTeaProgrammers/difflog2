import React, { useState } from 'react';
import { Box, Typography, IconButton,  Grid, Paper, Drawer, Switch, ThemeProvider } from '@mui/material';
import { Info,  Close, CameraAlt, AddLocation, BarChart, ArrowBack, NearMe, Home, ManageAccounts } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import HorizontalWheel from '../HorizontalWheel';
import { lightTheme, darkTheme } from '../../../theme';
import  ColorBlock  from "../atoms/ColorBlock";

import{useAppDispatch,useAppSelector} from '../../../../store';
import { toggleDarkMode } from '../../../../store/userSettingSlice';

import CommitDiffDisplay from './CommitDiffData';

interface WelcomeScreenProps {
  username: string;
}

export type Commit = {
  ID: number;
  items: {
    label: string;
    count: number;
  }[];
};

const mockCommits: Commit = 
  {
    ID: 1,
    items: [
      { label: "feature", count: 5 },
      { label: "bug", count: 2 },
      { label: "documentation", count: 1 }
    ]
  };

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ username }) => {
  const locations = ["books", "kitchen", "desk", "store"];
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const dispatch = useAppDispatch();
  const [selectedLocation, setSelectedLocation] = useState('desk');
  const [curentView, setCurrentView] = useState('year');
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(months[0]);
  const [currentDay, setCurrentDay] = useState(0);
  const navigate = useNavigate();
  const isDarkMode = useAppSelector((state) => state.userSetting.isDarkMode);
  const handleLocationSelect = (location: string) =>
  {

    setSelectedLocation(location);
    console.log(`Selected location: ${location}`);
  };
  
  const toggleInfoDrawer = () =>
  {
    setIsInfoOpen(!isInfoOpen);
  };

  const yearXsValue = window.innerWidth > window.innerHeight ? 3 : 4;


  const navigateToCameraUpload = () =>
  {

    navigate('/camera');
  };

  const navigateToAddLocation = () =>
  {
    navigate('/location');
  };

  const navigateToAnalytics = () =>
  {
    navigate('/analytics');
  };

  const navigateToLoginpage = () => {
    navigate('/login');
  };

  const handleThemeToggle = () => {
    dispatch(toggleDarkMode());
  };

  const renderYearView = () =>
  {
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {months.map((month) => (
          <Box
        key={month}
        sx={{
          flexBasis: `calc(${100 / 3}% - 8px)`,
          p: 1,
          bgcolor: "grey.900",
          color: "white",
          height: '20vh',
        }}
          >
        <Typography variant="subtitle2" align="center">
          {month}
        </Typography>
        <Box
          onClick={() => setCurrentMonthData(month)}
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 0.5,
          }}
        >
          {renderMonthGridPreview(month)}
        </Box>
          </Box>
        ))}
      </Box>
    );
  };

  const renderMonthGridPreview = (month: string) =>
  {
    const daysInMonth = new Date(2024, months.indexOf(month) + 1, 0).getDate(); // 月の日数を取得
    const firstDayOfWeek = new Date(2024, months.indexOf(month), 1).getDay(); // 月の初日の曜日を取得

    return (
      <>
        {Array.from({ length: firstDayOfWeek }).map((_, index) => (
          <Box
            key={`empty-${index}`}
            sx={{
              width: "100%",
              paddingBottom: "100%",
              borderRadius: 1,
            }}
          />
        ))}
        {Array.from({ length: daysInMonth }).map((_, index) => (
          <ColorBlock
            year={2024}
            month={months.indexOf(month) + 1}
            day={index+1}
          />
        ))}
      </>
    );
  };


  const setCurrentMonthData = (month: string) => { 

    setCurrentMonth(month);
    setCurrentView('month');
  }


  const renderMonthView = (month: string) =>
  {
    const daysInMonth = new Date(2024, months.indexOf(month) + 1, 0).getDate(); // 月の日数を取得
    const firstDayOfWeek = new Date(2024, months.indexOf(month), 1).getDay(); // 月の初日の曜日を取得

    return (
      <>
        <Box display={"flex"}>
          <IconButton onClick={() => setCurrentView("year")}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h3">{month}</Typography>
        </Box>
        <Grid container spacing={1}>
          {Array.from({ length: firstDayOfWeek }).map((_, index) => (
            <Grid item xs={2} key={index}></Grid>
          ))}

          {Array.from({ length: daysInMonth }).map((_, day) => (
            <Grid
              item
              xs={2}
              key={day}
              onClick={() => setCurrentDayData(day + 1)}
            >
              <Paper
                elevation={3}
                sx={{
                  p: 1,
                  bgcolor: "grey.900",
                  color: "white",
                  textAlign: "center",
                }}
              >
                
                <ColorBlock
                  year={2024}
                  month={months.indexOf(month) + 1}
                  day={day + 1}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </>
    );
  };
  
  const setCurrentDayData = (day: number) =>
  {
    console.log(`Selected day: ${day}`);
    setCurrentDay(day);
    setCurrentView("day");
  };

  const renderDayView = () => (
    <Box sx={{ p: 2, bgcolor: "grey.900", borderRadius: 2 }}>
      <Box display={"flex"}>
        <Box>
          <IconButton
            onClick={() => setCurrentView("month")}
            sx={{ color: "rgba(255, 255, 255, 0.9)" }}
          >
            <ArrowBack />
          </IconButton>
        </Box>
        <Typography variant="h4" color="white" sx={{ mb: 2 }}>
          {currentMonth} {currentDay}
        </Typography>
      </Box>
      
      <Box sx={{ display: "flex", gap: 2 }}>
        {/*<Typography variant="h6" color="black">
          aaaaaaaaaaaa
        </Typography>*/}
        <CommitDiffDisplay commits={[mockCommits]} />
      </Box>
      {/*
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {[...Array(5)].map((_, index) => (//arrayの要素数を、検知した物体の種類数に指定したい
          <Paper //selectedLocationは選択されているロケーションの情報を持っている。物体の名称(ラベル名)とアイコンを表示したい(アイコン名はjsonファイルを参照)。検出した物体の、前回との差分情報を取得したい(resultpageを参照？)
            key={index}
            elevation={3}
            sx={{ p: 2, bgcolor: "grey.800", color: "white" }}
          >
            <Typography variant="body1">
              Item {index + 1} in {selectedLocation} 
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "rgba(255, 255, 255, 0.8)" }}
            >
              Details about the item...
            </Typography>
          </Paper>
        ))}
      </Box>
      */}
      
    </Box>
  );


  const renderContent = () => {
    switch (curentView) {
      case "year":
        return renderYearView();
      case "month":
        return renderMonthView(currentMonth);
      case "day":
        return renderDayView();
      default:
        return renderYearView();
    }
  };

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default', color: 'text.primary' }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <IconButton color="inherit" onClick={toggleInfoDrawer}>
            <Info />
          </IconButton>
          <Typography variant="h6">2024 - {selectedLocation}</Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <IconButton color="inherit" onClick={navigateToAnalytics}>
              <BarChart />
            </IconButton>
            <Switch
              checked={isDarkMode}
              onChange={handleThemeToggle}
              color="default"
            />
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1, display: 'flex' }}>
          <Box sx={{ flexGrow: 1, overflow: 'auto', px: 2 }}>
            {renderContent()}
          </Box>
        </Box>

        <Box sx={{ p: 2 }}>
          <HorizontalWheel items={locations} onSelect={handleLocationSelect} />
        </Box>

        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', bgcolor: 'background.default', alignItems: 'center' }}>
          <Box  sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <IconButton color="inherit" onClick={navigateToAddLocation}>
              <NearMe />
            </IconButton>
            <Typography>
              Location
            </Typography>
          </Box>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <IconButton color="inherit" onClick={navigateToCameraUpload}>
            <CameraAlt />
          </IconButton>
          <Typography>
            Camera
          </Typography>
          </Box>
          
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <IconButton color="inherit" onClick={() => setCurrentView("year")}>
            < Home />
          </IconButton>
          <Typography>
            Home
          </Typography>
          </Box> 
        </Box>

        <Drawer
          anchor="left"
          open={isInfoOpen}
          onClose={toggleInfoDrawer}
          PaperProps={{
            sx: {
              backgroundColor: 'background.paper',
              color: 'text.primary',
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
              This is the Difflog app. Use the vertical slider on the right to zoom in and out between year, month, and day views.
              Select different locations using the wheel at the bottom of the screen. Use the camera icon to upload photos,
              the location icon to add new locations, and the chart icon to view analytics. Toggle the switch in the top-right corner to change between light and dark themes.
            </Typography>
          </Box>

          
          <Box onClick={navigateToLoginpage}  bgcolor={'grey'} sx={{width: 180,
          height: 30,display: 'flex', px: 3, justifyContent: 'space-between',py:3  , alignItems: 'center'}}>
            <ManageAccounts/>
            
            <Box>
            <Typography>
              Logout
            </Typography>
            </Box>
          </Box>
          
        </Drawer>
      </Box>
    </ThemeProvider>
  );
};

export default WelcomeScreen;