
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  
  const { pathname } = request.nextUrl;

  // صفحات لا تحتاج إلى تسجيل دخول
  const publicPaths = [
    "/auth/signin",
    "/auth/signup",
    "/api/auth",
    "/api/signup",
  ];

  // تحقق إذا كان المسار عام
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // إذا لم يكن المستخدم مسجل دخول ويحاول الوصول لصفحة محمية
  if (!token && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/signin";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // إذا كان المستخدم مسجل دخول ويحاول الوصول لصفحة تسجيل الدخول
  if (token && (pathname === "/auth/signin" || pathname === "/auth/signup")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * مطابقة جميع المسارات ما عدا:
     * - _next/static (ملفات ثابتة)
     * - _next/image (ملفات صور محسنة)
     * - favicon.ico (أيقونة)
     * - ملفات عامة (png, jpg, jpeg, gif, svg, webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp)$).*)",
  ],
};
