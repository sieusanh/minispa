import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// Ensure the secret is encoded to a Uint8Array for jose
const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-at-least-32-chars-long'
);

// Sign a new token
export async function signToken(payload: Record<string, unknown>) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' }) // Use HS256 algorithm
    .setIssuedAt()
    // .setExpirationTime('2h') // Token expires in 2 hours
    .sign(SECRET);
}

// Verify an existing token
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  } catch (error) {
    console.log('======= verifyToken error: ', error);
    return null; // Token is expired or invalid
  }
}

export async function setServerCookie(
  key: string,
  value: string,
  maxAge: number = 1536000
) {
  const cookieStore = await cookies();

  // Save session in an HTTP-only cookie for security
  cookieStore.set(key, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    //   maxAge: 60 * 60 * 24, // 1 day
    maxAge,
  });
}
