import React, { useState } from 'react';
import { Box, Typography, Button, Input, Paper, CircularProgress } from '@mui/material';
import { CloudUpload, CheckCircleOutline } from '@mui/icons-material';

const CameraUploadScreen = ({ backgroundColor = 'black' }) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    console.log('Analyzing image:', uploadedFile);
    // ここに画像解析のロジックを追加します
    setTimeout(() => setIsAnalyzing(false), 2000); // 仮の遅延
  };

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center', 
      p: 2, 
      bgcolor: backgroundColor,
      color: 'white'
    }}>
      <Input
        type="file"
        onChange={handleFileChange}
        sx={{ display: 'none' }}
        id="file-input"
        accept="image/*"
      />
      <label htmlFor="file-input" style={{ width: '100%', maxWidth: '500px' }}>
        <Paper
          elevation={3}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          sx={{
            width: '100%',
            aspectRatio: '16 / 9',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 3,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            bgcolor: isDragging ? 'rgba(255, 165, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)',
            border: isDragging ? '2px dashed orange' : '2px dashed grey',
            '&:hover': {
              bgcolor: 'rgba(255, 165, 0, 0.05)',
            },
          }}
        >
          {uploadedFile ? (
            <CheckCircleOutline sx={{ fontSize: 64, mb: 2, color: 'orange' }} />
          ) : (
            <CloudUpload sx={{ fontSize: 64, mb: 2, color: isDragging ? 'orange' : 'grey' }} />
          )}
          <Typography variant="h6" align="center" sx={{ color: 'white', px: 2 }}>
            {uploadedFile
              ? `アップロード完了: ${uploadedFile.name}`
              : 'クリックまたはドラッグ＆ドロップで画像をアップロード'}
          </Typography>
        </Paper>
      </label>
      <Button
        variant="contained"
        onClick={handleAnalyze}
        disabled={!uploadedFile || isAnalyzing}
        sx={{
          mt: 2,
          bgcolor: 'orange',
          color: 'black',
          px: 4,
          py: 1,
          fontSize: '1.1rem',
          '&:hover': { bgcolor: 'darkorange' },
          '&.Mui-disabled': { bgcolor: 'rgba(255, 165, 0, 0.3)', color: 'rgba(0, 0, 0, 0.3)' },
        }}
      >
        {isAnalyzing ? (
          <CircularProgress size={24} sx={{ color: 'black' }} />
        ) : (
          '解析！'
        )}
      </Button>
    </Box>
  );
};

export default CameraUploadScreen;