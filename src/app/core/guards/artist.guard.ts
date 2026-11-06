import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const artistGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  if (authService.isAuthenticated() && authService.isArtist()) {
    return true;
  }

  toastService.error('Acesso restrito exclusivamente para tatuadores residentes.');
  return router.createUrlTree(['/portfolio']);
};
