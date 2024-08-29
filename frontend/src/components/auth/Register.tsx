import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Container, Avatar, Button } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useAppDispatch, useAppSelector } from "../../../store";
import { register } from "../../../store/authSlice";
import { RegisterInput } from "../../../types/user";
import {StyledTextField,AuthContainer,FormBox,SubmitButton,
} from "./AuthStyle";

const Register: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const authState = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState<RegisterInput>({
    username: "",
    email: "",
    password: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (formData.password.length < 6) {
      newErrors.password = "パスワードは6文字以上である必要があります。";
    }

    if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = "パスワードが一致しません。";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        await dispatch(register(formData)).unwrap();
        navigate("/login");
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
        <Typography component="h1" variant="h4" sx={{ mb: 3, fontWeight: 700, color: 'black'  }}>
          ユーザー登録
        </Typography>
        {errors.submit && (
          <Typography color="error">{errors.submit}</Typography>
        )}
        <FormBox component="form" onSubmit={handleSubmit}>
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
          <SubmitButton
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={authState.status === 'loading'}
          >
            登録
          </SubmitButton>
          <Button
            fullWidth
            variant="text"
            onClick={() => navigate("/login")}
            sx={{ mt: 2, textTransform: "none" , color: 'black' }}
          >
            すでにアカウントをお持ちの方はこちら
          </Button>
        </FormBox>
      </AuthContainer>
    </Container>
  );
};

export default Register;
