import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Container, Avatar, Button } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { register } from "../../services/authService";
import { RegisterInput } from "../../types/user";
import {
  StyledTextField,
  AuthContainer,
  FormBox,
  SubmitButton,
} from "./AuthStyle";

const Register: React.FC = () => {
  // フォームデータの状態管理
  const [formData, setFormData] = useState<RegisterInput>({
    username: "",
    email: "",
    password: "",
  });

  // パスワード確認用の状態管理
  const [confirmPassword, setConfirmPassword] = useState("");

  // エラーメッセージの状態管理
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const navigate = useNavigate();

  // フォームバリデーション関数
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // パスワードのバリデーション
    if (formData.password.length < 6) {
      newErrors.password = "パスワードは6文字以上である必要があります。";
    }

    // パスワード確認
    if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = "パスワードが一致しません。";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 入力フィールドの変更を処理する関数
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // フォーム送信を処理する関数
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        await register(formData);
        navigate("/login"); // 登録成功時にログインページに遷移
      } catch (err) {
        setErrors({ submit: "登録に失敗しました。もう一度お試しください。" });
      }
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <AuthContainer elevation={6}>
        <Avatar sx={{ m: 1, bgcolor: "primary.main", width: 56, height: 56 }}>
          <LockOutlinedIcon fontSize="large" />
        </Avatar>
        <Typography component="h1" variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
          ユーザー登録
        </Typography>
        {errors.submit && (
          <Typography color="error">{errors.submit}</Typography>
        )}
        <FormBox component="form" onSubmit={handleSubmit}>
          {/* ユーザー名入力フィールド */}
          <StyledTextField
            required
            fullWidth
            id="username"
            label="ユーザー名"
            name="username"
            autoComplete="username"
            autoFocus
            value={formData.username}
            onChange={handleChange}
            variant="outlined"
          />
          {/* メールアドレス入力フィールド */}
          <StyledTextField
            required
            fullWidth
            id="email"
            label="メールアドレス"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
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
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            variant="outlined"
          />
          {/* パスワード確認入力フィールド */}
          <StyledTextField
            required
            fullWidth
            name="confirmPassword"
            label="パスワード（確認）"
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            variant="outlined"
          />
          {/* 登録ボタン */}
          <SubmitButton
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
          >
            登録
          </SubmitButton>
          <Button
            fullWidth
            variant="text"
            onClick={() => navigate("/login")}
            sx={{ mt: 2, textTransform: "none" }}
          >
            すでにアカウントをお持ちの方はこちら
          </Button>
        </FormBox>
      </AuthContainer>
    </Container>
  );
};

export default Register;