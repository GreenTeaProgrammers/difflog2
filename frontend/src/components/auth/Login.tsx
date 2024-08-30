import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Typography, Container, Avatar } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useAppDispatch, useAppSelector } from "../../../store";
import { login } from "../../../store/authSlice";
import { LoginInput } from "../../../types/user";
import {StyledTextField,AuthContainer,FormBox,SubmitButton,
} from "./AuthStyle";

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const authState = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState<LoginInput>({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(login(formData)).unwrap();
      navigate(`/welcome`);
    } catch (err) {
      console.error("Login error details:", err);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <AuthContainer elevation={6}>
        <Avatar sx={{ m: 1, bgcolor: "primary.main", width: 56, height: 56 }}>
          <LockOutlinedIcon fontSize="large" />
        </Avatar>
        <Typography component="h1" variant="h4" sx={{ mb: 3, fontWeight: 700 , color: 'black' }}>
          ログイン
        </Typography>
        {authState.error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {authState.error}
          </Typography>
        )}
        <FormBox component="form" onSubmit={handleSubmit}>
          <StyledTextField
            required
            fullWidth
            id="email"
            label="メールアドレス"
            name="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleChange}
            variant="outlined"
          />
          <StyledTextField
            required
            fullWidth
            name="password"
            label="パスワード"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            variant="outlined"
          />
          <SubmitButton
            onClick={() => navigate("/welcome")}
            type="submit"
            fullWidth
            variant="contained"
            disabled={authState.status === 'loading'}
            sx={{
              backgroundColor: 'black',
              color: 'white',
              '&:hover': {
                backgroundColor: 'black',
              },
              '&:disabled': {
                backgroundColor: 'grey',
              }
            }}
          >
            ログイン
          </SubmitButton>
          <Button
            fullWidth
            variant="text"
            onClick={() => navigate("/register")}
            sx={{ mt: 2, textTransform: "none", color: 'black' }}
          >
            アカウントをお持ちでない方はこちら
          </Button>
        </FormBox>
      </AuthContainer>
    </Container>
  );
};

export default Login;