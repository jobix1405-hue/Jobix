import { create } from 'zustand';

// تعریف دقیق مدل پروفایل کاربر
export interface UserProfile {
  id: string;
  phone: string;
  role?: 'employer' | 'job_seeker' | 'admin' | null;
  // در آینده فیلدهای دیگه مثل نام و عکس هم اینجا اضافه میشه
}

interface AppState {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  
  isAuthLoading: boolean; // برای هندل کردن زمان لودینگ اولیه چک کردن سشن
  setIsAuthLoading: (loading: boolean) => void;

  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  
  isAuthLoading: true, 
  setIsAuthLoading: (loading) => set({ isAuthLoading: loading }),

  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));