import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Typography, Container, Avatar } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { login } from "../../services/authService";
import { LoginInput } from "../../types/user";
import {
  StyledTextField,
  AuthContainer,
  FormBox,
  SubmitButton,
} from "./AuthStyle";

const Login: React.FC = () => {
  // フォームデータの状態管理
  const [formData, setFormData] = useState<LoginInput>({
    email: "",
    password: "",
  });

  // エラーメッセージの状態管理
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // 入力フィールドの変更を処理する関数
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // フォーム送信を処理する関数
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const { username } = await login(formData);
      navigate(`/user/${username}`); // ユーザーページへリダイレクト
    } catch (err) {
      console.error("Login error details:", err);
      setError("ログインに失敗しました。メールアドレスとパスワードを確認してください。");
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <AuthContainer elevation={6}>
        <Avatar sx={{ m: 1, bgcolor: "primary.main", width: 56, height: 56 }}>
          <LockOutlinedIcon fontSize="large" />
        </Avatar>
        <Typography component="h1" variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
          ログイン
        </Typography>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <FormBox component="form" onSubmit={handleSubmit}>
          {/* メールアドレス入力フィールド */}
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
          {/* パスワード入力フィールド */}
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
          {/* ログインボタン */}
          <SubmitButton
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
          >
            ログイン
          </SubmitButton>
          {/* 登録ページへのリンク */}
          <Button
            fullWidth
            variant="text"
            onClick={() => navigate("/register")}
            sx={{ mt: 2, textTransform: "none" }}
          >
            アカウントをお持ちでない方はこちら
          </Button>
        </FormBox>
      </AuthContainer>
    </Container>
  );
};

export default Login;