"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Mock LoginInput type, will be replaced with actual type from types/user.ts later
type LoginInput = {
  email: string;
  password: string;
};

export function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginInput>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    console.log("Login form submitted with:", formData);
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    // In a real scenario, you would dispatch a login action here.
    // For now, we'll just simulate a successful login and redirect.
    // Example of error handling:
    // setError("Invalid email or password.");
    setLoading(false);
    router.push("/welcome"); // Redirect to a welcome page
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="flex flex-col items-center space-y-2">
          <div className="p-3 bg-primary rounded-full">
            <Lock className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            ログイン
          </h1>
        </div>

        {error && (
          <div className="p-3 text-center text-red-500 bg-red-100 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="email@example.com"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "ログイン中..." : "ログイン"}
          </Button>
          <Button
            type="button"
            variant="link"
            className="w-full"
            onClick={() => router.push("/register")}
          >
            アカウントをお持ちでない方はこちら
          </Button>
        </form>
      </div>
    </div>
  );
}
