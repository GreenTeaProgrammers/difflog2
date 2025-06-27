"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/app/actions/auth";

const initialState = {
  message: "",
};

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "ログイン中..." : "ログイン"}
    </Button>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [state, formAction] = useFormState(login, initialState);

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

        {state?.message && (
          <div className="p-3 text-center text-red-500 bg-red-100 rounded-md">
            {state.message}
          </div>
        )}

        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="email@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
            />
          </div>
          <LoginButton />
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
