import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// 🔥 رفع ارور ورسل: حتماً باید default export باشد
export default async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // راه‌اندازی کلاینت سوپابیس برای خواندن کوکی‌ها در سرور
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // دریافت اطلاعات کاربر فعلی
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isProtectedRoute = pathname.startsWith('/admin') || pathname.startsWith('/dashboard') || pathname.includes('employer') || pathname.includes('job-seeker');

  // 🔥 فیکس فوق‌العاده مهم: تابع کمکی برای انتقال کوکی‌ها به ریسپانس دایرکت شده
  // اگر این نباشد، کوکی‌های سوپابیس در هنگام ریدایرکت پاک می‌شوند و کاربر دوباره لاگ‌اوت می‌شود
  const applyCookiesAndRedirect = (url: URL) => {
    const redirectRes = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectRes.cookies.set(cookie.name, cookie.value)
    })
    return redirectRes
  }

  // ۱. چک کردن لاگین بودن برای مسیرهای محافظت شده
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.searchParams.set('next', pathname) 
    url.pathname = '/login' 
    return applyCookiesAndRedirect(url)
  }

  // ۲. بررسی مسدود بودن کاربر و دسترسی‌های خاص
  if (user && isProtectedRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_banned')
      .eq('id', user.id)
      .maybeSingle() // 🔥 جایگزین کردن single با maybeSingle تا باعث کرش (PGRST116) نشود
    
    // اگر کاربر مسدود شده بود
    if (profile?.is_banned) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('error', 'banned')
      return applyCookiesAndRedirect(url)
    }

    // اگر کاربر نقشی نداشت (ثبت‌نام ناقص بود) به صفحه Onboarding فرستاده شود
    if (!profile?.role && !pathname.startsWith('/onboarding')) {
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding'
      return applyCookiesAndRedirect(url)
    }

    // محافظت اختصاصی از مسیر ادمین
    if (pathname.startsWith('/admin') && profile?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/' // اگر ادمین نبود، پرت بشه صفحه اصلی سایت
      return applyCookiesAndRedirect(url)
    }
  }

  return supabaseResponse
}

// تنظیمات مچینگ: روی چه مسیرهایی این فایل اجرا بشه؟
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}