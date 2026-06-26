import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { packageId } = await req.json();

    if (!packageId) {
      return NextResponse.json({ error: 'آیدی بسته نامعتبر است' }, { status: 400 });
    }

    // ۱. ساخت کلاینت سوپابیس برای خواندن سشن و دیتابیس
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll() } } }
    );

    // ۲. بررسی لاگین بودن کاربر
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'احراز هویت نشده‌اید' }, { status: 401 });

    // ۳. دریافت اطلاعات بسته از دیتابیس
    const { data: pkg, error: pkgError } = await supabase
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .single();

    if (pkgError || !pkg) {
      return NextResponse.json({ error: 'بسته مورد نظر یافت نشد' }, { status: 404 });
    }

    // ۴. ارتباط با سرور زرین‌پال
    const MERCHANT_ID = process.env.ZARRINPAL_MERCHANT_ID || 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
    const amountInRial = pkg.price; // قیمت در دیتابیس ما به ریال است
    const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/payment/verify`;

    const zarrinpalRes = await fetch('https://api.zarinpal.com/pg/v4/payment/request.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merchant_id: MERCHANT_ID,
        amount: amountInRial,
        description: `خرید بسته ${pkg.name} - جابیکس`,
        callback_url: callbackUrl,
        metadata: { mobile: user.phone }
      })
    });

    const zarrinpalData = await zarrinpalRes.json();

    if (zarrinpalData.data?.code === 100) {
      const authority = zarrinpalData.data.authority;

      // ۵. ثبت موقت تراکنش در دیتابیس (وضعیت pending)
      await supabase.from('transactions').insert({
        employer_id: user.id,
        package_id: pkg.id,
        amount: amountInRial,
        status: 'pending',
        reference_id: authority
      });

      // ۶. بازگرداندن لینک درگاه به فرانت‌اند
      return NextResponse.json({ url: `https://www.zarinpal.com/pg/StartPay/${authority}` });
    } else {
      // حالت شبیه‌ساز (زمان‌هایی که مرچنت کد واقعی نداریم)
      // در اینجا الکی یک لینک میسازیم که بتونیم تست کنیم
      const mockAuthority = `MOCK_${Math.random().toString(36).substring(2, 10)}`;
      
      await supabase.from('transactions').insert({
        employer_id: user.id,
        package_id: pkg.id,
        amount: amountInRial,
        status: 'pending',
        reference_id: mockAuthority
      });

      // به جای درگاه واقعی، مستقیم می‌فرستیمش به صفحه وریفای خودمون که تست کنیم
      return NextResponse.json({ 
        url: `${callbackUrl}?Authority=${mockAuthority}&Status=OK`,
        isMock: true 
      });
    }

  } catch (error: any) {
    console.error('Payment Request Error:', error);
    return NextResponse.json({ error: 'خطای سرور داخلی' }, { status: 500 });
  }
}