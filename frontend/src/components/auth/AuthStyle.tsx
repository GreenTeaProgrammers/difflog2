import { styled } from "@mui/material/styles";
import { Paper, Box, Button, TextField } from "@mui/material";

export const AuthContainer = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(8),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: theme.spacing(6),
  backgroundColor: "rgba(255, 255, 255, 0.95)",
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  backdropFilter: "blur(10px)",
}));

export const FormBox = styled(Box)(({ theme }) => ({
  width: "100%",
  marginTop: theme.spacing(3),
}));

export const SubmitButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
  padding: theme.spacing(1.5, 0),
  fontWeight: 600,
  fontSize: "1rem",
  textTransform: "none",
  borderRadius: theme.shape.borderRadius * 1.5,
}));

export const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  "& .MuiOutlinedInput-root": {
    borderRadius: theme.shape.borderRadius * 1.5,
    backgroundColor: theme.palette.background.paper,
    transition: theme.transitions.create([
      "border-color",
      "box-shadow",
      "background-color",
    ]),
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
    "&.Mui-focused": {
      backgroundColor: theme.palette.background.paper,
      boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
    },
  },
  "& .MuiInputLabel-outlined": {
    transform: "translate(14px, 16px) scale(1)",
    "&.MuiInputLabel-shrink": {
      transform: "translate(14px, -6px) scale(0.75)",
      backgroundColor: theme.palette.background.paper,
      padding: "0 4px",
    },
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.divider,
  },
}));
