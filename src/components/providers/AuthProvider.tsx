"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useStore } from "@/store/useStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setIsAuthLoading } = useStore();
  const supabase = createClient();

  useEffect(() => {
    // تابع بررسی وضعیت سشن در لحظه لود شدن سایت
    const initializeAuth = async () => {
      setIsAuthLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // واکشی پروفایل از دیتابیس (برای تشخیص نقش کاربر)
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          setUser({
            id: session.user.id,
            phone: session.user.phone || '',
            role: profile?.role || null,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth Initialization Error:", error);
        setUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    initializeAuth();

    // گوش دادن به تغییرات ورود و خروج به صورت لحظه‌ای
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setUser({
          id: session.user.id,
          phone: session.user.phone || '',
          role: profile?.role || null,
        });
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    // Cleanup function
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}