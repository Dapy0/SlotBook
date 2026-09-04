import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const restrictedUrls = ['/dashboard'];
export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  for (const restricted of restrictedUrls) {
    if (request.nextUrl.pathname.startsWith(restricted) && !token) {
      return NextResponse.redirect(new URL('/register', request.url));
    }
  }
  if (
    (request.nextUrl.pathname.startsWith('/login') ||
      request.nextUrl.pathname.startsWith('/register')) &&
    token
  ) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register', '/account'],
};
