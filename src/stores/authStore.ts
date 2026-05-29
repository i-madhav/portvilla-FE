import { create } from 'zustand'
import api from '@/lib/api'

interface AuthState {
  token: string | null
  user: { id: string; email: string; username: string } | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, username: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('portvilla_token'),
  user: null,
  isLoading: true,

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('portvilla_token', data.accessToken)
    set({ token: data.accessToken, user: data.user })
  },

  register: async (email, password, username) => {
    const { data } = await api.post('/auth/register', { email, password, username })
    return data
  },

  logout: () => {
    localStorage.removeItem('portvilla_token')
    set({ token: null, user: null })
  },

  checkAuth: async () => {
    try {
      const token = localStorage.getItem('portvilla_token')
      if (!token) {
        set({ isLoading: false })
        return
      }
      const { data } = await api.get('/auth/me')
      set({ user: data, isLoading: false })
    } catch {
      localStorage.removeItem('portvilla_token')
      set({ token: null, user: null, isLoading: false })
    }
  },
}))
