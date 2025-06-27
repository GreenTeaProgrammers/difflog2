import { WelcomeScreen } from '@/components/diff/welcome-screen';
import { cookies } from 'next/headers';

export default async function WelcomePage() {
  const cookieStore = await cookies();
  const username = cookieStore.get('username')?.value;
  return <WelcomeScreen username={username} />;
}
