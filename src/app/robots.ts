import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/', 
        '/employer/', 
        '/job-seeker/', 
        '/api/'
      ],
    },
    // 👇 آدرس نقشه سایت به jobixx.ir تغییر کرد
    sitemap: 'https://jobixx.ir/sitemap.xml', 
  };
}