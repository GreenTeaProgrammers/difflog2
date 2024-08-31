import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../../store';
import { updateDiffResponse } from '../../../store/diffSlice';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  ThemeProvider,
  Container,
  Grid,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { AddCircleOutline, RemoveCircleOutline, ChangeCircle, Add, Remove } from '@mui/icons-material';
import { darkTheme } from '../../theme'; // このパスは実際のファイル構造に合わせて調整してください
import { commitService } from '../../../services/commitService'; // commitServiceのインポート

const ResultPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const diffResponse = useAppSelector((state) => state.diff.diffResponse);

  const [added, setAdded] = useState(diffResponse?.added || 0);
  const [deleted, setDeleted] = useState(diffResponse?.deleted || 0);
  const [modified, setModified] = useState(diffResponse?.modified || 0);

  const handleSaveAndNavigate = async () => {
    dispatch(updateDiffResponse({ added, deleted, modified }));

    if (diffResponse) {
      const commitData = {
        locationID: "exampleLocationID", // 必要に応じてlocationIDを動的に設定してください
        date: new Date().toISOString(), // 現在の日付
        diff: {
          changes: diffResponse.changes,
        },
      };

      try {
        await commitService.createCommit(commitData);
        navigate("/welcome");  // 保存成功後に /welcome にナビゲート
      } catch (error) {
        console.error("Failed to create commit:", error);
        // 必要に応じてエラーハンドリングを追加
      }
    }
  };

  const handleIncrement = (setter: React.Dispatch<React.SetStateAction<number>>) => {
    setter(prev => prev + 1);
  };

  const handleDecrement = (setter: React.Dispatch<React.SetStateAction<number>>) => {
    setter(prev => Math.max(0, prev - 1));
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          bgcolor: 'background.default',
          color: 'text.primary',
          py: 4,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 2,
              background: 'linear-gradient(145deg, #1e1e1e 0%, #2a2a2a 100%)',
            }}
          >
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center' }}>
              解析結果
            </Typography>
            {diffResponse ? (
              <>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      label="追加された項目数"
                      type="text"
                      value={added}
                      InputProps={{
                        readOnly: true,
                        startAdornment: (
                          <InputAdornment position="start">
                            <AddCircleOutline color="primary" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => handleDecrement(setAdded)} size="small">
                              <Remove />
                            </IconButton>
                            <IconButton onClick={() => handleIncrement(setAdded)} size="small">
                              <Add />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="削除された項目数"
                      type="text"
                      value={deleted}
                      InputProps={{
                        readOnly: true,
                        startAdornment: (
                          <InputAdornment position="start">
                            <RemoveCircleOutline color="error" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => handleDecrement(setDeleted)} size="small">
                              <Remove />
                            </IconButton>
                            <IconButton onClick={() => handleIncrement(setDeleted)} size="small">
                              <Add />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="変更された項目数"
                      type="text"
                      value={modified}
                      InputProps={{
                        readOnly: true,
                        startAdornment: (
                          <InputAdornment position="start">
                            <ChangeCircle color="warning" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => handleDecrement(setModified)} size="small">
                              <Remove />
                            </IconButton>
                            <IconButton onClick={() => handleIncrement(setModified)} size="small">
                              <Add />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      fullWidth
                    />
                  </Grid>
                </Grid>

                {diffResponse.changes && diffResponse.changes.length > 0 ? (
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      詳細な変更リスト
                    </Typography>
                    <List>
                      {diffResponse.changes.map((change, index) => (
                        <ListItem key={index} sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', mb: 1, borderRadius: 1 }}>
                          <ListItemText
                            primary={`${change.itemName} - ${change.changeType}`}
                            secondary={`前: ${change.previousCount}, 今: ${change.currentCount}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                ) : (
                  <Typography variant="body1" sx={{ mt: 2, textAlign: 'center' }}>
                    変更の詳細がありません。
                  </Typography>
                )}

                <Button
                  variant="contained"
                  onClick={handleSaveAndNavigate}
                  fullWidth
                  size="large"
                  sx={{
                    mt: 2,
                    py: 1.5,
                    fontWeight: 'bold',
                    bgcolor: 'orange',
                    color: 'white',
                    transition: 'all 0.3s',
                    '&:hover': {
                      bgcolor: 'darkorange',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
                    },
                  }}
                >
                  保存
                </Button>
              </>
            ) : (
              <Typography variant="body1" sx={{ textAlign: 'center' }}>
                解析結果がありません。再度お試しください。
              </Typography>
            )}
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default ResultPage;
