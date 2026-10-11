import api from './api'
import type { LoginForm, RegisterForm, TokenResponse, User } from '@/types/auth'

export const authService = {
  async login(data: LoginForm): Promise<TokenResponse> {
    const res = await api.post<TokenResponse>('/auth/login', data)
    return res.data
  },

  async register(data: RegisterForm): Promise<User> {
    const res = await api.post<User>('/auth/register', data)
    return res.data
  },

  async me(): Promise<User> {
    const res = await api.get<User>('/auth/me')
    return res.data
  },

  logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  },
}
