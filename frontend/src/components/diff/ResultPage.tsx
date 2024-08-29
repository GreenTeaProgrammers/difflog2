import React from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Typography, Paper } from '@mui/material';

interface DiffResponse {
  added: number;
  deleted: number;
  modified: number;
}

const ResultPage: React.FC = () => {
  const location = useLocation();
  const diffData: DiffResponse | undefined = location.state?.captureData;

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center', 
      p: 2, 
      bgcolor: 'black', 
      color: 'white'
    }}>
      <Paper sx={{ p: 4, bgcolor: 'rgba(255, 255, 255, 0.1)' }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          解析結果
        </Typography>
        {diffData ? (
          <Box>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>追加された項目数:</strong> {diffData.added}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>削除された項目数:</strong> {diffData.deleted}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>変更された項目数:</strong> {diffData.modified}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body1">
            解析結果がありません。再度お試しください。
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default ResultPage;
