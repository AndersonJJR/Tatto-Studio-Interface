import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PortfolioService } from '../services/portfolio.service';
import { ArtistService } from '../../artists/services/artist.service';
import { PortfolioItemResponseDTO } from '../../../core/models/portfolio.models';
import { TattooArtistResponseDTO } from '../../../core/models/artist.models';
import { ImageUrlPipe } from '../../../shared/pipes/image-url.pipe';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-portfolio-gallery',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ImageUrlPipe, EmptyStateComponent],
  template: `
    <div class="w-full flex flex-col bg-background pt-20">
      <!-- HERO INTRO TITLE SECTION -->
      <section class="relative w-full overflow-hidden bg-surface-container-lowest border-b border-outline-variant/20 pt-space-lg pb-space-md">
        <div class="absolute -top-32 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[140px] pointer-events-none"></div>
        <div class="w-full px-gutter md:px-margin">
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
            <div class="space-y-space-xs">
              <div class="inline-flex items-center gap-space-xs px-space-md py-1 rounded-full bg-surface-container-high shadow-sm mb-1 border border-outline-variant/30">
                <span class="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                <span class="font-label-caps text-label-caps text-secondary uppercase tracking-widest">Galeria Curada InkCraft • Edição 2026</span>
              </div>
              <h1 class="font-display-hero text-display-hero-mobile md:text-display-hero text-on-surface leading-none tracking-tight">
                A Arte na Pele, <br />
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary-fixed">Eterna e Precisa.</span>
              </h1>
              <p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl pt-space-xs">
                Convergência entre rigor cirúrgico, pigmentação pura e arte contemporânea sob encomenda. Cada traço é desenhado como peça irrepetível no corpo humano.
              </p>
            </div>
            <div class="flex items-center gap-space-lg shrink-0 pb-2">
              <div class="flex flex-col">
                <span class="font-headline-md text-headline-md text-primary font-bold">14+</span>
                <span class="font-label-caps text-label-caps text-outline uppercase tracking-wider">Prêmios Nacionais</span>
              </div>
              <div class="w-px h-10 bg-outline-variant/40"></div>
              <div class="flex flex-col">
                <span class="font-headline-md text-headline-md text-on-surface font-bold">100%</span>
                <span class="font-label-caps text-label-caps text-outline uppercase tracking-wider">Pigmentos Veganos</span>
              </div>
              <div class="w-px h-10 bg-outline-variant/40"></div>
              <div class="flex flex-col">
                <span class="font-headline-md text-headline-md text-tertiary font-bold">Grau B</span>
                <span class="font-label-caps text-label-caps text-outline uppercase tracking-wider">Biossegurança</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- STICKY FILTER BAR -->
      <section class="sticky top-20 z-40 w-full bg-surface-container-low/95 backdrop-blur-xl border-y border-outline-variant/30 shadow-lg" id="catalogo-grid">
        <div class="w-full px-gutter md:px-margin py-space-sm flex flex-col gap-space-sm">
          <div class="grid grid-cols-1 md:grid-cols-12 gap-space-sm items-center">
            <!-- Search Field -->
            <div class="md:col-span-5 relative">
              <div class="relative flex items-center">
                <span class="material-symbols-outlined absolute left-3 text-outline text-[20px]">search</span>
                <input
                  type="text"
                  [(ngModel)]="searchQuery"
                  placeholder="Buscar por estilo, técnica, conceito ou tatuador..."
                  class="w-full bg-surface-container-highest text-on-surface placeholder:text-outline font-body-sm text-body-sm pl-10 pr-4 py-2.5 rounded-lg border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
                />
              </div>
            </div>

            <!-- Artist Dropdown -->
            <div class="md:col-span-4 relative">
              <div class="relative flex items-center">
                <span class="material-symbols-outlined absolute left-3 text-secondary text-[18px]">artist</span>
                <select
                  [(ngModel)]="selectedArtistId"
                  (ngModelChange)="loadPortfolio()"
                  class="w-full appearance-none bg-surface-container-highest text-on-surface font-body-sm text-body-sm pl-10 pr-10 py-2.5 rounded-lg border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer shadow-inner"
                >
                  <option value="all">Todos os Artistas Residentes</option>
                  @for (artist of artists(); track artist.id) {
                    <option [value]="artist.id">{{ artist.name }} ({{ artist.specialty }})</option>
                  }
                </select>
                <span class="material-symbols-outlined absolute right-3 text-outline text-[20px] pointer-events-none">expand_more</span>
              </div>
            </div>

            <!-- Sorting & Count -->
            <div class="md:col-span-3 flex items-center justify-between md:justify-end gap-space-sm">
              <span class="font-label-md text-label-md text-on-surface-variant whitespace-nowrap">
                <strong class="text-primary font-bold">{{ filteredItems().length }}</strong> peças curadas
              </span>
            </div>
          </div>

          <!-- Quick Chips Category Filter -->
          <div class="flex items-center gap-space-xs overflow-x-auto pb-1 scrollbar-none">
            @for (chip of styleChips; track chip) {
              <button
                type="button"
                (click)="selectStyleChip(chip)"
                class="px-3 py-1.5 rounded-lg text-label-caps font-label-caps uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer border"
                [ngClass]="selectedStyle() === chip ? 'bg-primary text-on-primary font-bold shadow-[0_0_12px_rgba(212,175,55,0.35)] border-primary' : 'bg-surface-container-highest text-on-surface-variant hover:text-on-surface hover:bg-surface-bright border-outline-variant/30'"
              >
                {{ chip === 'all' ? 'Todos' : chip }}
              </button>
            }
          </div>
        </div>
      </section>

      <!-- PORTFOLIO GRID -->
      <section class="w-full px-gutter md:px-margin py-space-xl bg-background">
        @if (isLoading()) {
          <div class="w-full py-20 flex flex-col items-center justify-center gap-4">
            <span class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
            <p class="font-label-caps text-label-caps text-outline uppercase tracking-widest">Carregando Acervo Curatorial...</p>
          </div>
        } @else if (filteredItems().length === 0) {
          <!-- Empty State handling empty DB cleanly -->
          <div class="py-12">
            <app-empty-state
              icon="palette"
              title="Nenhuma obra cadastrada no portfólio no momento"
              message="O acervo deste atelier está sendo renovado. Conheça nossos mestres tatuadores residentes ou solicite um projeto autoral exclusivo."
              actionLabel="Conhecer Tatuadores"
              actionRoute="/tatuadores"
              actionIcon="group"
            />
          </div>
        } @else {
          <div class="grid grid-cols-1 xl:grid-cols-2 gap-space-lg">
            @for (item of filteredItems(); track item.id) {
              <article
                (click)="openLightbox(item)"
                class="group rounded-xl overflow-hidden bg-surface-container border border-outline-variant/30 hover:border-primary/50 shadow-md hover:shadow-[0_16px_36px_rgba(0,0,0,0.9)] transition-all duration-300 flex flex-col sm:flex-row cursor-pointer"
              >
                <!-- Thumbnail -->
                <div class="relative w-full sm:w-[240px] shrink-0 h-64 sm:h-auto overflow-hidden bg-surface-container-low">
                  <img
                    [src]="item.imageUrl | imageUrl"
                    [alt]="item.title"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div class="absolute top-3 left-3 flex items-center gap-1.5">
                    <span class="px-2.5 py-1 rounded-DEFAULT bg-surface-container-lowest/80 backdrop-blur-md text-primary font-label-caps text-label-caps uppercase border border-outline-variant/30">
                      {{ item.styleTag || 'Autoral' }}
                    </span>
                  </div>
                </div>

                <!-- Info -->
                <div class="p-space-md flex flex-col justify-between flex-1 space-y-space-xs">
                  <div class="space-y-space-xs">
                    <div class="flex items-center justify-between">
                      <span class="px-2 py-0.5 rounded-DEFAULT bg-surface-container-high text-secondary font-label-caps text-label-caps border border-outline-variant/30">
                        {{ item.artistName || 'Mestre InkCraft' }}
                      </span>
                      @if (item.authorCredits) {
                        <span class="font-label-caps text-[10px] text-outline truncate max-w-[140px]">
                          {{ item.authorCredits }}
                        </span>
                      }
                    </div>

                    <h4 class="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                      {{ item.title }}
                    </h4>
                    <p class="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                      {{ item.description || 'Composição artística autoral executada com pigmento vegano puro e técnica cirúrgica.' }}
                    </p>
                  </div>

                  <div class="pt-space-sm border-t border-outline-variant/20 flex items-center justify-between">
                    <span class="font-label-caps text-[11px] text-outline uppercase">
                      Peça Exclusiva
                    </span>
                    <button
                      type="button"
                      class="inline-flex items-center gap-1 text-primary hover:text-primary-fixed font-label-lg text-label-lg font-semibold"
                    >
                      <span>Inspecionar Obra</span>
                      <span class="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">zoom_in</span>
                    </button>
                  </div>
                </div>
              </article>
            }
          </div>
        }
      </section>

      <!-- LIGHTBOX MODAL -->
      @if (activeLightboxItem(); as activeItem) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in"
          (click)="closeLightbox()"
        >
          <div
            class="relative max-w-4xl w-full bg-surface-container-low rounded-2xl border border-outline-variant/40 overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
            (click)="$event.stopPropagation()"
          >
            <!-- Close Button -->
            <button
              type="button"
              (click)="closeLightbox()"
              class="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-surface-container-highest/80 hover:bg-primary text-on-surface hover:text-on-primary flex items-center justify-center transition-colors cursor-pointer"
            >
              <span class="material-symbols-outlined">close</span>
            </button>

            <!-- Image Viewport -->
            <div class="md:w-3/5 bg-black flex items-center justify-center p-2 overflow-hidden">
              <img
                [src]="activeItem.imageUrl | imageUrl"
                [alt]="activeItem.title"
                class="w-full h-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>

            <!-- Details Panel -->
            <div class="md:w-2/5 p-space-lg flex flex-col justify-between overflow-y-auto">
              <div class="space-y-space-md">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container text-primary font-label-caps text-label-caps uppercase border border-outline-variant/30">
                  <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                  <span>{{ activeItem.styleTag || 'Arte Autoral' }}</span>
                </div>

                <div>
                  <h3 class="font-headline-md text-headline-md text-on-surface">
                    {{ activeItem.title }}
                  </h3>
                  <p class="font-label-lg text-label-lg text-secondary pt-1">
                    Autor: {{ activeItem.artistName }}
                  </p>
                </div>

                <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {{ activeItem.description || 'Obra irrepetível do atelier executada segundo rigor anatômico e pigmentação vegana pura de alta densidade.' }}
                </p>

                @if (activeItem.authorCredits) {
                  <div class="p-3 rounded-lg bg-surface-container-lowest text-xs text-on-surface-variant border border-outline-variant/30">
                    <span class="text-outline uppercase font-label-caps block mb-1">Créditos de Coautoria</span>
                    {{ activeItem.authorCredits }}
                  </div>
                }
              </div>

              <div class="pt-space-lg border-t border-outline-variant/20 space-y-space-sm">
                <a
                  [routerLink]="['/agendar']"
                  [queryParams]="{ artistId: activeItem.artistId, referenceTitle: activeItem.title }"
                  (click)="closeLightbox()"
                  class="w-full py-3 px-space-md rounded-xl bg-primary hover:bg-primary-fixed text-on-primary font-label-lg text-label-lg font-bold shadow-[0_0_24px_-4px_rgba(212,175,55,0.3)] transition-all flex items-center justify-center gap-2"
                >
                  <span class="material-symbols-outlined text-[18px]">event_available</span>
                  <span>Agendar com este Artista</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class PortfolioGalleryComponent implements OnInit {
  private readonly portfolioService = inject(PortfolioService);
  private readonly artistService = inject(ArtistService);

  protected readonly items = signal<PortfolioItemResponseDTO[]>([]);
  protected readonly artists = signal<TattooArtistResponseDTO[]>([]);
  protected readonly isLoading = signal<boolean>(true);

  protected searchQuery = '';
  protected selectedArtistId = 'all';
  protected selectedStyle = signal<string>('all');
  protected activeLightboxItem = signal<PortfolioItemResponseDTO | null>(null);

  protected readonly styleChips = [
    'all',
    'Blackwork',
    'Realismo Dark',
    'Fineline & Micro',
    'Oriental Tradicional',
    'Floral & Botânico',
    'Geométrico Sagrado'
  ];

  protected readonly filteredItems = computed(() => {
    let list = this.items();
    const q = this.searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(item =>
        item.title.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.styleTag && item.styleTag.toLowerCase().includes(q)) ||
        (item.artistName && item.artistName.toLowerCase().includes(q))
      );
    }
    return list;
  });

  ngOnInit(): void {
    this.loadArtists();
    this.loadPortfolio();
  }

  loadArtists(): void {
    this.artistService.findAll().subscribe({
      next: (data) => this.artists.set(data),
      error: () => this.artists.set([])
    });
  }

  loadPortfolio(): void {
    this.isLoading.set(true);
    const style = this.selectedStyle() === 'all' ? undefined : this.selectedStyle();
    const artist = this.selectedArtistId === 'all' ? undefined : this.selectedArtistId;

    this.portfolioService.findAll(artist, style).subscribe({
      next: (data) => {
        this.items.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.items.set([]);
        this.isLoading.set(false);
      }
    });
  }

  selectStyleChip(chip: string): void {
    this.selectedStyle.set(chip);
    this.loadPortfolio();
  }

  openLightbox(item: PortfolioItemResponseDTO): void {
    this.activeLightboxItem.set(item);
  }

  closeLightbox(): void {
    this.activeLightboxItem.set(null);
  }
}
