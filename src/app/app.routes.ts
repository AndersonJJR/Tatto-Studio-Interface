import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { artistGuard } from './core/guards/artist.guard';
import { clientGuard } from './core/guards/client.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'portfolio',
    pathMatch: 'full'
  },
  {
    path: 'portfolio',
    loadComponent: () =>
      import('./features/portfolio/components/portfolio-gallery.component').then(m => m.PortfolioGalleryComponent)
  },
  {
    path: 'portfolio/gerenciar',
    canActivate: [authGuard, artistGuard],
    loadComponent: () =>
      import('./features/portfolio/components/artist-portfolio-manage.component').then(m => m.ArtistPortfolioManageComponent)
  },
  {
    path: 'tatuadores',
    loadComponent: () =>
      import('./features/artists/components/artists-list.component').then(m => m.ArtistsListComponent)
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('./features/auth/components/login-cadastro.component').then(m => m.LoginCadastroComponent)
  },
  {
    path: 'login',
    redirectTo: 'auth',
    pathMatch: 'full'
  },
  {
    path: 'cadastro',
    redirectTo: 'auth',
    pathMatch: 'full'
  },
  {
    path: 'agendar',
    loadComponent: () =>
      import('./features/booking/components/booking-flow.component').then(m => m.BookingFlowComponent)
  },
  {
    path: 'agendamento',
    redirectTo: 'agendar',
    pathMatch: 'full'
  },
  {
    path: 'meus-agendamentos',
    canActivate: [authGuard, clientGuard],
    loadComponent: () =>
      import('./features/booking/components/my-appointments.component').then(m => m.MyAppointmentsComponent)
  },
  {
    path: 'agenda',
    canActivate: [authGuard, artistGuard],
    loadComponent: () =>
      import('./features/agenda/components/artist-agenda.component').then(m => m.ArtistAgendaComponent)
  },
  {
    path: '**',
    redirectTo: 'portfolio'
  }
];
