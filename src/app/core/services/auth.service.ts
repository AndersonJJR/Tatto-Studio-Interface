import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthenticatedUser, LoginRequestDTO, RegisterRequestDTO, TokenResponseDTO } from '../models/auth.models';
import { ToastService } from './toast.service';

const TOKEN_KEY = 'inkcraft_token';
const USER_KEY = 'inkcraft_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  private readonly tokenSignal = signal<string | null>(this.getStoredToken());
  private readonly userSignal = signal<AuthenticatedUser | null>(this.getStoredUser());

  public readonly token = this.tokenSignal.asReadonly();
  public readonly currentUser = this.userSignal.asReadonly();
  public readonly isAuthenticated = computed(() => !!this.tokenSignal());
  public readonly isArtist = computed(() => this.userSignal()?.role === 'ROLE_ARTIST');
  public readonly isClient = computed(() => this.userSignal()?.role === 'ROLE_CLIENT');

  login(dto: LoginRequestDTO): Observable<TokenResponseDTO> {
    return this.http.post<TokenResponseDTO>(`${environment.apiUrl}/auth/login`, dto).pipe(
      tap({
        next: (response) => {
          this.setSession(response);
          this.toast.success(`Bem-vindo de volta, ${response.name}!`);
        },
        error: (err) => {
          const msg = err.error?.message || 'Falha na autenticação. Verifique seu e-mail e senha.';
          this.toast.error(msg);
        }
      })
    );
  }

  register(dto: RegisterRequestDTO): Observable<TokenResponseDTO> {
    return this.http.post<TokenResponseDTO>(`${environment.apiUrl}/auth/register`, dto).pipe(
      tap({
        next: (response) => {
          this.setSession(response);
          this.toast.success(`Cadastro realizado com sucesso! Bem-vindo, ${response.name}.`);
        },
        error: (err) => {
          const msg = err.error?.message || 'Falha ao registrar conta. Verifique os dados informados.';
          this.toast.error(msg);
        }
      })
    );
  }

  logout(redirect: boolean = true): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    this.toast.info('Sessão encerrada com segurança.');
    if (redirect) {
      this.router.navigate(['/portfolio']);
    }
  }

  private setSession(res: TokenResponseDTO): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    const user: AuthenticatedUser = {
      id: res.userId,
      name: res.name,
      email: res.email,
      role: res.role
    };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.tokenSignal.set(res.token);
    this.userSignal.set(user);
  }

  private getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  private getStoredUser(): AuthenticatedUser | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthenticatedUser;
    } catch {
      return null;
    }
  }
}
