import { Box, Paper, Typography } from "@mui/material";
import React, { useState } from 'react';

const [selectedLocation, setSelectedLocation] = useState('desk');


<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {commits.map((commit) => (//arrayの要素数を、検知した物体の種類数に指定したい
          <Paper //selectedLocationは選択されているロケーションの情報を持っている。物体の名称(ラベル名)とアイコンを表示したい(アイコン名はjsonファイルを参照)。検出した物体の、前回との差分情報を取得したい(resultpageを参照？)
            key={commit}
            elevation={3}
            sx={{ p: 2, bgcolor: "grey.800", color: "white" }}
          >
            <Typography variant="body1">
                {commit.data.label}
            </Typography>
            <Typography variant="body2">
                commit.data.count
            </Typography>
            <Box>
                {commit.data.count - commit.data.count}
            </Box>

          </Paper> // ここでは今回のコミット(commit.count)と前回`のコミットでの物体数の差分を見たい
        ))}
      </Box>