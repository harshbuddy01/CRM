import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UserData = {
  id: string;
  name: string;
  email: string;
  role: string;
  roleLabel: string;
  mobileOnly: boolean;
  permissions: Record<string, boolean>;
};

interface AuthState {
  user: UserData | null;
  accessToken: string | null;
  setAuth: (user: UserData, accessToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setAuth: (user, accessToken) => set({ user, accessToken }),
      logout: () => {
        set({ user: null, accessToken: null });
        localStorage.removeItem('refreshToken');
      },
    }),
    {
      name: 'auth-storage',
      // We only persist the user minimal data and access token in Zustand local storage.
      // Refresh token can be kept separate for added security or handled manually.
    }
  )
);
