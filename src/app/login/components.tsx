'use client';

import { SubmitEvent, useState, useTransition } from 'react';
import { loginAction } from '@/lib/data/staff';
import { useRouter } from 'next/navigation';

export function LoginForm({
  handleSetToken,
}: {
  handleSetToken: (t: string) => Promise<void>;
}) {
  const [error, setError] = useState('');
  const [isSaving, startSubmitting] = useTransition();
  const router = useRouter();

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    startSubmitting(async () => {
      event.preventDefault();

      const formData = new FormData(event.currentTarget);
      const username = formData.get('username') as string;
      const password = formData.get('password') as string;

      try {
        const accessToken = await loginAction({ username, password });

        await handleSetToken(accessToken);
        setError('');
        router.refresh();
        router.push('/bookings');
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(String(error));
        }
      }
    });
  }

  return (
    <div
      style={{
        maxWidth: '300px',
        margin: '4rem auto',
        width: '400px',
        height: '300px',
        backgroundColor: 'lightblue',
        color: 'black',
        textAlign: 'center',
      }}
    >
      {/* <h2>Đăng nhập</h2> */}
      <h2>Tài khoản</h2>
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          alignItems: 'center',
        }}
      >
        <input
          name="username"
          type="username"
          placeholder="Nhập username"
          //   required
          style={{
            padding: '0.5rem',
            backgroundColor: 'lightgreen',
            marginTop: '40px',
            border: '2px solid orange',
            width: '80%',
            textAlign: 'center',
          }}
        />
        <input
          name="password"
          type="password"
          placeholder="Nhập mật khẩu"
          //   required
          style={{
            padding: '0.5rem',
            backgroundColor: 'lightgreen',
            border: '2px solid orange',
            width: '80%',
            textAlign: 'center',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '0.5rem',
            cursor: 'pointer',
            border: '2px solid aqua radius',
            borderRadius: '9px',
          }}
        >
          {isSaving ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
    </div>
  );
}
