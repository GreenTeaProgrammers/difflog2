import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-var(--app-header-height))] items-center justify-center">
      <RegisterForm />
    </div>
  );
}
