import React, { useState, ChangeEvent, DragEvent } from 'react';
import { Box, Typography, Button, Input, Paper, CircularProgress } from '@mui/material';
import { CloudUpload, CheckCircleOutline } from '@mui/icons-material';
import { addCapture } from '../../../services/captureService'; // 先ほど作成したAPI関数をインポート

interface CameraUploadScreenProps {
  backgroundColor?: string;
}

const CameraUploadScreen: React.FC<CameraUploadScreenProps> = ({ backgroundColor = 'black' }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) return;
    
    setIsAnalyzing(true);

    try {
      // APIにPOSTリクエストを送信
      const capture = {
        locationId: '1', // locationIdを必要に応じて変更してください
        file: uploadedFile,
      };
      const response = await addCapture(capture);
      console.log('Capture saved:', response);

      // 必要に応じてレスポンスを処理
    } catch (error) {
      console.error('Error uploading capture:', error);
    } finally {
      setIsAnalyzing(false);
    }
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
        accept="image/*"
        type="file"
        onChange={handleFileChange}
        sx={{ display: 'none' }}
        id="file-input"
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
