import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../../store';
import { Box, Typography, Paper, TextField, Button } from '@mui/material';
import { updateDiffResponse } from '../../../store/diffSlice';

const ResultPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const diffResponse = useAppSelector((state) => state.diff.diffResponse);

  const [added, setAdded] = useState(diffResponse?.added || 0);
  const [deleted, setDeleted] = useState(diffResponse?.deleted || 0);
  const [modified, setModified] = useState(diffResponse?.modified || 0);

  const handleSave = () => {
    dispatch(updateDiffResponse({ added, deleted, modified }));
  };

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
        {diffResponse ? (
          <Box>
            <TextField
              label="追加された項目数"
              type="number"
              value={added}
              onChange={(e) => setAdded(Number(e.target.value))}
              sx={{ mb: 2, input: { color: 'white' }, label: { color: 'white' } }}
              fullWidth
            />
            <TextField
              label="削除された項目数"
              type="number"
              value={deleted}
              onChange={(e) => setDeleted(Number(e.target.value))}
              sx={{ mb: 2, input: { color: 'white' }, label: { color: 'white' } }}
              fullWidth
            />
            <TextField
              label="変更された項目数"
              type="number"
              value={modified}
              onChange={(e) => setModified(Number(e.target.value))}
              sx={{ mb: 2, input: { color: 'white' }, label: { color: 'white' } }}
              fullWidth
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              sx={{ mt: 2 }}
            >
              保存
            </Button>
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