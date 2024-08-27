import api from "./api";
import { LoginInput, RegisterInput, User } from "../types/user";

export const register = async (input: RegisterInput): Promise<User> => {
  try {
    const response = await api.post<User>("/register", input);
    return response.data;
  } catch (error) {
    console.error("Registration failed:", error);
    throw error;
  }
};

export const login = async (
  input: LoginInput
): Promise<{ token: string; username: string; message: string }> => {
  try {
    const response = await api.post<{ token: string; username: string; message: string }>(
      "/login",
      input
    );
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("username", response.data.username); // ユーザー名を保存
    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await api.post("/logout");
    localStorage.removeItem("token");
    localStorage.removeItem("username"); // ログアウト時にユーザー名を削除
  } catch (error) {
    console.error("Logout failed:", error);
    throw error;
  }
};

export const getProfileByUsername = async (username: string): Promise<User | null> => {
  try {
    const response = await api.get<User>(`/profile/${username}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return null;
  }
};


