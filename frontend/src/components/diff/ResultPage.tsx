import { useAppSelector } from '../../../store';  // Reduxストアの型をインポート
import { Box, Typography, Paper } from '@mui/material';

const ResultPage: React.FC = () => {
  const diffResponse = useAppSelector((state) => state.diff.diffResponse);

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
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>追加された項目数:</strong> {diffResponse.added}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>削除された項目数:</strong> {diffResponse.deleted}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>変更された項目数:</strong> {diffResponse.modified}
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