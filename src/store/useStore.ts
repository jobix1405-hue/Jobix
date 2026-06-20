import { create } from 'zustand';

interface AppState {
  user: any | null; // در مراحل بعد تایپ دقیق کاربر را مشخص می‌کنیم
  setUser: (user: any | null) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));