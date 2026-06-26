import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // واکشی آگهی‌های فعال برای ساخت لینک داینامیک در نقشه سایت
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, updated_at')
    .eq('status', 'active');

  // آدرس پایه دامنه
  const baseUrl = 'https://jobixx.ir';

  // مسیرهای استاتیک (شامل صفحات اصلی و صفحاتی که جدیداً ساختیم)
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1, 
    },
    {
      url: `${baseUrl}/jobs`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/companies`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    }
  ];

  // مسیرهای داینامیک برای تک تک آگهی‌های کار
  const dynamicRoutes: MetadataRoute.Sitemap = (jobs || []).map((job) => ({
    url: `${baseUrl}/jobs/${job.id}`,
    lastModified: new Date(job.updated_at),
    changeFrequency: 'always',
    priority: 0.7,
  }));

  return [...staticRoutes, ...dynamicRoutes];
}