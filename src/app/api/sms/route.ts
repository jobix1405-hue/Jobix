import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { phone, name, jobTitle, customMessage } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: 'شماره موبایل الزامی است' }, { status: 400 });
    }

    const apiKey = process.env.SMS_API_KEY;
    
    // اگر متن سفارشی داده شده بود آن را بفرست، در غیر این صورت متن دیفالت
    const message = customMessage || `کارجوی گرامی ${name}، شما برای موقعیت شغلی "${jobTitle}" به مصاحبه دعوت شدید. لطفاً پنل جابیکس خود را بررسی کنید.`;

    // اگر کلید واقعی پیامک رو هنوز تو فایل env نذاشته بودیم، برنامه کرش نمیکنه و فقط تو کنسول چاپ میکنه
    if (!apiKey || apiKey === 'test_api_key_for_now') {
      console.log(`[شبیه‌ساز ارسال پیامک به ${phone}]: ${message}`);
      return NextResponse.json({ success: true, simulated: true });
    }

    // جایگاه اتصال به وب‌سرویس پیامکی (مثل کاوه‌نگار یا ملی‌پیامک) در آینده
    // await fetch(`https://api.kavenegar.com/v1/${apiKey}/sms/send.json?receptor=${phone}&message=${encodeURIComponent(message)}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('SMS API Error:', error);
    return NextResponse.json({ error: 'خطا در ارسال پیامک' }, { status: 500 });
  }
}