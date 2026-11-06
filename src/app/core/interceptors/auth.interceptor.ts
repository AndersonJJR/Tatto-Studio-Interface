import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toastService = inject(ToastService);
  const token = authService.token();

  let clonedRequest = req;

  // Anexa o Bearer token apenas se houver token e a requisição for para a nossa API
  if (token && req.url.startsWith(environment.apiUrl)) {
    clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Se receber 401 e estava com token, a sessão expirou
        if (token) {
          toastService.error('Sua sessão expirou. Por favor, autentique-se novamente.');
          authService.logout(true);
        }
      } else if (error.status === 403) {
        toastService.error('Acesso negado: Você não possui permissão para executar esta ação.');
      }
      return throwError(() => error);
    })
  );
};
