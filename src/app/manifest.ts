import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'جابیکس | بازار هوشمند استخدام',
    short_name: 'جابیکس',
    description: 'پلتفرم هوشمند کاریابی، استخدام و رزومه‌ساز آنلاین در ایران',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#1e3a8a',
    orientation: 'portrait-primary',
    dir: 'rtl',
    lang: 'fa-IR',
    icons: [
      {
        src: '/icon-192.png', // اشاره به فایل کوچیک‌تر
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icon-512.png', // اشاره به فایل بزرگ‌تر
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      }
    ],
  }
}