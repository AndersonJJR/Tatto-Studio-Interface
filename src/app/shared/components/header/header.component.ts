import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="fixed top-0 left-0 right-0 z-50 bg-surface/85 backdrop-blur-xl border-b border-outline-variant/30 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
      <div class="h-20 w-full px-gutter md:px-margin flex items-center justify-between gap-space-md">
        <!-- Logo & Studio Identity -->
        <div class="flex items-center gap-space-sm">
          <div class="w-8 h-8 rounded-lg bg-surface-container-high border border-primary/30 flex items-center justify-center text-primary font-bold shadow-[0_0_12px_rgba(212,175,55,0.2)]">
            <span class="material-symbols-outlined text-[20px]">ink_pen</span>
          </div>
          <a routerLink="/portfolio" class="font-headline-sm text-headline-sm tracking-tight text-on-surface hover:text-primary transition-colors">
            INKCRAFT
          </a>
          <span class="hidden lg:inline-block font-label-caps text-label-caps uppercase px-space-xs py-0.5 rounded-DEFAULT bg-surface-container-high text-secondary border border-outline-variant/40 ml-space-xs">
            Atelier
          </span>
        </div>

        <!-- Navigation Links -->
        <nav class="hidden md:flex items-center gap-space-lg">
          <a
            routerLink="/portfolio"
            routerLinkActive="text-primary font-bold border-b-2 border-primary"
            class="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface py-space-xs transition-colors"
          >
            Portfólio
          </a>
          <a
            routerLink="/tatuadores"
            routerLinkActive="text-primary font-bold border-b-2 border-primary"
            class="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface py-space-xs transition-colors"
          >
            Tatuadores
          </a>

          @if (authService.isArtist()) {
            <a
              routerLink="/agenda"
              routerLinkActive="text-primary font-bold border-b-2 border-primary"
              class="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface py-space-xs transition-colors flex items-center gap-1"
            >
              <span class="material-symbols-outlined text-[16px]">calendar_month</span>
              <span>Minha Agenda</span>
            </a>
            <a
              routerLink="/portfolio/gerenciar"
              routerLinkActive="text-primary font-bold border-b-2 border-primary"
              class="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface py-space-xs transition-colors flex items-center gap-1"
            >
              <span class="material-symbols-outlined text-[16px]">gallery_thumbnail</span>
              <span>Gerenciar Acervo</span>
            </a>
          }

          @if (authService.isClient()) {
            <a
              routerLink="/meus-agendamentos"
              routerLinkActive="text-primary font-bold border-b-2 border-primary"
              class="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface py-space-xs transition-colors flex items-center gap-1"
            >
              <span class="material-symbols-outlined text-[16px]">event_note</span>
              <span>Meus Agendamentos</span>
            </a>
          }
        </nav>

        <!-- Right Side: Auth / User / CTA -->
        <div class="flex items-center gap-space-sm md:gap-space-md">
          @if (!authService.isAuthenticated()) {
            <a
              routerLink="/auth"
              class="font-label-lg text-label-lg text-on-surface hover:text-primary transition-colors px-space-sm py-space-xs"
            >
              Entrar
            </a>
            <a
              routerLink="/agendar"
              class="hidden sm:inline-flex items-center justify-center font-label-lg text-label-lg text-on-primary bg-primary hover:bg-primary-fixed hover:text-on-primary-fixed px-space-md py-space-sm rounded-lg shadow-[0_0_24px_-4px_rgba(212,175,55,0.25)] transition-all font-semibold"
            >
              Agendar Sessão
            </a>
          } @else {
            @if (authService.isClient()) {
              <a
                routerLink="/agendar"
                class="hidden sm:inline-flex items-center justify-center font-label-lg text-label-lg text-on-primary bg-primary hover:bg-primary-fixed hover:text-on-primary-fixed px-space-md py-space-sm rounded-lg shadow-[0_0_24px_-4px_rgba(212,175,55,0.25)] transition-all font-semibold"
              >
                Agendar Sessão
              </a>
            }

            <!-- User Menu Profile Dropdown -->
            <div class="relative">
              <button
                type="button"
                (click)="toggleMenu()"
                class="flex items-center gap-2 p-1.5 rounded-full bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/40 transition-all cursor-pointer"
                title="Meu Perfil"
              >
                <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 text-on-primary font-bold">
                  {{ userInitial() }}
                </div>
                <span class="hidden md:inline-block font-label-md text-label-md text-on-surface pr-2">
                  {{ authService.currentUser()?.name }}
                </span>
                <span class="material-symbols-outlined text-[16px] text-outline">expand_more</span>
              </button>

              @if (isMenuOpen()) {
                <div
                  class="absolute right-0 mt-2 w-56 rounded-xl bg-surface-container-highest border border-outline-variant/40 shadow-2xl py-2 z-50 backdrop-blur-2xl"
                >
                  <div class="px-4 py-2 border-b border-outline-variant/20">
                    <p class="font-label-lg text-label-lg text-on-surface font-semibold truncate">
                      {{ authService.currentUser()?.name }}
                    </p>
                    <p class="font-body-sm text-body-sm text-outline truncate">
                      {{ authService.currentUser()?.email }}
                    </p>
                    <span class="inline-block mt-1 font-label-caps text-[10px] px-2 py-0.5 rounded bg-surface-container text-secondary border border-outline-variant/30">
                      {{ authService.isArtist() ? 'Tatuador Residente' : 'Cliente Colecionador' }}
                    </span>
                  </div>

                  @if (authService.isArtist()) {
                    <a
                      routerLink="/agenda"
                      (click)="isMenuOpen.set(false)"
                      class="flex items-center gap-2 px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                    >
                      <span class="material-symbols-outlined text-[18px]">calendar_month</span>
                      <span>Minha Agenda</span>
                    </a>
                    <a
                      routerLink="/portfolio/gerenciar"
                      (click)="isMenuOpen.set(false)"
                      class="flex items-center gap-2 px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                    >
                      <span class="material-symbols-outlined text-[18px]">gallery_thumbnail</span>
                      <span>Gerenciar Portfólio</span>
                    </a>
                  } @else {
                    <a
                      routerLink="/meus-agendamentos"
                      (click)="isMenuOpen.set(false)"
                      class="flex items-center gap-2 px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                    >
                      <span class="material-symbols-outlined text-[18px]">event_note</span>
                      <span>Meus Agendamentos</span>
                    </a>
                  }

                  <div class="border-t border-outline-variant/20 my-1"></div>

                  <button
                    type="button"
                    (click)="handleLogout()"
                    class="w-full flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-surface-container transition-colors text-left"
                  >
                    <span class="material-symbols-outlined text-[18px]">logout</span>
                    <span>Encerrar Sessão</span>
                  </button>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  protected readonly authService = inject(AuthService);
  protected readonly isMenuOpen = signal<boolean>(false);

  toggleMenu(): void {
    this.isMenuOpen.update(v => !v);
  }

  handleLogout(): void {
    this.isMenuOpen.set(false);
    this.authService.logout(true);
  }

  userInitial(): string {
    const name = this.authService.currentUser()?.name;
    return name ? name.charAt(0).toUpperCase() : 'U';
  }
}
