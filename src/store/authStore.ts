import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types/index';
import { hashPassword } from '../utils/crypto';

interface AuthState {
  currentUser: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
}

const USERS_KEY = 'hicenter-users';

function getUsers(): User[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]') as User[];
  } catch {
    return [];
  }
}

function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,

      login: async (username, password) => {
        const users = getUsers();
        const hash = await hashPassword(password);
        const user = users.find(u => u.username === username && u.passwordHash === hash);
        if (user) {
          set({ currentUser: username });
          return true;
        }
        return false;
      },

      logout: () => set({ currentUser: null }),

      register: async (username, password) => {
        if (!username.trim() || !password.trim()) {
          return { success: false, error: 'Username and password are required.' };
        }
        if (password.length < 4) {
          return { success: false, error: 'Password must be at least 4 characters.' };
        }
        const users = getUsers();
        if (users.find(u => u.username === username)) {
          return { success: false, error: 'Username already taken.' };
        }
        const passwordHash = await hashPassword(password);
        saveUsers([...users, { username, passwordHash }]);
        set({ currentUser: username });
        return { success: true };
      },
    }),
    {
      name: 'hicenter-session',
      partialize: (state) => ({ currentUser: state.currentUser }),
    }
  )
);
