import { Box, Card, Paper, Typography } from "@mui/material";
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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
  );
  };

export default CommitDiffDisplay;