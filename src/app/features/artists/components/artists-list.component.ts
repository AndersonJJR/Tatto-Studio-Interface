import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ArtistService } from '../services/artist.service';
import { TattooArtistResponseDTO } from '../../../core/models/artist.models';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-artists-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, EmptyStateComponent],
  template: `
    <div class="w-full flex flex-col bg-background pt-20 min-h-screen">
      <!-- Ambient Glow Orbs -->
      <div class="relative w-full overflow-hidden">
        <div class="absolute -top-32 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute top-1/2 -right-24 w-80 h-80 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Header & Architecture Switcher Section -->
        <section class="w-full px-gutter md:px-margin pt-space-lg pb-space-md border-b border-outline-variant/20 bg-surface-container-lowest">
          <!-- Breadcrumb and Sub-nav Pill -->
          <div class="flex flex-wrap items-center justify-between gap-space-sm mb-space-md">
            <div class="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md">
              <span class="hover:text-primary transition-colors cursor-pointer">O Estúdio</span>
              <span class="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
              <span class="text-primary font-semibold">Tatuadores & Mestres Residentes</span>
            </div>
            <div class="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-high/80 backdrop-blur-md shadow-sm border border-outline-variant/30">
              <span class="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
              <span class="font-label-caps text-label-caps text-on-surface uppercase tracking-wider">Ateliê Aberto • São Paulo & Curitiba</span>
            </div>
          </div>

          <!-- Editorial Title & Manifest Header -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-end mb-space-lg">
            <div class="lg:col-span-8 space-y-space-xs">
              <span class="font-label-caps text-label-caps text-secondary uppercase tracking-[0.2em] block">Equipe Autoral & Cadeiras Residentes</span>
              <h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                Mestres da Derme & <span class="text-primary">Autores de Bancada</span>
              </h1>
              <p class="font-body-md text-body-md text-on-surface-variant max-w-2xl pt-space-xs leading-relaxed">
                Conheça nossos artistas residentes em regime coletivo ou explore a imersão integral no modelo de ateliê privativo. Rigor anatômico, técnica cirúrgica e assinatura estética sob medida.
              </p>
            </div>

            <!-- Mode Indicator Callout Badge -->
            <div class="lg:col-span-4 flex flex-col items-start lg:items-end">
              <div class="w-full p-space-md rounded-xl bg-surface-container-low border border-outline-variant/30 shadow-md backdrop-blur-sm">
                <div class="flex items-center justify-between text-xs mb-1">
                  <span class="font-label-caps text-label-caps text-outline uppercase">Padrão Operacional</span>
                  <span class="text-primary font-bold">100% Autoral</span>
                </div>
                <p class="font-body-sm text-body-sm text-on-surface-variant leading-tight">
                  Cada residente conduz com exclusividade seus próprios projetos autorais e agendas.
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- Search & Filter Bar -->
        <section class="w-full px-gutter md:px-margin my-space-lg">
          <div class="w-full p-space-md rounded-xl bg-surface-container-low border border-outline-variant/30 shadow-sm flex flex-col lg:flex-row gap-space-md items-center justify-between">
            <!-- Search -->
            <div class="w-full lg:w-96 relative">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                placeholder="Filtrar por mestre, estilo ou especialidade..."
                class="w-full bg-surface-container-highest text-on-surface pl-10 pr-space-md py-space-xs rounded-lg font-body-sm text-body-sm placeholder:text-outline border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary focus:bg-surface-container transition-all"
              />
            </div>

            <!-- Style Category Chips -->
            <div class="w-full lg:w-auto flex flex-wrap items-center gap-space-xs overflow-x-auto py-1">
              @for (chip of styleFilterChips; track chip) {
                <button
                  type="button"
                  (click)="selectedStyle.set(chip)"
                  class="px-space-sm py-1 rounded-DEFAULT font-label-md text-label-md transition-all cursor-pointer border"
                  [ngClass]="selectedStyle() === chip ? 'bg-primary text-on-primary font-bold shadow-sm border-primary' : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface border-outline-variant/30'"
                >
                  {{ chip === 'all' ? 'Todos' : chip }}
                </button>
              }
            </div>
          </div>
        </section>

        <!-- Multi-Resident Master Grid -->
        <section class="w-full px-gutter md:px-margin mb-space-xl">
          @if (isLoading()) {
            <div class="w-full py-20 flex flex-col items-center justify-center gap-4">
              <span class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
              <p class="font-label-caps text-label-caps text-outline uppercase tracking-widest">Carregando Bancada de Artistas...</p>
            </div>
          } @else if (filteredArtists().length === 0) {
            <!-- Beautiful Empty State for zero artists -->
            <div class="py-12">
              <app-empty-state
                icon="brush"
                title="Nenhum tatuador cadastrado no momento"
                message="Nossa bancada está sendo configurada. Se você é um artista ou deseja fazer parte do coletivo InkCraft, cadastre-se agora como Tatuador Residente."
                actionLabel="Cadastrar-se como Tatuador"
                actionRoute="/auth"
                actionIcon="person_add"
              />
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
              @for (artist of filteredArtists(); track artist.id) {
                <article class="flex flex-col rounded-xl bg-surface-container-low border border-outline-variant/30 overflow-hidden shadow-xl hover:shadow-[0_8px_32px_rgba(212,175,55,0.12)] hover:border-primary/40 transition-all group">
                  <div class="p-space-lg flex flex-col flex-1 justify-between space-y-space-md">
                    <!-- Top Info -->
                    <div>
                      <div class="flex items-start justify-between gap-space-sm mb-space-md">
                        <div class="flex items-center gap-space-md">
                          <!-- Avatar initials or portrait -->
                          <div class="w-16 h-16 rounded-full bg-surface-container-high border-2 border-primary/40 flex items-center justify-center text-primary font-headline-md text-headline-md font-bold shrink-0 shadow-md">
                            {{ artist.name.charAt(0).toUpperCase() }}
                          </div>
                          <div>
                            <h3 class="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors font-semibold">
                              {{ artist.name }}
                            </h3>
                            <span class="inline-block mt-0.5 px-2 py-0.5 rounded text-[11px] font-label-caps uppercase bg-primary/10 text-primary border border-primary/20">
                              {{ artist.specialty || 'Residente Titular' }}
                            </span>
                          </div>
                        </div>

                        <span class="px-2.5 py-1 rounded-full bg-surface-container text-tertiary font-label-caps text-[10px] uppercase border border-outline-variant/30 flex items-center gap-1">
                          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          Bancada Ativa
                        </span>
                      </div>

                      <!-- Bio -->
                      <p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                        {{ artist.bio || 'Mestre tatuador residente dedicado à pesquisa estética, precisão cirúrgica e rigor técnico em cada projeto autoral.' }}
                      </p>

                      @if (artist.phone) {
                        <p class="font-label-md text-label-md text-secondary pt-3 flex items-center gap-1">
                          <span class="material-symbols-outlined text-[16px]">phone</span>
                          <span>Contato direto: {{ artist.phone }}</span>
                        </p>
                      }
                    </div>

                    <!-- Bottom CTAs -->
                    <div class="pt-space-md border-t border-outline-variant/20 flex flex-col sm:flex-row items-center gap-space-sm">
                      <a
                        [routerLink]="['/portfolio']"
                        [queryParams]="{ artistId: artist.id }"
                        class="w-full sm:flex-1 py-2.5 px-space-md rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface hover:text-primary font-label-md text-label-md font-semibold text-center transition-colors border border-outline-variant/30 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span class="material-symbols-outlined text-[16px]">gallery_thumbnail</span>
                        <span>Ver Obras</span>
                      </a>

                      <a
                        [routerLink]="['/agendar']"
                        [queryParams]="{ artistId: artist.id }"
                        class="w-full sm:flex-1 py-2.5 px-space-md rounded-lg bg-primary hover:bg-primary-fixed text-on-primary font-label-md text-label-md font-bold text-center shadow-[0_0_16px_-4px_rgba(212,175,55,0.3)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <span class="material-symbols-outlined text-[16px]">calendar_today</span>
                        <span>Agendar Sessão</span>
                      </a>
                    </div>
                  </div>
                </article>
              }
            </div>
          }
        </section>
      </div>
    </div>
  `
})
export class ArtistsListComponent implements OnInit {
  private readonly artistService = inject(ArtistService);

  protected readonly artists = signal<TattooArtistResponseDTO[]>([]);
  protected readonly isLoading = signal<boolean>(true);

  protected searchQuery = '';
  protected selectedStyle = signal<string>('all');

  protected readonly styleFilterChips = [
    'all',
    'Blackwork',
    'Realismo Dark',
    'Geometria Sagrada',
    'Oriental',
    'Fineline'
  ];

  protected readonly filteredArtists = computed(() => {
    let list = this.artists();
    const q = this.searchQuery.toLowerCase().trim();
    const style = this.selectedStyle();

    if (style !== 'all') {
      list = list.filter(a => a.specialty && a.specialty.toLowerCase().includes(style.toLowerCase()));
    }

    if (q) {
      list = list.filter(a =>
        a.name.toLowerCase().includes(q) ||
        (a.specialty && a.specialty.toLowerCase().includes(q)) ||
        (a.bio && a.bio.toLowerCase().includes(q))
      );
    }

    return list;
  });

  ngOnInit(): void {
    this.loadArtists();
  }

  loadArtists(): void {
    this.isLoading.set(true);
    this.artistService.findAll().subscribe({
      next: (data) => {
        this.artists.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.artists.set([]);
        this.isLoading.set(false);
      }
    });
  }
}
