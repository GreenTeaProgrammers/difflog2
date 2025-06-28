'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock } from 'lucide-react';
import { register } from '@/app/actions/auth';
import { useEffect, useState } from 'react';

const initialState = {
  message: '',
};

function RegisterButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? '登録中...' : '登録'}
    </Button>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [state, formAction] = useFormState(register, initialState);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (password.length > 0 && password.length < 6) {
        setPasswordError('パスワードは6文字以上である必要があります。');
    } else if (password !== confirmPassword && confirmPassword.length > 0) {
        setPasswordError('パスワードが一致しません。');
    } else {
        setPasswordError('');
    }
  }, [password, confirmPassword]);


  return (
    <div className="w-full max-w-md space-y-6 rounded-xl border bg-white p-8 shadow-lg">
      <div className="flex flex-col items-center space-y-2">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary">
          <Lock className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold">ユーザー登録</h1>
      </div>
      {state?.message && (
          <div className="p-3 text-center text-red-500 bg-red-100 rounded-md">
            {state.message}
          </div>
        )}
      <form action={formAction} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="username">ユーザー名</Label>
          <Input
            id="username"
            name="username"
            placeholder="your_username"
            required
            autoComplete="username"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">メールアドレス</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
            autoComplete="email"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="password">パスワード</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="confirmPassword">パスワード（確認）</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
        </div>
        <RegisterButton />
      </form>
      <Button variant="link" className="w-full" onClick={() => router.push('/login')}>
        すでにアカウントをお持ちの方はこちら
      </Button>
    </div>
  );
}
