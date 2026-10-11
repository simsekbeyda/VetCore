export type UserRole = 'admin' | 'vet' | 'owner'

export interface User {
  id: number
  full_name: string
  email: string
  role: UserRole
  is_active: boolean
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  role: UserRole
}

export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  full_name: string
  email: string
  password: string
  role: UserRole
}
