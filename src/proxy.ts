import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, setServerCookie } from '@/utils/auth';

// 1. Specify protected and public routes
const protectedRoutes = ['/bookings', '/staff', '/customers'];
const publicRoutes = ['/login', '/signup', '/'];

export default async function proxy(req: NextRequest) {
  try {
    // 2. Check if the current route is protected or public
    const path = req.nextUrl.pathname;
    const isProtectedRoute = protectedRoutes.includes(path);
    const isPublicRoute = publicRoutes.includes(path);

    if (isPublicRoute) {
      //   return NextResponse.redirect(new URL(path, req.url)); // wrong logic
      return NextResponse.next();
    }

    // 3. Decrypt the session from the cookie
    //   const cookie = (await cookies()).get('access_token')?.value; // also:
    const token = req.cookies.get('access_token')?.value;

    // 4. Redirect to /login if the user is not authenticated
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.nextUrl));
    }

    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.redirect(new URL('/login', req.nextUrl));
    }

    const { id, name, role, username } = payload;

    if (isProtectedRoute && !id) {
      return NextResponse.redirect(new URL('/login', req.nextUrl));
    }

    // 5. Clone the request and inject user profile claims into custom headers
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', id as string);
    requestHeaders.set('x-user-username', username as string);
    requestHeaders.set('x-user-name', encodeURIComponent(name as string));
    requestHeaders.set('x-user-role', role as string);

    if (!id) {
      return NextResponse.redirect(new URL('/login', req.nextUrl));
    }

    await setServerCookie('username', username as string);

    // 6. Proceed if the user is authenticated
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.log('============= proxy error ', error);

    // Token is invalid/expired
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }
}

// Routes Proxy should not run on
// export const config = {
//   matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
// };

// export const config = {
//   matcher: ['/bookings/:path*', '/staff/:path*'],
// };

export const config = {
  matcher: [
    '/bookings/:path*',
    '/staff/:path*',
    '/customers/:path*',
    '/login',
    '/signup',
  ],
};
