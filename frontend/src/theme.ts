import { createTheme } from "@mui/material/styles";

// カスタムカラーパレットの定義
const customColors = {
  primary: {
    main: "#3f51b5", // インディゴ色（青みがかった色）
    light: "#757de8",
    dark: "#002984",
    contrastText: "#ffffff",
  },
  secondary: {
    main: "#f50057",
    light: "#ff4081",
    dark: "#c51162",
    contrastText: "#ffffff",
  },
};

// テーマの作成
const theme = createTheme({
  palette: {
    primary: customColors.primary,
    secondary: customColors.secondary,
    background: {
      default: "#f5f5f5", // 薄いグレー
      paper: "#ffffff",
    },
    text: {
      primary: "rgba(0, 0, 0, 0.87)",
      secondary: "rgba(0, 0, 0, 0.54)",
    },
  },
  typography: {
    fontFamily: [
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
  },
});

export default theme;