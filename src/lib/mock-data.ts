// انواع تایپ‌ها برای اطمینان از صحت دیتا
export interface Job {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  location: string;
  type: 'full-time' | 'part-time' | 'remote' | 'internship';
  salary: string;
  category: string;
  description: string;
  postedAt: string;
  logo: string;
}

export const MOCK_COMPANIES = [
  { id: 'c1', name: 'دیجی‌کالا', logo: 'د', website: 'digikala.com' },
  { id: 'c2', name: 'اسنپ', logo: 'ا', website: 'snapp.ir' },
  { id: 'c3', name: 'تپسی', logo: 'ت', website: 'tapsi.ir' },
];

export const MOCK_JOBS: Job[] = [
  {
    id: '1',
    title: 'برنامه‌نویس ارشد React',
    companyId: 'c1',
    companyName: 'دیجی‌کالا',
    location: 'تهران، ونک',
    type: 'full-time',
    salary: '۳۰ تا ۴۰ میلیون',
    category: 'software',
    description: 'توضیحات کامل آگهی دیجی‌کالا...',
    postedAt: '۲ ساعت پیش',
    logo: 'د'
  },
  {
    id: '2',
    title: 'طراح UI/UX',
    companyId: 'c2',
    companyName: 'اسنپ',
    location: 'دورکاری',
    type: 'remote',
    salary: 'توافقی',
    category: 'design',
    description: 'توضیحات کامل آگهی اسنپ...',
    postedAt: '۵ ساعت پیش',
    logo: 'ا'
  },
  {
    id: '3',
    title: 'مدیر محصول',
    companyId: 'c3',
    companyName: 'تپسی',
    location: 'تهران، سعادت آباد',
    type: 'full-time',
    salary: '۲۵ تا ۳۵ میلیون',
    category: 'software',
    description: 'توضیحات کامل آگهی تپسی...',
    postedAt: '۱ روز پیش',
    logo: 'ت'
  }
];