import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Workspace } from '@/types'

interface AuthState {
  user: User | null
  workspace: Workspace | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setWorkspace: (workspace: Workspace | null) => void
  setLoading: (loading: boolean) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      workspace: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setWorkspace: (workspace) => set({ workspace }),
      setLoading: (isLoading) => set({ isLoading }),
      clearAuth: () => set({ user: null, workspace: null }),
    }),
{
  name: 'amana-auth',
  partialize: (state) => ({ user: state.user, workspace: state.workspace }),
  onRehydrateStorage: () => () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('amana-auth')
    }
  },
}
