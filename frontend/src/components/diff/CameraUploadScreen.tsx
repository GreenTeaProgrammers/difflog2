import React, { useState } from 'react';
import { Box, Typography, Button, Input } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

const CameraUploadScreen = () => {
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleAnalyze = () => {
    console.log('Analyzing image:', uploadedFile);
    // ここに画像解析のロジックを追加します
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 2 }}>
      <Input
        type="file"
        onChange={handleFileChange}
        sx={{ display: 'none' }}
        id="file-input"
        accept="image/*"
      />
      <label htmlFor="file-input">
        <Box
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          sx={{
            width: '100%',
            height: 200,
            border: '2px dashed grey',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 2,
            p: 2,
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <CloudUpload sx={{ fontSize: 48, mb: 1 }} />
          <Typography align="center">
            {uploadedFile
              ? `ファイル名: ${uploadedFile.name}`
              : 'クリックまたはドラッグ＆ドロップで画像をアップロード'}
          </Typography>
        </Box>
      </label>
      <Button
        variant="contained"
        onClick={handleAnalyze}
        disabled={!uploadedFile}
        sx={{ mt: 2, bgcolor: 'orange', color: 'black', '&:hover': { bgcolor: 'darkorange' } }}
      >
        解析！
      </Button>
    </Box>
  );
};

export default CameraUploadScreen;