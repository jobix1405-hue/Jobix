import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  try {
    // ۱. دریافت پارامترهای برگشتی از بانک در URL
    const url = new URL(req.url);
    const authority = url.searchParams.get('Authority');
    const status = url.searchParams.get('Status'); // OK یا NOK

    // اگر کاربر پرداخت رو لغو کرده بود
    if (status !== 'OK' || !authority) {
      return NextResponse.redirect(new URL('/employer/packages?payment=failed', req.url));
    }

    // ۲. تنظیم دیتابیس
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll() } } }
    );

    // ۳. پیدا کردن تراکنش معلق با این Authority در دیتابیس
    const { data: transaction } = await supabase
      .from('transactions')
      .select('*, packages(*)')
      .eq('reference_id', authority)
      .eq('status', 'pending')
      .single();

    if (!transaction) {
      return NextResponse.redirect(new URL('/employer/packages?payment=invalid', req.url));
    }

    const pkg = transaction.packages as any;
    let isSuccess = false;
    let refId = authority;

    // ۴. تایید نهایی پرداخت از سرور زرین‌پال
    if (authority.startsWith('MOCK_')) {
      // این بخش برای شبیه‌سازی تسته (چون مرچنت کد نداریم)
      isSuccess = true;
    } else {
      const MERCHANT_ID = process.env.ZARRINPAL_MERCHANT_ID || '';
      const zarrinpalRes = await fetch('https://api.zarinpal.com/pg/v4/payment/verify.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchant_id: MERCHANT_ID,
          amount: transaction.amount,
          authority: authority
        })
      });
      const zarrinpalData = await zarrinpalRes.json();
      
      if (zarrinpalData.data?.code === 100 || zarrinpalData.data?.code === 101) {
        isSuccess = true;
        refId = zarrinpalData.data.ref_id.toString(); // کد رهگیری واقعی بانک
      }
    }

    // ۵. اگر پرداخت موفق بود، حساب کاربر رو شارژ می‌کنیم
    if (isSuccess) {
      // آپدیت تراکنش به موفق
      await supabase.from('transactions').update({ 
        status: 'success', 
        reference_id: refId 
      }).eq('id', transaction.id);

      // چک می‌کنیم کارفرما قبلاً سهمیه داشته یا نه
      const { data: currentSub } = await supabase
        .from('employer_subscriptions')
        .select('*')
        .eq('employer_id', transaction.employer_id)
        .single();

      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + pkg.duration_days);

      if (currentSub) {
        await supabase.from('employer_subscriptions').update({
          total_jobs: currentSub.total_jobs + pkg.job_count,
          expires_at: expireDate.toISOString()
        }).eq('id', currentSub.id);
      } else {
        await supabase.from('employer_subscriptions').insert({
          employer_id: transaction.employer_id,
          total_jobs: pkg.job_count,
          used_jobs: 0,
          expires_at: expireDate.toISOString()
        });
      }

      // هدایت به صفحه ثبت آگهی با پیغام موفقیت
      return NextResponse.redirect(new URL('/employer/post-job?payment=success', req.url));
    } else {
      // آپدیت تراکنش به ناموفق
      await supabase.from('transactions').update({ status: 'failed' }).eq('id', transaction.id);
      return NextResponse.redirect(new URL('/employer/packages?payment=failed', req.url));
    }

  } catch (error) {
    console.error('Payment Verify Error:', error);
    return NextResponse.redirect(new URL('/employer/packages?payment=error', req.url));
  }
}