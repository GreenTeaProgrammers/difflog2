import { Box, Card, Typography } from "@mui/material";
import { Commit } from "./WelcomeScreen";

interface CommitDiffDisplayProps {
  commits: Commit[];
}
const CommitDiffDisplay = ({ commits }: CommitDiffDisplayProps) => {

  const calculateDiff = (currentCount: number, index: number, itemindex: number) => {
    if (index === 0) return currentCount;
    const previousCount = commits[index - 1].items[itemindex].count;
    return currentCount - previousCount;
  };
  return (
    

      <Box sx={{ width: 360, height: 200,display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="h6">
    Commit No.1
  </Typography>
      {commits.map((commit, index) => (
          <Card key={index} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {commit.items.map((item, itemindex) => (
              <Box key={itemindex} sx={{ display: "flex", gap: 2 }}>
                
                <Box>
                  <Typography variant="body1">{item.label}</Typography>
                </Box>
                <Box>
                  <Typography variant="body1">
                    {calculateDiff(item.count, index, itemindex)}
                </Typography>
                </Box>
                
              </Box>
            ))}
          </Card>
      ))}
    </Box>


//<Box sx={{ width: 360, height: 60/*,p: 4*/, bgcolor: 'grey.100', /*borderRadius: 2,*/ boxShadow: 3 }}>
//{/* 左右分割（1:2）のコンテナ */}
//<Box sx={{ width: 360, height: 60,display: 'flex', gap: 3 }}>
//  {/* 左側ボックス (1/3) */}
//  <Box sx={{ width: '33.33%', p: 2, bgcolor: 'primary.light', borderRadius: 1, boxShadow: 1 }}>
//    左エリア (1/3)
//  </Box>
//
//  {/* 右側ボックス (2/3) */}
//  <Box sx={{ width: '66.67%', p: 2, bgcolor: 'success.light', borderRadius: 1, boxShadow: 1 }}>
//    {/* 上下分割（1:3）のコンテナ */}
//    <Box sx={{ display: 'flex', flexDirection: 'column', /*gap: 2,*/ height: '100%' }}>
//      {/* 上部ボックス (1/4) */}
//      <Box sx={{ height: '25%', /*p: 2,*/ bgcolor: 'success.main', borderRadius: 1, boxShadow: 1 }}>
//        上部エリア (1/4)
//      </Box>
//
//      {/* 下部ボックス (3/4) */}
//      <Box sx={{ height: '75%', p: 2, bgcolor: 'success.dark', borderRadius: 1, boxShadow: 1 }}>
//        {/* 3分割のコンテナ */}
//        <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
//          {/* 左ボックス */}
//          <Box sx={{ flex: 1, p: 2, bgcolor: 'warning.light', borderRadius: 1, boxShadow: 1 }}>
//            左セクション
//          </Box>
//
//          {/* 中央ボックス */}
//          <Box sx={{ flex: 1, p: 2, bgcolor: 'warning.main', borderRadius: 1, boxShadow: 1 }}>
//            {/* 中央ボックスの上下分割 */}
//            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
//              <Box sx={{ flex: 1, p: 1, bgcolor: 'orange.light', borderRadius: 1, boxShadow: 1 }}>
//                上部
//              </Box>
//              <Box sx={{ flex: 1, p: 1, bgcolor: 'orange.main', borderRadius: 1, boxShadow: 1 }}>
//                下部
//              </Box>
//            </Box>
//          </Box>
//
//          {/* 右ボックス */}
//          <Box sx={{ flex: 1, p: 2, bgcolor: 'warning.light', borderRadius: 1, boxShadow: 1 }}>
//            右セクション
//          </Box>
//        </Box>
//      </Box>
//    </Box>
//  </Box>
//</Box>
//</Box>*/
  );
  };

export default CommitDiffDisplay;
