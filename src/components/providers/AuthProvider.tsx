"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useStore } from "@/store/useStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setIsAuthLoading } = useStore();
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    // تابع بررسی وضعیت سشن در لحظه لود شدن سایت
    const initializeAuth = async () => {
      setIsAuthLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && mounted) {
          // واکشی پروفایل از دیتابیس (برای تشخیص نقش کاربر)
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle();

          setUser({
            id: session.user.id,
            phone: session.user.phone || '',
            role: profile?.role || null,
          });
        } else if (mounted) {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth Initialization Error:", error);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setIsAuthLoading(false);
      }
    };

    initializeAuth();

    // گوش دادن به تغییرات ورود و خروج به صورت لحظه‌ای
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();

        setUser({
          id: session.user.id,
          phone: session.user.phone || '',
          role: profile?.role || null,
        });
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    // Cleanup function برای جلوگیری از Memory Leak
    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}