export type UserRole = 'ROLE_CLIENT' | 'ROLE_ARTIST';

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface RegisterRequestDTO {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
  specialty?: string;
  bio?: string;
  preferences?: string;
}

export interface TokenResponseDTO {
  token: string;
  type: string;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
