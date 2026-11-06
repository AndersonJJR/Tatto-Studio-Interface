import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PortfolioService } from '../services/portfolio.service';
import { ArtistService } from '../../artists/services/artist.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { PortfolioItemResponseDTO } from '../../../core/models/portfolio.models';
import { TattooArtistResponseDTO } from '../../../core/models/artist.models';
import { ImageUrlPipe } from '../../../shared/pipes/image-url.pipe';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-artist-portfolio-manage',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ImageUrlPipe, EmptyStateComponent],
  template: `
    <div class="w-full flex flex-col bg-background pt-20 min-h-screen">
      <!-- Top Artist Header & Breadcrumbs Context -->
      <section class="w-full px-gutter md:px-margin pt-space-lg pb-space-md border-b border-outline-variant/20 bg-surface-container-lowest">
        <div class="flex flex-col gap-space-md">
          <!-- Breadcrumb Bar -->
          <div class="flex items-center gap-space-xs text-on-surface-variant font-label-caps text-label-caps uppercase tracking-widest">
            <span>ESTÚDIO OS</span>
            <span class="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
            <span>PAINEL DO ARTISTA</span>
            <span class="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
            <span class="text-primary font-bold">GESTÃO DE PORTFÓLIO & ACERVO</span>
          </div>

          <!-- Title & Actions Row -->
          <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg">
            <div class="space-y-space-xs max-w-3xl">
              <div class="flex items-center gap-space-sm flex-wrap">
                <h1 class="font-headline-lg text-headline-lg tracking-tight text-on-surface">Curadoria do Acervo & Obras Autorais</h1>
                @if (artistProfile(); as artist) {
                  <span class="px-space-xs py-0.5 rounded-full bg-surface-container-high text-secondary font-label-caps text-label-caps uppercase tracking-wider border border-outline-variant/30">
                    {{ artist.name }} • Residente Titular
                  </span>
                }
              </div>
              <p class="font-body-md text-body-md text-on-surface-variant">
                Controle público de peças, publicação de fotos em alta resolução, referências de coautoria e gerenciamento de acervo no atelier.
              </p>
            </div>

            <div class="flex items-center gap-space-sm shrink-0">
              <a
                routerLink="/portfolio"
                class="inline-flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high hover:text-primary transition-all font-label-lg text-label-lg border border-outline-variant/30 cursor-pointer"
              >
                <span class="material-symbols-outlined text-[18px]">visibility</span>
                <span>Ver Portfólio Público</span>
              </a>

              <button
                type="button"
                (click)="openPublishDrawer()"
                class="inline-flex items-center gap-space-xs px-space-lg py-space-sm rounded-lg bg-primary hover:bg-primary-fixed text-on-primary font-label-lg text-label-lg font-bold shadow-[0_0_24px_-4px_rgba(212,175,55,0.3)] transition-all cursor-pointer"
              >
                <span class="material-symbols-outlined text-[20px]">add_photo_alternate</span>
                <span>Publicar Nova Obra</span>
              </button>
            </div>
          </div>

          <!-- KPI Metric Cards -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-space-md pt-space-sm">
            <div class="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col justify-between">
              <span class="font-label-caps text-label-caps text-outline uppercase">Obras Cadastradas</span>
              <span class="font-headline-md text-headline-md text-primary font-bold mt-1">{{ items().length }}</span>
            </div>
            <div class="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col justify-between">
              <span class="font-label-caps text-label-caps text-outline uppercase">Obras Públicas</span>
              <span class="font-headline-md text-headline-md text-tertiary font-bold mt-1">{{ publicItemsCount() }}</span>
            </div>
            <div class="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col justify-between">
              <span class="font-label-caps text-label-caps text-outline uppercase">Especialidade</span>
              <span class="font-label-lg text-label-lg text-secondary font-semibold mt-1 truncate">
                {{ artistProfile()?.specialty || 'Artes Autorais' }}
              </span>
            </div>
            <div class="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col justify-between">
              <span class="font-label-caps text-label-caps text-outline uppercase">Status da Cadeira</span>
              <span class="font-label-lg text-label-lg text-on-surface font-semibold mt-1 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                Ativa & Aberta
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Content / Items Grid -->
      <section class="w-full px-gutter md:px-margin py-space-xl">
        @if (isLoading()) {
          <div class="w-full py-20 flex flex-col items-center justify-center gap-4">
            <span class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
            <p class="font-label-caps text-label-caps text-outline uppercase tracking-widest">Carregando Seu Acervo...</p>
          </div>
        } @else if (items().length === 0) {
          <div class="py-12">
            <app-empty-state
              icon="add_photo_alternate"
              title="Você ainda não publicou nenhuma peça no acervo"
              message="Seu portfólio está zerado. Faça o upload das suas melhores fotos de tatuagens para que os clientes colecionadores possam conhecer e solicitar agendamentos."
              actionLabel="Publicar Primeira Obra"
              actionIcon="cloud_upload"
              (actionClick)="openPublishDrawer()"
            />
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
            @for (item of items(); track item.id) {
              <div class="rounded-xl overflow-hidden bg-surface-container border border-outline-variant/30 flex flex-col justify-between shadow-lg group">
                <div class="relative h-64 overflow-hidden bg-surface-container-lowest">
                  <img
                    [src]="item.imageUrl | imageUrl"
                    [alt]="item.title"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div class="absolute top-3 left-3">
                    <span class="px-2.5 py-1 rounded bg-surface-container-lowest/80 backdrop-blur-md text-primary font-label-caps text-label-caps uppercase border border-outline-variant/30">
                      {{ item.styleTag || 'Autoral' }}
                    </span>
                  </div>
                  @if (item.isPublic === false) {
                    <div class="absolute top-3 right-3">
                      <span class="px-2 py-0.5 rounded bg-surface-container-high/90 text-outline font-label-caps text-[10px] uppercase border border-outline-variant/40">
                        Privado
                      </span>
                    </div>
                  }
                </div>

                <div class="p-space-md flex flex-col justify-between flex-1 space-y-3">
                  <div>
                    <h3 class="font-headline-sm text-headline-sm text-on-surface truncate">{{ item.title }}</h3>
                    <p class="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mt-1">
                      {{ item.description || 'Sem descrição informada.' }}
                    </p>
                    @if (item.authorCredits) {
                      <p class="font-label-caps text-[10px] text-secondary mt-2">
                        Créditos: {{ item.authorCredits }}
                      </p>
                    }
                  </div>

                  <div class="pt-space-sm border-t border-outline-variant/20 flex items-center justify-between">
                    <button
                      type="button"
                      (click)="openEditDrawer(item)"
                      class="text-secondary hover:text-primary font-label-md text-label-md flex items-center gap-1 cursor-pointer"
                    >
                      <span class="material-symbols-outlined text-[16px]">edit</span>
                      <span>Editar</span>
                    </button>

                    <button
                      type="button"
                      (click)="confirmDelete(item)"
                      class="text-error hover:text-rose-300 font-label-md text-label-md flex items-center gap-1 cursor-pointer"
                    >
                      <span class="material-symbols-outlined text-[16px]">delete</span>
                      <span>Remover</span>
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </section>

      <!-- DRAWER / MODAL: PUBLISH OR EDIT ITEM -->
      @if (isDrawerOpen()) {
        <div class="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-fade-in" (click)="closeDrawer()">
          <div
            class="w-full max-w-xl bg-surface-container-low h-full overflow-y-auto border-l border-outline-variant/30 p-space-xl flex flex-col justify-between shadow-2xl"
            (click)="$event.stopPropagation()"
          >
            <div class="space-y-space-lg">
              <div class="flex items-center justify-between border-b border-outline-variant/20 pb-space-md">
                <div class="space-y-1">
                  <h2 class="font-headline-md text-headline-md text-on-surface font-semibold">
                    {{ isEditing() ? 'Editar Peça do Acervo' : 'Publicar Obra no Portfólio' }}
                  </h2>
                  <p class="font-body-sm text-body-sm text-on-surface-variant">
                    Upload de arquivos ou vínculo com URL externa para a galeria do atelier.
                  </p>
                </div>
                <button
                  type="button"
                  (click)="closeDrawer()"
                  class="w-9 h-9 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface flex items-center justify-center cursor-pointer"
                >
                  <span class="material-symbols-outlined">close</span>
                </button>
              </div>

              <form class="space-y-space-md" (ngSubmit)="handleSave()">
                <!-- Title -->
                <div class="space-y-1">
                  <label class="font-label-caps text-label-caps uppercase text-on-surface-variant flex items-center gap-1" for="art-title">
                    <span>Título da Obra</span>
                    <span class="text-primary">*</span>
                  </label>
                  <input
                    id="art-title"
                    type="text"
                    [(ngModel)]="formTitle"
                    name="formTitle"
                    required
                    placeholder="Ex: Samurai Mask & Flor de Lótus"
                    class="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline/60 text-body-md font-body-md p-3 rounded-lg border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <!-- Style Tag -->
                <div class="space-y-1">
                  <label class="font-label-caps text-label-caps uppercase text-on-surface-variant" for="art-style">
                    Estilo / Técnica Predominante
                  </label>
                  <input
                    id="art-style"
                    type="text"
                    [(ngModel)]="formStyleTag"
                    name="formStyleTag"
                    placeholder="Ex: Oriental, Blackwork, Fineline..."
                    class="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline/60 text-body-md font-body-md p-3 rounded-lg border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <!-- Image Upload vs Image URL Mode Switcher -->
                @if (!isEditing()) {
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <label class="font-label-caps text-label-caps uppercase text-on-surface-variant">
                        Fonte da Imagem
                      </label>
                      <div class="flex items-center gap-2 text-xs font-label-md">
                        <button
                          type="button"
                          (click)="useFileUpload.set(true)"
                          class="px-2.5 py-1 rounded cursor-pointer"
                          [ngClass]="useFileUpload() ? 'bg-primary text-on-primary font-bold' : 'text-outline hover:text-on-surface'"
                        >
                          Arquivo Físico
                        </button>
                        <button
                          type="button"
                          (click)="useFileUpload.set(false)"
                          class="px-2.5 py-1 rounded cursor-pointer"
                          [ngClass]="!useFileUpload() ? 'bg-primary text-on-primary font-bold' : 'text-outline hover:text-on-surface'"
                        >
                          URL Externa
                        </button>
                      </div>
                    </div>

                    @if (useFileUpload()) {
                      <div class="border-2 border-dashed border-outline-variant/40 hover:border-primary/60 rounded-xl p-space-lg text-center bg-surface-container-lowest cursor-pointer transition-colors relative">
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg"
                          (change)="onFileSelected($event)"
                          class="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <div class="flex flex-col items-center justify-center gap-2 pointer-events-none">
                          <span class="material-symbols-outlined text-primary text-3xl">upload_file</span>
                          @if (selectedFile) {
                            <p class="font-label-lg text-label-lg text-primary font-semibold truncate max-w-xs">{{ selectedFile.name }}</p>
                            <p class="text-xs text-outline">{{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB selecionado</p>
                          } @else {
                            <p class="font-label-lg text-label-lg text-on-surface font-semibold">Selecione uma imagem (.png, .jpg, .jpeg)</p>
                            <p class="text-xs text-outline">Tamanho máximo: 5 MB</p>
                          }
                        </div>
                      </div>
                    } @else {
                      <div class="space-y-1">
                        <input
                          type="url"
                          [(ngModel)]="formImageUrl"
                          name="formImageUrl"
                          placeholder="https://exemplo.com/foto-tatuagem.jpg"
                          class="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline/60 text-body-md font-body-md p-3 rounded-lg border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    }
                  </div>
                }

                <!-- Description -->
                <div class="space-y-1">
                  <label class="font-label-caps text-label-caps uppercase text-on-surface-variant" for="art-desc">
                    Memorial Descritivo / Especificações
                  </label>
                  <textarea
                    id="art-desc"
                    [(ngModel)]="formDescription"
                    name="formDescription"
                    rows="3"
                    placeholder="Detalhes de sessões, agulhas, pigmento utilizado ou conceito..."
                    class="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline/60 text-body-md font-body-md p-3 rounded-lg border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                  ></textarea>
                </div>

                <!-- Author Credits -->
                <div class="space-y-1">
                  <label class="font-label-caps text-label-caps uppercase text-on-surface-variant" for="art-credits">
                    Créditos de Coautoria ou Referência
                  </label>
                  <input
                    id="art-credits"
                    type="text"
                    [(ngModel)]="formAuthorCredits"
                    name="formAuthorCredits"
                    placeholder="Ex: Trabalho colaborativo ou design original por..."
                    class="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline/60 text-body-md font-body-md p-3 rounded-lg border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <!-- Is Public Checkbox -->
                <div class="pt-2">
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      [(ngModel)]="formIsPublic"
                      name="formIsPublic"
                      class="w-4 h-4 rounded bg-surface-container-lowest accent-primary"
                    />
                    <span class="font-body-sm text-body-sm text-on-surface">
                      Exibir esta obra publicamente no Portfólio Geral do atelier
                    </span>
                  </label>
                </div>

                <!-- Submit Button -->
                <div class="pt-space-md border-t border-outline-variant/20 flex gap-space-sm">
                  <button
                    type="button"
                    (click)="closeDrawer()"
                    class="flex-1 py-3 px-space-md rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-label-lg text-label-lg font-semibold transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    [disabled]="isSaving()"
                    class="flex-1 py-3 px-space-md rounded-xl bg-primary hover:bg-primary-fixed text-on-primary font-label-lg text-label-lg font-bold shadow-[0_0_20px_-4px_rgba(212,175,55,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    @if (isSaving()) {
                      <span class="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                      <span>Salvando...</span>
                    } @else {
                      <span class="material-symbols-outlined text-[18px]">check</span>
                      <span>{{ isEditing() ? 'Atualizar Obra' : 'Publicar Obra' }}</span>
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      }

      <!-- DELETE CONFIRMATION MODAL -->
      @if (itemToDelete(); as target) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div class="w-full max-w-md bg-surface-container rounded-2xl border border-outline-variant/40 p-space-lg shadow-2xl space-y-space-md">
            <div class="flex items-center gap-3 text-error">
              <span class="material-symbols-outlined text-3xl">warning</span>
              <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold">Excluir Peça do Acervo?</h3>
            </div>
            <p class="font-body-md text-body-md text-on-surface-variant">
              Você tem certeza de que deseja remover a obra <strong class="text-on-surface">"{{ target.title }}"</strong>? Esta ação apagará o arquivo físico e não poderá ser desfeita.
            </p>
            <div class="flex justify-end gap-3 pt-2">
              <button
                type="button"
                (click)="itemToDelete.set(null)"
                class="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface font-label-md hover:bg-surface-container-highest cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                (click)="executeDelete()"
                class="px-4 py-2 rounded-lg bg-error hover:bg-rose-700 text-on-error font-label-md font-bold cursor-pointer"
              >
                Sim, Remover
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ArtistPortfolioManageComponent implements OnInit {
  private readonly portfolioService = inject(PortfolioService);
  private readonly artistService = inject(ArtistService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  protected readonly items = signal<PortfolioItemResponseDTO[]>([]);
  protected readonly artistProfile = signal<TattooArtistResponseDTO | null>(null);
  protected readonly isLoading = signal<boolean>(true);
  protected readonly isDrawerOpen = signal<boolean>(false);
  protected readonly isEditing = signal<boolean>(false);
  protected readonly isSaving = signal<boolean>(false);
  protected readonly itemToDelete = signal<PortfolioItemResponseDTO | null>(null);

  protected readonly useFileUpload = signal<boolean>(true);
  protected selectedFile: File | null = null;
  protected editingItemId: string | null = null;

  // Form Fields
  protected formTitle = '';
  protected formStyleTag = '';
  protected formImageUrl = '';
  protected formDescription = '';
  protected formAuthorCredits = '';
  protected formIsPublic = true;

  ngOnInit(): void {
    this.loadArtistAndItems();
  }

  publicItemsCount(): number {
    return this.items().filter(i => i.isPublic !== false).length;
  }

  loadArtistAndItems(): void {
    this.isLoading.set(true);
    this.artistService.getProfile().subscribe({
      next: (profile) => {
        this.artistProfile.set(profile);
        this.loadItems(profile.id);
      },
      error: () => {
        this.toast.error('Não foi possível identificar o perfil de tatuador.');
        this.isLoading.set(false);
      }
    });
  }

  loadItems(artistId: string): void {
    this.portfolioService.findAll(artistId).subscribe({
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

  openPublishDrawer(): void {
    this.isEditing.set(false);
    this.editingItemId = null;
    this.formTitle = '';
    this.formStyleTag = this.artistProfile()?.specialty || '';
    this.formImageUrl = '';
    this.formDescription = '';
    this.formAuthorCredits = '';
    this.formIsPublic = true;
    this.selectedFile = null;
    this.useFileUpload.set(true);
    this.isDrawerOpen.set(true);
  }

  openEditDrawer(item: PortfolioItemResponseDTO): void {
    this.isEditing.set(true);
    this.editingItemId = item.id;
    this.formTitle = item.title;
    this.formStyleTag = item.styleTag;
    this.formImageUrl = item.imageUrl;
    this.formDescription = item.description || '';
    this.formAuthorCredits = item.authorCredits || '';
    this.formIsPublic = item.isPublic !== false;
    this.selectedFile = null;
    this.isDrawerOpen.set(true);
  }

  closeDrawer(): void {
    this.isDrawerOpen.set(false);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  handleSave(): void {
    if (!this.formTitle.trim()) {
      this.toast.error('Informe o título da obra.');
      return;
    }

    this.isSaving.set(true);

    if (this.isEditing() && this.editingItemId) {
      // Update
      this.portfolioService.update(this.editingItemId, {
        title: this.formTitle.trim(),
        description: this.formDescription.trim(),
        imageUrl: this.formImageUrl,
        styleTag: this.formStyleTag.trim(),
        authorCredits: this.formAuthorCredits.trim() || undefined,
        isPublic: this.formIsPublic
      }).subscribe({
        next: () => {
          this.toast.success('Obra atualizada com sucesso!');
          this.isSaving.set(false);
          this.closeDrawer();
          if (this.artistProfile()) {
            this.loadItems(this.artistProfile()!.id);
          }
        },
        error: (err) => {
          this.toast.error(err.error?.message || 'Falha ao atualizar obra.');
          this.isSaving.set(false);
        }
      });
    } else {
      // Create / Upload
      if (this.useFileUpload()) {
        if (!this.selectedFile) {
          this.toast.error('Selecione um arquivo de imagem para upload.');
          this.isSaving.set(false);
          return;
        }

        const formData = new FormData();
        formData.append('title', this.formTitle.trim());
        if (this.formDescription.trim()) formData.append('description', this.formDescription.trim());
        if (this.formStyleTag.trim()) formData.append('styleTag', this.formStyleTag.trim());
        if (this.formAuthorCredits.trim()) formData.append('authorCredits', this.formAuthorCredits.trim());
        formData.append('isPublic', String(this.formIsPublic));
        formData.append('file', this.selectedFile);

        this.portfolioService.upload(formData).subscribe({
          next: () => {
            this.toast.success('Obra enviada e publicada com sucesso no acervo!');
            this.isSaving.set(false);
            this.closeDrawer();
            if (this.artistProfile()) {
              this.loadItems(this.artistProfile()!.id);
            }
          },
          error: (err) => {
            this.toast.error(err.error?.message || 'Erro no upload da imagem.');
            this.isSaving.set(false);
          }
        });
      } else {
        if (!this.formImageUrl.trim()) {
          this.toast.error('Informe a URL da imagem.');
          this.isSaving.set(false);
          return;
        }

        this.portfolioService.create({
          title: this.formTitle.trim(),
          description: this.formDescription.trim(),
          imageUrl: this.formImageUrl.trim(),
          styleTag: this.formStyleTag.trim(),
          authorCredits: this.formAuthorCredits.trim() || undefined,
          isPublic: this.formIsPublic
        }).subscribe({
          next: () => {
            this.toast.success('Obra cadastrada com sucesso!');
            this.isSaving.set(false);
            this.closeDrawer();
            if (this.artistProfile()) {
              this.loadItems(this.artistProfile()!.id);
            }
          },
          error: (err) => {
            this.toast.error(err.error?.message || 'Erro ao cadastrar obra.');
            this.isSaving.set(false);
          }
        });
      }
    }
  }

  confirmDelete(item: PortfolioItemResponseDTO): void {
    this.itemToDelete.set(item);
  }

  executeDelete(): void {
    const item = this.itemToDelete();
    if (!item) return;

    this.portfolioService.delete(item.id).subscribe({
      next: () => {
        this.toast.success('Obra removida do acervo.');
        this.itemToDelete.set(null);
        if (this.artistProfile()) {
          this.loadItems(this.artistProfile()!.id);
        }
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Erro ao remover obra.');
        this.itemToDelete.set(null);
      }
    });
  }
}
