import React, { useState, ChangeEvent, DragEvent } from 'react';
import { Box, Typography, Button, Input, Paper, CircularProgress, IconButton, ThemeProvider } from '@mui/material';
import { CloudUpload, CheckCircleOutline, ArrowBack } from '@mui/icons-material';
import { addCapture } from '../../../services/captureService';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setDiffResponse } from '../../../store/diffSlice';
import { DiffResponse } from '../../../types/diff';

import { useAppSelector } from "../../../store";
import { lightTheme, darkTheme } from "../../theme";

interface CameraUploadScreenProps {
  backgroundColor?: string;
}

const CameraUploadScreen: React.FC<CameraUploadScreenProps> = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isDarkMode = useAppSelector((state) => state.userSetting.isDarkMode);

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
    setError(null);
  
    try {
      const capture = {
        locationId: '1',
        file: uploadedFile,
      };
      const response = await addCapture(capture);
      console.log('Capture saved:', response);

      const mlResponse: DiffResponse = response.mlResponse;
  
      dispatch(setDiffResponse(mlResponse));
  
      navigate('/result');
    } catch (error) {
      console.error('Error uploading capture:', error);
      setError('画像のアップロードに失敗しました。もう一度お試しください。');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBack = () => {
    navigate('/welcome');
  };

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.default",
          color: "text.primary",
        }}
      >
        <Box sx={{ p: 2, display: "flex", alignItems: "center" }}>
          <IconButton color="primary" onClick={handleBack} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6">画像アップロード</Typography>
        </Box>
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            p: 2,
          }}
        >
          <Input
            accept="image/*"
            type="file"
            onChange={handleFileChange}
            sx={{ display: "none" }}
            id="file-input"
          />
          <label
            htmlFor="file-input"
            style={{ width: "100%", maxWidth: "500px" }}
          >
            <Paper
              elevation={3}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              sx={{
                width: "100%",
                aspectRatio: "16 / 9",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                mb: 3,
                cursor: "pointer",
                transition: "all 0.3s ease",
                bgcolor: isDragging
                  ? "rgba(255, 165, 0, 0.1)"
                  : "rgba(255, 255, 255, 0.05)",
                border: isDragging ? "2px dashed orange" : "2px dashed grey",
                "&:hover": {
                  bgcolor: "rgba(255, 165, 0, 0.05)",
                },
              }}
            >
              {uploadedFile ? (
                <CheckCircleOutline
                  sx={{ fontSize: 64, mb: 2, color: "orange" }}
                />
              ) : (
                <CloudUpload
                  sx={{
                    fontSize: 64,
                    mb: 2,
                    color: isDragging ? "orange" : "grey",
                  }}
                />
              )}
              <Typography
                variant="h6"
                align="center"
                sx={{ color: "text.primary", px: 2 }}
              >
                {uploadedFile
                  ? `アップロード完了: ${uploadedFile.name}`
                  : "クリックまたはドラッグ＆ドロップで画像をアップロード"}
              </Typography>
            </Paper>
          </label>
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
          <Button
            variant="contained"
            onClick={handleAnalyze}
            disabled={!uploadedFile || isAnalyzing}
            sx={{
              mt: 2,
              bgcolor: "orange",
              color: "black",
              px: 4,
              py: 1,
              fontSize: "1.1rem",
              "&:hover": { bgcolor: "darkorange" },
              "&.Mui-disabled": {
                bgcolor: "rgba(255, 165, 0, 0.3)",
                color: (theme) => `rgba(${theme.palette.text.primary}, 0.3)`,
              },
            }}
          >
            {isAnalyzing ? (
              <CircularProgress size={24} sx={{ color: "black" }} />
            ) : (
              "解析！"
            )}
          </Button>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default CameraUploadScreen;