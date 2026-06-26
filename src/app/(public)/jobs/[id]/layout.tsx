import { Metadata } from 'next';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: job } = await supabase
    .from('jobs')
    .select('title, description, profiles(company_name)')
    .eq('id', params.id)
    .single();

  if (!job) {
    return { title: 'آگهی یافت نشد | جابیکس' };
  }

  const profiles = (job as any).profiles;
  const companyName = Array.isArray(profiles) ? profiles[0]?.company_name : profiles?.company_name;

  return {
    title: `استخدام ${job.title} در ${companyName || 'شرکت نامشخص'} | جابیکس`,
    description: job.description.substring(0, 160) + '...',
  };
}

export default async function JobLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: job } = await supabase
    .from('jobs')
    .select('*, profiles(company_name, logo_url, address)')
    .eq('id', params.id)
    .single();

  let jsonLd = null;
  if (job) {
    const profiles = (job as any).profiles;
    const employer = Array.isArray(profiles) ? profiles[0] : profiles;
    
    const datePosted = new Date(job.created_at).toISOString();
    const validThrough = new Date(new Date(job.created_at).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    jsonLd = {
      '@context': 'https://schema.org/',
      '@type': 'JobPosting',
      'title': job.title,
      'description': job.description,
      'datePosted': datePosted,
      'validThrough': validThrough,
      'employmentType': job.job_type === 'full-time' ? 'FULL_TIME' : job.job_type === 'part-time' ? 'PART_TIME' : 'OTHER',
      'hiringOrganization': {
        '@type': 'Organization',
        'name': employer?.company_name || 'نامشخص',
        // 👇 آدرس دامنه به jobixx.ir تغییر کرد
        'logo': employer?.logo_url || 'https://jobixx.ir/logo-full.webp'
      },
      'jobLocation': {
        '@type': 'Place',
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': job.location_text || 'ایران',
          'addressCountry': 'IR'
        }
      }
    };
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}