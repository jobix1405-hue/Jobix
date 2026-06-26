import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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

  // ۱. چک کردن لاگین بودن برای مسیرهای محافظت شده
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.searchParams.set('next', pathname) 
    url.pathname = '/login' 
    return NextResponse.redirect(url)
  }

  // ۲. بررسی مسدود بودن کاربر و دسترسی‌های خاص
  if (user && isProtectedRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_banned')
      .eq('id', user.id)
      .single()
    
    // اگر کاربر مسدود شده بود
    if (profile?.is_banned) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('error', 'banned')
      return NextResponse.redirect(url)
    }

    // 🔥 فیکس جدید: اگر کاربر نقشی نداشت (null بود) اصلاً حق ورود به هیچ پنلی رو نداره
    if (!profile?.role) {
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    }

    // محافظت اختصاصی از مسیر ادمین
    if (pathname.startsWith('/admin') && profile?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/' // اگر ادمین نبود، پرت بشه صفحه اصلی سایت
      return NextResponse.redirect(url)
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