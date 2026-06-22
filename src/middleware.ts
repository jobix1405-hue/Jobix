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

  // ۱. چک کردن دسترسی: اگر لاگین نبود و می‌خواست بره تو پنل‌ها (حالا پنل ادمین هم اضافه شد)
  if (!user && (pathname.startsWith('/admin') || pathname.startsWith('/dashboard') || pathname.includes('employer') || pathname.includes('job-seeker'))) {
    const url = request.nextUrl.clone()
    
    // 🔥 اضافه کردن مسیری که کاربر قصد داشت بره به پارامترهای URL
    url.searchParams.set('next', pathname) 
    url.pathname = '/login' 
    
    // ریدایرکت به صفحه لاگین
    return NextResponse.redirect(url)
  }

  // ۲. محافظت از مسیر ادمین (اگر لاگین بود ولی نقشش ادمین نبود)
  if (user && pathname.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profile?.role !== 'admin') {
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
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}