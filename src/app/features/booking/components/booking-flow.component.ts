import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ArtistService } from '../../artists/services/artist.service';
import { AppointmentService } from '../services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { TattooArtistResponseDTO, BookedSlotResponseDTO } from '../../../core/models/artist.models';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-booking-flow',
  standalone: true,
  imports: [CommonModule, FormsModule, EmptyStateComponent],
  template: `
    <div class="w-full flex flex-col bg-background pt-20 min-h-screen">
      <!-- Ambient Glow -->
      <div class="relative w-full overflow-hidden">
        <div class="absolute -top-32 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Header & Stepper Section -->
        <section class="w-full px-gutter md:px-margin pt-space-lg pb-space-md border-b border-outline-variant/20 bg-surface-container-lowest">
          <div class="flex flex-col gap-space-md">
            <div class="flex items-center gap-space-xs text-on-surface-variant font-label-caps text-label-caps uppercase tracking-widest">
              <span>INKCRAFT ATELIER</span>
              <span class="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
              <span>COMISSÕES & AGENDAMENTO</span>
              <span class="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
              <span class="text-primary font-bold">ETAPA {{ currentStep() }} DE 3</span>
            </div>

            <div class="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
              <div class="space-y-space-xs">
                <h1 class="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                  Comissão Autoral & <span class="text-primary">Agendamento de Bancada</span>
                </h1>
                <p class="font-body-md text-body-md text-on-surface-variant max-w-2xl">
                  Protocolo em 3 etapas para definição de conceito, verificação de janelas cirúrgicas e caução de reserva.
                </p>
              </div>

              <!-- Stepper Indicators -->
              <div class="flex items-center gap-2">
                <div
                  class="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-label-caps uppercase"
                  [ngClass]="currentStep() === 1 ? 'bg-primary text-on-primary border-primary font-bold' : 'bg-surface-container text-on-surface-variant border-outline-variant/30'"
                >
                  <span>1. Conceito</span>
                </div>
                <div class="w-4 h-px bg-outline-variant/40"></div>
                <div
                  class="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-label-caps uppercase"
                  [ngClass]="currentStep() === 2 ? 'bg-primary text-on-primary border-primary font-bold' : 'bg-surface-container text-on-surface-variant border-outline-variant/30'"
                >
                  <span>2. Data & Horário</span>
                </div>
                <div class="w-4 h-px bg-outline-variant/40"></div>
                <div
                  class="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-label-caps uppercase"
                  [ngClass]="currentStep() === 3 ? 'bg-primary text-on-primary border-primary font-bold' : 'bg-surface-container text-on-surface-variant border-outline-variant/30'"
                >
                  <span>3. Depósito</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Main Form Container -->
        <main class="w-full px-gutter md:px-margin py-space-xl">
          @if (isLoadingArtists()) {
            <div class="w-full py-20 flex flex-col items-center justify-center gap-4">
              <span class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
              <p class="font-label-caps text-label-caps text-outline uppercase tracking-widest">Carregando Tatuadores do Atelier...</p>
            </div>
          } @else if (artists().length === 0) {
            <!-- Empty state when no artists are registered in the DB -->
            <div class="py-12">
              <app-empty-state
                icon="person_off"
                title="Nenhum tatuador disponível no sistema no momento"
                message="Para realizar um agendamento, é necessário que ao menos um tatuador residente esteja cadastrado no sistema. Por favor, crie uma conta de Tatuador Residente primeiro."
                actionLabel="Cadastrar Tatuador"
                actionRoute="/auth"
                actionIcon="person_add"
              />
            </div>
          } @else {
            <div class="max-w-4xl mx-auto space-y-space-xl">
              <!-- ========================================== -->
              <!-- STEP 1: CONCEITO & ARTISTA                 -->
              <!-- ========================================== -->
              @if (currentStep() === 1) {
                <div class="space-y-space-lg">
                  <!-- Section: Select Artist -->
                  <div class="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-space-md">
                    <div class="flex items-center justify-between border-b border-outline-variant/20 pb-space-sm">
                      <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary text-[22px]">brush</span>
                        <h2 class="font-headline-sm text-headline-sm text-on-surface font-semibold">Artista Residente Responsável</h2>
                      </div>
                      <span class="font-label-caps text-[11px] text-secondary uppercase bg-surface-container px-2 py-0.5 rounded border border-outline-variant/30">Obrigatório</span>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                      @for (artist of artists(); track artist.id) {
                        <div
                          (click)="selectArtist(artist)"
                          class="p-space-md rounded-xl border transition-all cursor-pointer flex items-start gap-space-md group"
                          [ngClass]="selectedArtist()?.id === artist.id ? 'bg-surface-container-high border-primary shadow-[0_0_24px_-4px_rgba(212,175,55,0.25)]' : 'bg-surface-container border-outline-variant/30 hover:border-primary/50'"
                        >
                          <div class="w-12 h-12 rounded-full bg-surface-container-highest border border-primary/30 flex items-center justify-center text-primary font-bold shrink-0">
                            {{ artist.name.charAt(0).toUpperCase() }}
                          </div>
                          <div class="flex-1">
                            <div class="flex items-center justify-between">
                              <h3 class="font-label-lg text-label-lg text-on-surface font-bold group-hover:text-primary transition-colors">
                                {{ artist.name }}
                              </h3>
                              <div class="w-4 h-4 rounded-full flex items-center justify-center" [ngClass]="selectedArtist()?.id === artist.id ? 'bg-primary text-on-primary' : 'bg-surface-container-highest'">
                                @if (selectedArtist()?.id === artist.id) {
                                  <span class="material-symbols-outlined text-[12px] font-bold">check</span>
                                }
                              </div>
                            </div>
                            <span class="text-xs text-secondary font-label-md">{{ artist.specialty }}</span>
                            <p class="text-xs text-on-surface-variant line-clamp-2 mt-1">{{ artist.bio }}</p>
                          </div>
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Section: Topography & Scale -->
                  <div class="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-space-md">
                    <div class="flex items-center gap-2 border-b border-outline-variant/20 pb-space-sm">
                      <span class="material-symbols-outlined text-secondary text-[22px]">accessibility_new</span>
                      <h2 class="font-headline-sm text-headline-sm text-on-surface font-semibold">Escala & Topografia da Derme</h2>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                      <div class="space-y-1">
                        <label class="font-label-caps text-label-caps uppercase text-on-surface-variant" for="placement">
                          Localização Anatômica
                        </label>
                        <select
                          id="placement"
                          [(ngModel)]="placement"
                          class="w-full bg-surface-container-lowest text-on-surface font-body-sm text-body-sm p-3 rounded-lg border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                        >
                          <option value="Antebraço">Antebraço (Face Interna / Externa)</option>
                          <option value="Braço Inteiro">Braço Inteiro (Fechamento)</option>
                          <option value="Ombro / Escápula">Ombro / Escápula</option>
                          <option value="Peitoral">Peitoral Maior</option>
                          <option value="Costelas">Costelas / Caixa Torácica</option>
                          <option value="Coxa">Coxa (Lateral / Frontal)</option>
                          <option value="Panturrilha">Panturrilha</option>
                          <option value="Costas">Costas Inteiras</option>
                        </select>
                      </div>

                      <div class="space-y-1">
                        <label class="font-label-caps text-label-caps uppercase text-on-surface-variant" for="scale">
                          Dimensão Estimada da Peça
                        </label>
                        <select
                          id="scale"
                          [(ngModel)]="scale"
                          class="w-full bg-surface-container-lowest text-on-surface font-body-sm text-body-sm p-3 rounded-lg border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                        >
                          <option value="Micro (~5 a 8 cm)">Micro (~5 a 8 cm)</option>
                          <option value="Média (~12 a 18 cm)">Média (~12 a 18 cm)</option>
                          <option value="Grande (~20 a 30 cm)">Grande (~20 a 30 cm)</option>
                          <option value="Fechamento de Membro / Painel Completo">Fechamento de Membro / Painel Completo</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <!-- Section: Descriptive Concept Notes & Tags -->
                  <div class="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-space-md">
                    <div class="flex items-center gap-2 border-b border-outline-variant/20 pb-space-sm">
                      <span class="material-symbols-outlined text-tertiary text-[22px]">description</span>
                      <h2 class="font-headline-sm text-headline-sm text-on-surface font-semibold">Memorial Descritivo & Intenção Poética</h2>
                    </div>

                    <div class="space-y-1">
                      <label class="font-label-caps text-label-caps uppercase text-on-surface-variant" for="concept-notes">
                        Descreva sua Ideia ou Referência
                      </label>
                      <textarea
                        id="concept-notes"
                        [(ngModel)]="conceptDescription"
                        rows="4"
                        placeholder="Ex: Gostaria de uma composição com foco em traços geométricos, hachuras renascentistas e sombreado whip shading. Tenho interesse em incorporar referências florais ou clássicas..."
                        class="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline/60 text-body-md font-body-md p-3 rounded-lg border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                      ></textarea>
                    </div>

                    <!-- Quick Artistic Tags -->
                    <div class="space-y-1.5">
                      <label class="font-label-caps text-label-caps uppercase text-on-surface-variant block">
                        Tags de Estilo Desejado (Clique para adicionar ao conceito)
                      </label>
                      <div class="flex flex-wrap gap-2">
                        @for (tag of quickTags; track tag) {
                          <button
                            type="button"
                            (click)="addTag(tag)"
                            class="px-2.5 py-1 rounded-full text-xs font-label-md bg-surface-container-high hover:bg-surface-container-highest text-secondary border border-outline-variant/30 transition-colors cursor-pointer"
                          >
                            + {{ tag }}
                          </button>
                        }
                      </div>
                    </div>
                  </div>

                  <!-- Next Step Button -->
                  <div class="flex justify-end pt-space-sm">
                    <button
                      type="button"
                      (click)="goToStep2()"
                      class="py-3.5 px-space-xl rounded-xl bg-primary hover:bg-primary-fixed text-on-primary font-label-lg text-label-lg font-bold shadow-[0_0_24px_-4px_rgba(212,175,55,0.3)] transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Avançar para Data & Horário</span>
                      <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              }

              <!-- ========================================== -->
              <!-- STEP 2: DATA & HORÁRIO                     -->
              <!-- ========================================== -->
              @if (currentStep() === 2) {
                <div class="space-y-space-lg">
                  <div class="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-space-md">
                    <div class="flex items-center justify-between border-b border-outline-variant/20 pb-space-sm">
                      <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary text-[22px]">calendar_month</span>
                        <h2 class="font-headline-sm text-headline-sm text-on-surface font-semibold">Calendário Cirúrgico & Janelas de Bancada</h2>
                      </div>
                      @if (selectedArtist(); as artist) {
                        <span class="font-label-caps text-[11px] text-secondary uppercase bg-surface-container px-2 py-0.5 rounded border border-outline-variant/30">
                          Agenda de {{ artist.name }}
                        </span>
                      }
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
                      <!-- Date Selection -->
                      <div class="space-y-space-sm">
                        <label class="font-label-caps text-label-caps uppercase text-on-surface-variant block">
                          Data da Sessão
                        </label>
                        <input
                          type="date"
                          [min]="minDate"
                          [(ngModel)]="selectedDate"
                          (ngModelChange)="checkAvailability()"
                          class="w-full bg-surface-container-lowest text-on-surface font-body-md text-body-md p-3 rounded-lg border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                        />

                        <!-- Duration Selector -->
                        <div class="pt-space-sm space-y-1">
                          <label class="font-label-caps text-label-caps uppercase text-on-surface-variant block">
                            Duração Estimada da Sessão
                          </label>
                          <select
                            [(ngModel)]="durationMinutes"
                            (ngModelChange)="checkAvailability()"
                            class="w-full bg-surface-container-lowest text-on-surface font-body-sm text-body-sm p-3 rounded-lg border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                          >
                            <option [value]="120">2 horas (Sessão rápida / Micro-realismo)</option>
                            <option [value]="180">3 horas (Peça média / Detalhamento)</option>
                            <option [value]="240">4 horas (Peça grande / Sombras)</option>
                            <option [value]="360">6 horas (Bancada diária integral)</option>
                          </select>
                        </div>
                      </div>

                      <!-- Time Slot Selection with Collision Indicator -->
                      <div class="space-y-space-sm">
                        <label class="font-label-caps text-label-caps uppercase text-on-surface-variant block">
                          Horário de Início na Bancada
                        </label>
                        <div class="grid grid-cols-2 gap-2">
                          @for (time of availableTimeSlots; track time) {
                            <button
                              type="button"
                              (click)="selectTimeSlot(time)"
                              [disabled]="isSlotOccupied(time)"
                              class="p-2.5 rounded-lg border font-label-md text-center transition-all cursor-pointer flex items-center justify-center gap-1.5"
                              [ngClass]="{
                                'bg-primary text-on-primary border-primary font-bold shadow-md': selectedTime === time,
                                'bg-surface-container-highest/40 text-outline border-outline-variant/20 line-through cursor-not-allowed opacity-50': isSlotOccupied(time),
                                'bg-surface-container text-on-surface hover:border-primary/50 border-outline-variant/30': selectedTime !== time && !isSlotOccupied(time)
                              }"
                            >
                              <span class="material-symbols-outlined text-[16px]">schedule</span>
                              <span>{{ time }}</span>
                            </button>
                          }
                        </div>

                        @if (hasCollisionWarning()) {
                          <div class="p-3 rounded-lg bg-error-container/20 border border-error/30 text-error text-xs flex items-center gap-2 mt-2">
                            <span class="material-symbols-outlined text-[18px]">error</span>
                            <span>Este horário coincide com outra sessão ativa do tatuador. Selecione outro horário.</span>
                          </div>
                        }
                      </div>
                    </div>

                    <!-- Surgical Biosafety Note -->
                    <div class="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex items-start gap-space-sm mt-4">
                      <span class="material-symbols-outlined text-tertiary text-[20px] shrink-0 mt-0.5">verified_user</span>
                      <div class="text-xs text-on-surface-variant space-y-0.5 leading-relaxed">
                        <strong class="text-on-surface block font-semibold">Protocolo de Assepsia Cirúrgica Grau B</strong>
                        Toda bancada é esterilizada em autoclave hospitalar Classe B e descartáveis 100% esterilizados por óxido de etileno.
                      </div>
                    </div>
                  </div>

                  <!-- Navigation Buttons -->
                  <div class="flex justify-between pt-space-sm">
                    <button
                      type="button"
                      (click)="currentStep.set(1)"
                      class="py-3 px-space-lg rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-label-md transition-colors cursor-pointer"
                    >
                      Voltar: Conceito
                    </button>
                    <button
                      type="button"
                      (click)="goToStep3()"
                      class="py-3.5 px-space-xl rounded-xl bg-primary hover:bg-primary-fixed text-on-primary font-label-lg text-label-lg font-bold shadow-[0_0_24px_-4px_rgba(212,175,55,0.3)] transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Avançar para Depósito</span>
                      <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              }

              <!-- ========================================== -->
              <!-- STEP 3: DEPÓSITO & FINALIZAÇÃO             -->
              <!-- ========================================== -->
              @if (currentStep() === 3) {
                <div class="space-y-space-lg">
                  <div class="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-space-lg">
                    <div class="flex items-center justify-between border-b border-outline-variant/20 pb-space-sm">
                      <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary text-[22px]">lock</span>
                        <h2 class="font-headline-sm text-headline-sm text-on-surface font-semibold">Depósito de Garantia & Caução Escrow</h2>
                      </div>
                      <span class="font-label-caps text-[11px] text-tertiary uppercase bg-surface-container px-2 py-0.5 rounded border border-outline-variant/30">
                        Reserva Garantida
                      </span>
                    </div>

                    <!-- Summary of Order -->
                    <div class="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-space-sm">
                      <span class="font-label-caps text-label-caps text-outline uppercase block">Resumo do Agendamento</span>
                      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-space-sm text-sm">
                        <div>
                          <span class="text-outline text-xs block">Tatuador Residente</span>
                          <strong class="text-on-surface">{{ selectedArtist()?.name }}</strong>
                        </div>
                        <div>
                          <span class="text-outline text-xs block">Data e Horário</span>
                          <strong class="text-primary">{{ formattedDateSummary() }}</strong>
                        </div>
                        <div>
                          <span class="text-outline text-xs block">Duração & Local</span>
                          <strong class="text-on-surface">{{ durationMinutes }} min • {{ placement }}</strong>
                        </div>
                        <div>
                          <span class="text-outline text-xs block">Valor da Caução</span>
                          <strong class="text-secondary font-bold text-base">R$ 300,00</strong>
                        </div>
                      </div>
                    </div>

                    <!-- Payment Details (PIX Preview) -->
                    <div class="p-space-md rounded-xl bg-surface-container border border-outline-variant/30 space-y-space-md">
                      <div class="flex items-center gap-2 text-secondary">
                        <span class="material-symbols-outlined text-[20px]">qr_code_2</span>
                        <span class="font-label-caps text-label-caps uppercase font-bold tracking-wider">PIX Instantâneo Oficial InkCraft</span>
                      </div>

                      <div class="flex flex-col sm:flex-row items-center gap-space-lg p-space-sm bg-surface-container-lowest rounded-lg border border-outline-variant/20">
                        <!-- QR Code visual -->
                        <div class="w-32 h-32 rounded-lg bg-white p-2 flex items-center justify-center shrink-0">
                          <img
                            src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=00020126360014BR.GOV.BCB.PIX0114atelier@inkcraft.com5204000053039865406300.005802BR5916INKCRAFT ATELIER6009SAO PAULO62070503***6304"
                            alt="QR Code PIX InkCraft"
                            class="w-full h-full object-contain"
                          />
                        </div>

                        <div class="space-y-2 flex-1">
                          <p class="text-xs text-on-surface-variant leading-relaxed">
                            A chave PIX do estúdio é <code class="text-primary font-mono bg-surface-container px-1 py-0.5 rounded">atelier&#64;inkcraft.com</code>. O valor de caução de <strong class="text-secondary">R$ 300,00</strong> é integralmente abatido no dia do atendimento e garante exclusividade da bancada na agenda do artista.
                          </p>
                          <div class="flex items-center gap-2">
                            <input
                              type="text"
                              readonly
                              value="00020126360014BR.GOV.BCB.PIX0114atelier@inkcraft.com5204000053039865406300.005802BR5916INKCRAFT ATELIER"
                              class="w-full bg-surface-container text-outline text-xs font-mono p-2 rounded border border-outline-variant/20 select-all"
                            />
                            <button
                              type="button"
                              (click)="copyPix()"
                              class="px-3 py-2 rounded bg-surface-container-high hover:bg-surface-container-highest text-secondary text-xs font-label-md whitespace-nowrap cursor-pointer"
                            >
                              Copiar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Terms & Consent -->
                    <div class="space-y-space-xs pt-space-xs">
                      <label class="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          [(ngModel)]="agreeBookingTerms"
                          class="mt-1 w-4 h-4 rounded bg-surface-container-lowest accent-primary"
                        />
                        <div class="font-body-sm text-body-sm text-on-surface-variant leading-tight">
                          Confirmo a solicitação deste agendamento com as especificações acima e estou ciente da política de reagendamento em até 48 horas antes da sessão.
                        </div>
                      </label>
                    </div>

                    <!-- Final Submission Button -->
                    <div class="flex justify-between pt-space-md border-t border-outline-variant/20">
                      <button
                        type="button"
                        (click)="currentStep.set(2)"
                        class="py-3 px-space-lg rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-label-md transition-colors cursor-pointer"
                      >
                        Voltar: Data
                      </button>

                      <button
                        type="button"
                        [disabled]="isSubmitting() || !agreeBookingTerms"
                        (click)="submitBooking()"
                        class="py-3.5 px-space-xl rounded-xl bg-primary hover:bg-primary-fixed text-on-primary font-label-lg text-label-lg font-bold shadow-[0_0_28px_-6px_rgba(212,175,55,0.4)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        @if (isSubmitting()) {
                          <span class="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                          <span>Processando Agendamento na API...</span>
                        } @else {
                          <span class="material-symbols-outlined text-[20px]">verified</span>
                          <span>Confirmar Depósito & Finalizar Agendamento</span>
                        }
                      </button>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </main>
      </div>
    </div>
  `
})
export class BookingFlowComponent implements OnInit {
  private readonly artistService = inject(ArtistService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly currentStep = signal<number>(1);
  protected readonly artists = signal<TattooArtistResponseDTO[]>([]);
  protected readonly selectedArtist = signal<TattooArtistResponseDTO | null>(null);
  protected readonly isLoadingArtists = signal<boolean>(true);
  protected readonly isSubmitting = signal<boolean>(false);
  protected readonly bookedSlots = signal<BookedSlotResponseDTO[]>([]);

  // Step 1: Concept
  protected placement = 'Antebraço';
  protected scale = 'Média (~12 a 18 cm)';
  protected conceptDescription = '';

  protected readonly quickTags = [
    'Geometria Sagrada',
    'Dotwork Fino',
    'Padrão Fractal',
    'Hachura Renascentista',
    'Metatron & Proporção Áurea',
    'Realismo Dark',
    'Oriental Tradicional'
  ];

  // Step 2: Date & Time
  protected minDate = '';
  protected selectedDate = '';
  protected durationMinutes = 180;
  protected selectedTime = '14:00';
  protected hasCollisionWarning = signal<boolean>(false);

  protected readonly availableTimeSlots = [
    '09:00',
    '10:30',
    '13:00',
    '14:00',
    '16:00',
    '17:30'
  ];

  // Step 3: Terms
  protected agreeBookingTerms = true;

  ngOnInit(): void {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    this.minDate = today.toISOString().split('T')[0];
    this.selectedDate = this.minDate;

    this.loadArtists();
  }

  loadArtists(): void {
    this.isLoadingArtists.set(true);
    this.artistService.findAll().subscribe({
      next: (data) => {
        this.artists.set(data);
        this.isLoadingArtists.set(false);

        // Check query param for preselected artist
        const queryArtistId = this.route.snapshot.queryParams['artistId'];
        if (queryArtistId) {
          const match = data.find(a => a.id === queryArtistId);
          if (match) {
            this.selectArtist(match);
          }
        } else if (data.length > 0) {
          this.selectArtist(data[0]);
        }

        const refTitle = this.route.snapshot.queryParams['referenceTitle'];
        if (refTitle) {
          this.conceptDescription = `Referência da galeria: "${refTitle}". `;
        }
      },
      error: () => {
        this.artists.set([]);
        this.isLoadingArtists.set(false);
      }
    });
  }

  selectArtist(artist: TattooArtistResponseDTO): void {
    this.selectedArtist.set(artist);
    this.loadBookedSlots(artist.id);
  }

  loadBookedSlots(artistId: string): void {
    this.artistService.findBookedSlots(artistId).subscribe({
      next: (slots) => {
        this.bookedSlots.set(slots);
        this.checkAvailability();
      },
      error: () => {
        this.bookedSlots.set([]);
      }
    });
  }

  addTag(tag: string): void {
    if (!this.conceptDescription.includes(tag)) {
      this.conceptDescription += (this.conceptDescription ? ' ' : '') + `[${tag}]`;
    }
  }

  goToStep2(): void {
    if (!this.selectedArtist()) {
      this.toast.error('Selecione o tatuador responsável.');
      return;
    }
    if (!this.conceptDescription.trim()) {
      this.toast.error('Descreva brevemente o conceito ou ideia da tatuagem.');
      return;
    }
    this.currentStep.set(2);
    this.checkAvailability();
  }

  selectTimeSlot(time: string): void {
    this.selectedTime = time;
    this.checkAvailability();
  }

  checkAvailability(): void {
    if (!this.selectedDate || !this.selectedTime) return;

    const startDateTime = new Date(`${this.selectedDate}T${this.selectedTime}:00`);
    const endDateTime = new Date(startDateTime.getTime() + this.durationMinutes * 60000);

    let collision = false;
    for (const slot of this.bookedSlots()) {
      const slotStart = new Date(slot.sessionDate);
      const slotEnd = new Date(slotStart.getTime() + slot.estimatedDurationMinutes * 60000);

      if (startDateTime < slotEnd && slotStart < endDateTime) {
        collision = true;
        break;
      }
    }

    this.hasCollisionWarning.set(collision);
  }

  isSlotOccupied(time: string): boolean {
    if (!this.selectedDate) return false;
    const startDateTime = new Date(`${this.selectedDate}T${time}:00`);
    const endDateTime = new Date(startDateTime.getTime() + this.durationMinutes * 60000);

    for (const slot of this.bookedSlots()) {
      const slotStart = new Date(slot.sessionDate);
      const slotEnd = new Date(slotStart.getTime() + slot.estimatedDurationMinutes * 60000);

      if (startDateTime < slotEnd && slotStart < endDateTime) {
        return true;
      }
    }
    return false;
  }

  goToStep3(): void {
    if (!this.selectedDate || !this.selectedTime) {
      this.toast.error('Selecione a data e o horário desejados.');
      return;
    }
    if (this.hasCollisionWarning()) {
      this.toast.error('O horário selecionado está ocupado na agenda do tatuador. Escolha outra janela.');
      return;
    }
    this.currentStep.set(3);
  }

  formattedDateSummary(): string {
    if (!this.selectedDate || !this.selectedTime) return '';
    const [y, m, d] = this.selectedDate.split('-');
    return `${d}/${m}/${y} às ${this.selectedTime}`;
  }

  copyPix(): void {
    navigator.clipboard?.writeText('atelier@inkcraft.com');
    this.toast.success('Chave PIX copiada para a área de transferência!');
  }

  submitBooking(): void {
    const artist = this.selectedArtist();
    if (!artist) {
      this.toast.error('Nenhum artista selecionado.');
      return;
    }

    if (!this.authService.isAuthenticated()) {
      this.toast.info('Para concluir o agendamento, faça login ou cadastre-se como Cliente.');
      this.router.navigate(['/auth'], {
        queryParams: { returnUrl: '/agendar' }
      });
      return;
    }

    if (!this.authService.isClient()) {
      this.toast.error('Apenas clientes colecionadores podem solicitar agendamentos de tatuagem.');
      return;
    }

    const sessionDateTime = `${this.selectedDate}T${this.selectedTime}:00`;
    const fullSpecs = `Local: ${this.placement} | Escala: ${this.scale} | Especificações: ${this.conceptDescription.trim()}`;

    this.isSubmitting.set(true);

    this.appointmentService.create({
      artistId: artist.id,
      sessionDate: sessionDateTime,
      estimatedDurationMinutes: Number(this.durationMinutes),
      designSpecifications: fullSpecs
    }).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.toast.success('Agendamento solicitado com sucesso! O artista revisará sua solicitação.');
        this.router.navigate(['/meus-agendamentos']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = err.error?.message || 'Falha ao processar o agendamento. Verifique se o horário está disponível.';
        this.toast.error(msg);
      }
    });
  }
}
