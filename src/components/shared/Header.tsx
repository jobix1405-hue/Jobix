import Image from 'next/image';
import Link from 'next/link';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
        
        {/* بخش لوگو (سمت راست در حالت RTL) */}
        <Link href="/" className="flex items-center transition-transform hover:scale-105">
          <Image
            src="/logo-minimal.webp"
            alt="لوگو جابیکس"
            width={120}
            height={40}
            className="object-contain"
            priority
          />
        </Link>

        {/* دکمه ورود / ثبت‌نام (سمت چپ) */}
        {/* بعداً لینک این بخش رو به /login متصل می‌کنیم */}
        <Link href="/login">
          <Button 
            variant="outline" 
            className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold shadow-sm transition-all duration-200 hover:border-[#f97316] hover:text-[#ea580c] hover:shadow-md"
          >
            <LogIn className="ml-2 h-4 w-4" aria-hidden="true" />
            ورود / ثبت نام
          </Button>
        </Link>
        
      </div>
    </header>
  );
}