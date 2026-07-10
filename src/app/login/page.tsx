import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LoginForm } from './components';
import { setServerCookie } from '@/utils/auth';

export default async function LoginPage() {
  const cookieStore = await cookies();

  // Redirect to dashboard immediately if already authenticated
  if (cookieStore.has('access_token')) {
    redirect('/bookings');
  }

  // redirect('/');
  // redirect('/login?error=Invalid credentials');

  async function handleSetToken(accessToken: string) {
    'use server';
    await setServerCookie('access_token', accessToken);
  }

  return <LoginForm handleSetToken={handleSetToken} />;
}
