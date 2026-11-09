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

export interface CalendarDay {
  date: Date;
  dateString: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isPast: boolean;
  isToday: boolean;
  isSelected: boolean;
  occupiedCount: number;
  freeCount: number;
  isFullyBooked: boolean;
  isFullyFree: boolean;
  slotStatuses: Array<{ time: string; occupied: boolean }>;
}

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
                          [ngModel]="scale"
                          (ngModelChange)="onScaleChange($event)"
                          class="w-full bg-surface-container-lowest text-on-surface font-body-sm text-body-sm p-3 rounded-lg border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                        >
                          <option value="Micro (~5 a 8 cm)">Micro (~5 a 8 cm) • ~2 horas</option>
                          <option value="Média (~12 a 18 cm)">Média (~12 a 18 cm) • ~3 horas</option>
                          <option value="Grande (~20 a 30 cm)">Grande (~20 a 30 cm) • ~4 horas</option>
                          <option value="Fechamento de Membro / Painel Completo">Fechamento de Membro / Painel Completo • ~6 horas</option>
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
              <!-- STEP 2: DATA & HORÁRIO (CALENDÁRIO MENSAL) -->
              <!-- ========================================== -->
              @if (currentStep() === 2) {
                <div class="space-y-space-lg">
                  <div class="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-space-md">
                    <!-- Header -->
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-outline-variant/20 pb-space-sm gap-2">
                      <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary text-[24px]">calendar_month</span>
                        <div>
                          <h2 class="font-headline-sm text-headline-sm text-on-surface font-semibold">Calendário Cirúrgico & Janelas de Bancada</h2>
                          <p class="text-xs text-on-surface-variant">Selecione uma data no calendário mensal para conferir os horários disponíveis e reservar sua bancada.</p>
                        </div>
                      </div>
                      @if (selectedArtist(); as artist) {
                        <span class="font-label-caps text-[11px] text-secondary uppercase bg-surface-container px-3 py-1 rounded-lg border border-outline-variant/30 self-start sm:self-auto shrink-0">
                          Agenda de {{ artist.name }}
                        </span>
                      }
                    </div>

                    <!-- Calendar Controls & Legend -->
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
                      <!-- Month Navigator -->
                      <div class="flex items-center gap-2">
                        <button
                          type="button"
                          (click)="prevMonth()"
                          class="w-9 h-9 rounded-lg bg-surface-container hover:bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center text-on-surface transition-colors cursor-pointer"
                          title="Mês Anterior"
                        >
                          <span class="material-symbols-outlined text-[18px]">chevron_left</span>
                        </button>

                        <div class="font-headline-sm text-base text-primary font-bold px-2 tracking-wide uppercase min-w-[190px] text-center">
                          {{ calendarMonthLabel() }}
                        </div>

                        <button
                          type="button"
                          (click)="nextMonth()"
                          class="w-9 h-9 rounded-lg bg-surface-container hover:bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center text-on-surface transition-colors cursor-pointer"
                          title="Próximo Mês"
                        >
                          <span class="material-symbols-outlined text-[18px]">chevron_right</span>
                        </button>

                        <button
                          type="button"
                          (click)="goToCurrentMonth()"
                          class="px-2.5 py-1.5 rounded-lg text-xs font-label-md bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant border border-outline-variant/30 transition-colors cursor-pointer ml-1"
                        >
                          Mês Atual
                        </button>
                      </div>

                      <!-- Visual Legend -->
                      <div class="flex items-center gap-3 text-xs flex-wrap font-label-md">
                        <div class="flex items-center gap-1.5 text-tertiary">
                          <span class="w-2.5 h-2.5 rounded-full bg-tertiary shadow-[0_0_8px_rgba(88,231,170,0.5)]"></span>
                          <span>Livre / Horários Disponíveis</span>
                        </div>
                        <div class="flex items-center gap-1.5 text-error">
                          <span class="w-2.5 h-2.5 rounded-full bg-error shadow-[0_0_8px_rgba(255,180,171,0.5)]"></span>
                          <span>Lotado (Todos Ocupados)</span>
                        </div>
                        <div class="flex items-center gap-1.5 text-primary">
                          <span class="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(242,202,80,0.5)]"></span>
                          <span>Data Selecionada</span>
                        </div>
                      </div>
                    </div>

                    <!-- Monthly Calendar Grid -->
                    <div class="rounded-xl border border-outline-variant/30 bg-surface-container-lowest/80 p-2 sm:p-3 overflow-hidden shadow-inner">
                      <!-- Weekday Header Row -->
                      <div class="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                        @for (dayName of weekdayNames; track dayName) {
                          <div class="text-center font-label-caps text-[11px] font-bold text-outline uppercase tracking-wider py-1">
                            {{ dayName }}
                          </div>
                        }
                      </div>

                      <!-- Days Cells Grid -->
                      <div class="grid grid-cols-7 gap-1 sm:gap-2">
                        @for (day of calendarDays(); track day.dateString + day.isCurrentMonth) {
                          <div
                            (click)="openDayModal(day)"
                            class="min-h-[75px] sm:min-h-[92px] p-2 rounded-xl border transition-all flex flex-col justify-between select-none relative group"
                            [ngClass]="{
                              'bg-surface-container-lowest/30 border-transparent text-outline/30 cursor-default pointer-events-none opacity-40': !day.isCurrentMonth,
                              'bg-surface-container-lowest/50 border-outline-variant/10 text-outline/40 cursor-not-allowed opacity-50': day.isCurrentMonth && day.isPast,
                              'bg-error-container/15 border-error/40 text-error hover:border-error cursor-pointer shadow-sm': day.isCurrentMonth && !day.isPast && day.isFullyBooked,
                              'bg-tertiary/10 border-tertiary/30 text-tertiary hover:border-tertiary hover:bg-tertiary/15 cursor-pointer shadow-sm': day.isCurrentMonth && !day.isPast && day.isFullyFree,
                              'bg-surface-container border-outline-variant/40 hover:border-tertiary/60 cursor-pointer shadow-sm': day.isCurrentMonth && !day.isPast && !day.isFullyBooked && !day.isFullyFree,
                              '!border-primary !ring-2 !ring-primary/40 !bg-surface-container-high !shadow-[0_0_20px_-3px_rgba(212,175,55,0.4)]': day.isCurrentMonth && day.isSelected
                            }"
                          >
                            <!-- Day Number & Status Badge -->
                            <div class="flex items-start justify-between gap-1 w-full">
                              <span
                                class="font-bold text-xs sm:text-sm"
                                [ngClass]="{
                                  'text-primary font-black': day.isSelected,
                                  'text-on-surface': day.isCurrentMonth && !day.isPast && !day.isSelected,
                                  'text-outline/40': day.isPast || !day.isCurrentMonth
                                }"
                              >
                                {{ day.dayNumber }}
                              </span>

                              @if (day.isCurrentMonth && !day.isPast) {
                                @if (day.isFullyBooked) {
                                  <span class="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold uppercase bg-error/20 text-error border border-error/30 flex items-center gap-1">
                                    <span class="w-1.5 h-1.5 rounded-full bg-error shrink-0"></span>
                                    <span class="hidden sm:inline">Lotado</span>
                                  </span>
                                } @else if (day.isFullyFree) {
                                  <span class="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold uppercase bg-tertiary/20 text-tertiary border border-tertiary/30 flex items-center gap-1">
                                    <span class="w-1.5 h-1.5 rounded-full bg-tertiary shrink-0"></span>
                                    <span class="hidden sm:inline">Livre</span>
                                  </span>
                                } @else {
                                  <span class="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold uppercase bg-tertiary/15 text-tertiary border border-tertiary/30">
                                    {{ day.freeCount }} <span class="hidden sm:inline">livres</span>
                                  </span>
                                }
                              } @else if (day.isCurrentMonth && day.isPast) {
                                <span class="text-[9px] font-mono text-outline/40 uppercase">Past</span>
                              }
                            </div>

                            <!-- Mini Slot Dots for Visual Density -->
                            @if (day.isCurrentMonth && !day.isPast) {
                              <div class="flex items-center gap-1 mt-1 sm:mt-2">
                                @for (slot of day.slotStatuses; track slot.time) {
                                  <span
                                    class="w-1.5 h-1.5 rounded-full transition-transform group-hover:scale-125"
                                    [title]="slot.time + (slot.occupied ? ' (Ocupado)' : ' (Livre)')"
                                    [ngClass]="slot.occupied ? 'bg-error shadow-[0_0_4px_rgba(255,180,171,0.6)]' : 'bg-tertiary shadow-[0_0_4px_rgba(88,231,170,0.6)]'"
                                  ></span>
                                }
                              </div>
                            }

                            <!-- Selection Indicator Pin -->
                            @if (day.isSelected) {
                              <div class="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-surface flex items-center justify-center"></div>
                            }
                          </div>
                        }
                      </div>
                    </div>

                    <!-- Selected Slot Summary Box -->
                    <div class="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                      <div class="space-y-1">
                        <span class="font-label-caps text-label-caps text-outline uppercase block">Reserva de Bancada Atual</span>
                        <div class="flex items-center gap-2 flex-wrap text-sm">
                          <div class="flex items-center gap-1.5 text-primary font-bold">
                            <span class="material-symbols-outlined text-[18px]">event</span>
                            <span>{{ formatFullDate(selectedDate) }}</span>
                          </div>
                          <span class="text-outline">•</span>
                          <div class="flex items-center gap-1.5 text-secondary font-bold">
                            <span class="material-symbols-outlined text-[18px]">schedule</span>
                            <span>{{ selectedTime }} às {{ getEndSessionTime(selectedTime, durationMinutes) }} ({{ durationMinutes / 60 }}h)</span>
                          </div>
                        </div>
                        <div class="text-xs text-on-surface-variant flex items-center gap-1.5 pt-0.5">
                          <span class="material-symbols-outlined text-[15px] text-tertiary">check_circle</span>
                          <span>Janelas bloqueadas no atelier: <strong class="text-secondary font-medium">{{ getCoveredSlotsLabel(selectedTime, durationMinutes) }}</strong></span>
                        </div>
                      </div>

                      <button
                        type="button"
                        (click)="reopenModalForSelectedDate()"
                        class="py-2.5 px-4 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-primary font-label-md text-xs border border-primary/30 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-sm"
                      >
                        <span class="material-symbols-outlined text-[16px]">edit_calendar</span>
                        <span>Trocar Horário ou Duração</span>
                      </button>
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

      <!-- ======================================================== -->
      <!-- MODAL DE HORÁRIOS DISPONÍVEIS NA DATA                    -->
      <!-- ======================================================== -->
      @if (isTimeModalOpen()) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md overflow-y-auto"
          (click)="onBackdropClick($event)"
        >
          <div
            class="relative w-full max-w-2xl bg-surface-container-low border border-outline-variant/40 rounded-2xl p-6 shadow-2xl space-y-5 my-8 animate-in fade-in zoom-in-95 duration-200"
            (click)="$event.stopPropagation()"
          >
            <!-- Modal Header -->
            <div class="flex items-start justify-between border-b border-outline-variant/20 pb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                  <span class="material-symbols-outlined text-[24px]">schedule</span>
                </div>
                <div>
                  <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold">Janelas Disponíveis na Bancada</h3>
                  <p class="text-xs text-primary font-medium">
                    {{ formatFullDate(modalDate()) }}
                    @if (selectedArtist(); as artist) {
                      <span class="text-on-surface-variant">• Tatuador: {{ artist.name }}</span>
                    }
                  </p>
                </div>
              </div>

              <button
                type="button"
                (click)="closeTimeModal()"
                class="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center text-outline hover:text-on-surface transition-colors cursor-pointer"
              >
                <span class="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <!-- Duration Selection inside Modal -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="font-label-caps text-label-caps uppercase text-on-surface-variant block">
                  Duração Estimada do Procedimento
                </label>
                <span class="text-xs text-secondary font-mono">{{ modalDurationMinutes() / 60 }} horas de bancada</span>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  (click)="setModalDuration(120)"
                  class="p-2.5 rounded-lg border text-left transition-all cursor-pointer"
                  [ngClass]="modalDurationMinutes() === 120 ? 'bg-primary/20 border-primary text-primary font-bold shadow-sm' : 'bg-surface-container border-outline-variant/30 text-on-surface-variant hover:text-on-surface'"
                >
                  <div class="text-sm font-bold">2 Horas</div>
                  <div class="text-[10px] opacity-75">Sessão Rápida</div>
                </button>
                <button
                  type="button"
                  (click)="setModalDuration(180)"
                  class="p-2.5 rounded-lg border text-left transition-all cursor-pointer"
                  [ngClass]="modalDurationMinutes() === 180 ? 'bg-primary/20 border-primary text-primary font-bold shadow-sm' : 'bg-surface-container border-outline-variant/30 text-on-surface-variant hover:text-on-surface'"
                >
                  <div class="text-sm font-bold">3 Horas</div>
                  <div class="text-[10px] opacity-75">Peça Média</div>
                </button>
                <button
                  type="button"
                  (click)="setModalDuration(240)"
                  class="p-2.5 rounded-lg border text-left transition-all cursor-pointer"
                  [ngClass]="modalDurationMinutes() === 240 ? 'bg-primary/20 border-primary text-primary font-bold shadow-sm' : 'bg-surface-container border-outline-variant/30 text-on-surface-variant hover:text-on-surface'"
                >
                  <div class="text-sm font-bold">4 Horas</div>
                  <div class="text-[10px] opacity-75">Peça Grande</div>
                </button>
                <button
                  type="button"
                  (click)="setModalDuration(360)"
                  class="p-2.5 rounded-lg border text-left transition-all cursor-pointer"
                  [ngClass]="modalDurationMinutes() === 360 ? 'bg-primary/20 border-primary text-primary font-bold shadow-sm' : 'bg-surface-container border-outline-variant/30 text-on-surface-variant hover:text-on-surface'"
                >
                  <div class="text-sm font-bold">6 Horas</div>
                  <div class="text-[10px] opacity-75">Fechamento / Integral</div>
                </button>
              </div>
            </div>

            <!-- Auto-allocation Explanatory Note -->
            <div class="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex items-start gap-2.5 text-xs text-on-surface-variant leading-relaxed">
              <span class="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">info</span>
              <div>
                <strong class="text-on-surface block font-semibold">Alocação de Múltiplos Horários de Bancada</strong>
                Sessões com mais de 2 horas ocupam automaticamente as janelas cirúrgicas subsequentes (ex: tatuagem grande às 09:00 com 3h ou 4h ocupará automaticamente a janela das 10:30).
              </div>
            </div>

            <!-- Slots Grid -->
            <div class="space-y-2">
              <label class="font-label-caps text-label-caps uppercase text-on-surface-variant block">
                Escolha o Horário de Início
              </label>

              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                @for (time of availableTimeSlots; track time) {
                  @let slotCheck = checkSlotAvailability(modalDate(), time, modalDurationMinutes());
                  <button
                    type="button"
                    [disabled]="!slotCheck.available"
                    (click)="selectModalTimeSlot(time)"
                    class="p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 relative cursor-pointer"
                    [ngClass]="{
                      'bg-primary text-on-primary border-primary shadow-[0_0_20px_-3px_rgba(212,175,55,0.4)] font-bold': modalSelectedTime() === time && slotCheck.available,
                      'bg-surface-container-highest/20 text-outline/50 border-outline-variant/20 cursor-not-allowed opacity-60': !slotCheck.available,
                      'bg-surface-container text-on-surface border-outline-variant/30 hover:border-primary/50': modalSelectedTime() !== time && slotCheck.available
                    }"
                  >
                    <div class="flex items-center justify-between w-full">
                      <div class="flex items-center gap-1.5 font-headline-sm text-base">
                        <span class="material-symbols-outlined text-[18px]">schedule</span>
                        <span>{{ time }}</span>
                      </div>
                      @if (modalSelectedTime() === time && slotCheck.available) {
                        <span class="material-symbols-outlined text-[18px]">check_circle</span>
                      } @else if (!slotCheck.available) {
                        <span class="material-symbols-outlined text-[16px] text-error">block</span>
                      }
                    </div>

                    <div class="text-[11px] leading-tight">
                      @if (!slotCheck.available) {
                        <span class="text-error font-medium line-through block">{{ slotCheck.reason }}</span>
                      } @else if (modalSelectedTime() === time) {
                        <span class="text-on-primary/90 font-medium block">
                          Janelas: {{ getCoveredSlotsLabel(time, modalDurationMinutes()) }}
                        </span>
                      } @else {
                        <span class="text-tertiary font-medium block">Livre</span>
                      }
                    </div>
                  </button>
                }
              </div>
            </div>

            <!-- Projection of selected slot -->
            @if (modalSelectedTime() && checkSlotAvailability(modalDate(), modalSelectedTime(), modalDurationMinutes()).available) {
              <div class="p-3.5 rounded-xl bg-surface-container border border-primary/30 flex items-center justify-between gap-3 text-xs">
                <div class="space-y-0.5">
                  <span class="font-label-caps text-[10px] text-secondary uppercase block font-semibold">Projeção da Bancada</span>
                  <div class="text-on-surface font-medium">
                    Início às <strong class="text-primary">{{ modalSelectedTime() }}</strong> • Término previsto às <strong class="text-primary">{{ getEndSessionTime(modalSelectedTime(), modalDurationMinutes()) }}</strong> ({{ modalDurationMinutes() / 60 }}h de atendimento)
                  </div>
                  <div class="text-on-surface-variant text-[11px]">
                    Horários ocupados por esta sessão: <strong class="text-secondary">{{ getCoveredSlotsLabel(modalSelectedTime(), modalDurationMinutes()) }}</strong>
                  </div>
                </div>
                <span class="material-symbols-outlined text-primary text-[28px] shrink-0">event_available</span>
              </div>
            }

            <!-- Modal Footer -->
            <div class="flex items-center justify-end gap-3 pt-2 border-t border-outline-variant/20">
              <button
                type="button"
                (click)="closeTimeModal()"
                class="py-2.5 px-space-md rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-label-md text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                (click)="confirmModalSelection()"
                class="py-2.5 px-space-lg rounded-xl bg-primary hover:bg-primary-fixed text-on-primary font-label-md text-xs font-bold shadow-[0_0_16px_-4px_rgba(212,175,55,0.4)] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span class="material-symbols-outlined text-[16px]">check</span>
                <span>Confirmar Horário de Bancada</span>
              </button>
            </div>
          </div>
        </div>
      }
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
  protected scale = 'Grande (~20 a 30 cm)';
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
  protected durationMinutes = 240; // Default for Grande (~20 a 30 cm)
  protected selectedTime = '09:00';
  protected hasCollisionWarning = signal<boolean>(false);

  // Calendar navigation state
  protected readonly calendarDate = signal<Date>(new Date());
  protected readonly monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  protected readonly weekdayNames = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

  // Time Slots Modal state
  protected readonly isTimeModalOpen = signal<boolean>(false);
  protected readonly modalDate = signal<string>('');
  protected readonly modalSelectedTime = signal<string>('09:00');
  protected readonly modalDurationMinutes = signal<number>(240);

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

  // Computed label for calendar header: e.g. "Novembro de 2026"
  protected readonly calendarMonthLabel = computed(() => {
    const cur = this.calendarDate();
    return `${this.monthNames[cur.getMonth()]} de ${cur.getFullYear()}`;
  });

  // Computed calendar days grid for the current month
  protected readonly calendarDays = computed(() => {
    const current = this.calendarDate();
    const year = current.getFullYear();
    const month = current.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const todayStr = this.formatDateString(new Date());
    const days: CalendarDay[] = [];

    // Previous month padding days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, dayNum);
      const prevDateStr = this.formatDateString(prevDate);
      days.push({
        date: prevDate,
        dateString: prevDateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isPast: true,
        isToday: prevDateStr === todayStr,
        isSelected: prevDateStr === this.selectedDate,
        occupiedCount: 0,
        freeCount: this.availableTimeSlots.length,
        isFullyBooked: false,
        isFullyFree: false,
        slotStatuses: []
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dateStr = this.formatDateString(date);
      const isPast = dateStr < this.minDate;

      const slotStatuses = this.availableTimeSlots.map(time => {
        const occupied = this.isSlotOccupiedByExistingBooking(dateStr, time);
        return { time, occupied };
      });

      const occupiedCount = slotStatuses.filter(s => s.occupied).length;
      const freeCount = this.availableTimeSlots.length - occupiedCount;
      const isFullyBooked = !isPast && occupiedCount === this.availableTimeSlots.length;
      const isFullyFree = !isPast && occupiedCount === 0;

      days.push({
        date,
        dateString: dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        isPast,
        isToday: dateStr === todayStr,
        isSelected: dateStr === this.selectedDate,
        occupiedCount,
        freeCount,
        isFullyBooked,
        isFullyFree,
        slotStatuses
      });
    }

    // Next month padding days to complete 35 or 42 grid cells
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = new Date(year, month + 1, i);
      const nextDateStr = this.formatDateString(nextDate);
      days.push({
        date: nextDate,
        dateString: nextDateStr,
        dayNumber: i,
        isCurrentMonth: false,
        isPast: false,
        isToday: nextDateStr === todayStr,
        isSelected: nextDateStr === this.selectedDate,
        occupiedCount: 0,
        freeCount: this.availableTimeSlots.length,
        isFullyBooked: false,
        isFullyFree: false,
        slotStatuses: []
      });
    }

    return days;
  });

  ngOnInit(): void {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    this.minDate = this.formatDateString(today);
    this.selectedDate = this.minDate;

    // Center calendar on minDate month
    const [y, m] = this.minDate.split('-').map(Number);
    this.calendarDate.set(new Date(y, m - 1, 1));

    // Automatically sync initial duration with initial scale
    this.syncDurationWithScale(this.scale);

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

  onScaleChange(newScale: string): void {
    this.scale = newScale;
    this.syncDurationWithScale(newScale);
    this.checkAvailability();
  }

  private syncDurationWithScale(scaleValue: string): void {
    if (scaleValue.includes('Micro')) {
      this.durationMinutes = 120; // 2h
    } else if (scaleValue.includes('Média')) {
      this.durationMinutes = 180; // 3h
    } else if (scaleValue.includes('Grande')) {
      this.durationMinutes = 240; // 4h
    } else if (scaleValue.includes('Fechamento')) {
      this.durationMinutes = 360; // 6h
    } else {
      this.durationMinutes = 180;
    }
    this.modalDurationMinutes.set(this.durationMinutes);
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

  // ==========================================
  // CALENDAR NAVIGATION
  // ==========================================
  prevMonth(): void {
    const cur = this.calendarDate();
    this.calendarDate.set(new Date(cur.getFullYear(), cur.getMonth() - 1, 1));
  }

  nextMonth(): void {
    const cur = this.calendarDate();
    this.calendarDate.set(new Date(cur.getFullYear(), cur.getMonth() + 1, 1));
  }

  goToCurrentMonth(): void {
    const [y, m] = this.minDate.split('-').map(Number);
    this.calendarDate.set(new Date(y, m - 1, 1));
  }

  openDayModal(day: CalendarDay): void {
    if (day.isPast || !day.isCurrentMonth) {
      if (day.isPast) {
        this.toast.info('Não é possível agendar datas que já passaram.');
      }
      return;
    }

    this.modalDate.set(day.dateString);
    this.modalDurationMinutes.set(this.durationMinutes);

    // If day is already selected, use current selectedTime, else pick first available slot
    let initialTime = this.modalSelectedTime();
    if (day.dateString !== this.selectedDate) {
      initialTime = this.findFirstAvailableSlot(day.dateString, this.modalDurationMinutes()) || '09:00';
    }
    this.modalSelectedTime.set(initialTime);
    this.isTimeModalOpen.set(true);
  }

  reopenModalForSelectedDate(): void {
    if (!this.selectedDate) return;
    this.modalDate.set(this.selectedDate);
    this.modalSelectedTime.set(this.selectedTime);
    this.modalDurationMinutes.set(this.durationMinutes);
    this.isTimeModalOpen.set(true);
  }

  closeTimeModal(): void {
    this.isTimeModalOpen.set(false);
  }

  onBackdropClick(event: MouseEvent): void {
    this.closeTimeModal();
  }

  setModalDuration(duration: number): void {
    this.modalDurationMinutes.set(duration);
    // If current selected time is not valid with this new duration, find first available
    const check = this.checkSlotAvailability(this.modalDate(), this.modalSelectedTime(), duration);
    if (!check.available) {
      const alt = this.findFirstAvailableSlot(this.modalDate(), duration);
      if (alt) {
        this.modalSelectedTime.set(alt);
      }
    }
  }

  selectModalTimeSlot(time: string): void {
    const check = this.checkSlotAvailability(this.modalDate(), time, this.modalDurationMinutes());
    if (!check.available) {
      this.toast.error(check.reason || 'Horário indisponível.');
      return;
    }
    this.modalSelectedTime.set(time);
  }

  confirmModalSelection(): void {
    const date = this.modalDate();
    const time = this.modalSelectedTime();
    const duration = this.modalDurationMinutes();

    const check = this.checkSlotAvailability(date, time, duration);
    if (!check.available) {
      this.toast.error(check.reason || 'O horário selecionado está indisponível.');
      return;
    }

    this.selectedDate = date;
    this.selectedTime = time;
    this.durationMinutes = duration;
    this.checkAvailability();
    this.isTimeModalOpen.set(false);

    const covered = this.getCoveredSlotsLabel(time, duration);
    this.toast.success(`Horário confirmado: ${this.formatFullDate(date)} às ${time} (Janelas: ${covered})`);
  }

  // ==========================================
  // TIME & MULTI-SLOT AVAILABILITY CALCULATIONS
  // ==========================================
  timeToMinutes(time: string): number {
    if (!time) return 0;
    const [h, m] = time.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  }

  minutesToTime(totalMin: number): string {
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  formatDateString(date: Date): string {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  getBookingsForDate(dateStr: string): Array<{ startMin: number; endMin: number }> {
    return this.bookedSlots()
      .filter(slot => slot.sessionDate && slot.sessionDate.startsWith(dateStr))
      .map(slot => {
        const timePart = slot.sessionDate.includes('T') ? slot.sessionDate.split('T')[1] : '09:00';
        const [h, m] = timePart.split(':').map(Number);
        const startMin = (h || 0) * 60 + (m || 0);
        const endMin = startMin + (slot.estimatedDurationMinutes || 120);
        return { startMin, endMin };
      });
  }

  isSlotOccupiedByExistingBooking(dateStr: string, time: string): boolean {
    const slotMin = this.timeToMinutes(time);
    const bookings = this.getBookingsForDate(dateStr);
    return bookings.some(b => slotMin >= b.startMin && slotMin < b.endMin);
  }

  getSlotsCoveredBySession(startTime: string, durationMinutes: number): string[] {
    const startMin = this.timeToMinutes(startTime);
    const endMin = startMin + durationMinutes;
    return this.availableTimeSlots.filter(s => {
      const sm = this.timeToMinutes(s);
      return sm >= startMin && sm < endMin;
    });
  }

  getEndSessionTime(startTime: string, durationMinutes: number): string {
    const startMin = this.timeToMinutes(startTime);
    const endMin = startMin + durationMinutes;
    return this.minutesToTime(endMin);
  }

  getCoveredSlotsLabel(startTime: string, durationMinutes: number): string {
    const covered = this.getSlotsCoveredBySession(startTime, durationMinutes);
    if (covered.length <= 1) return startTime;
    return covered.join(', ').replace(/, ([^,]*)$/, ' e $1');
  }

  checkSlotAvailability(dateStr: string, time: string, duration: number): {
    available: boolean;
    reason?: string;
    coveredSlots: string[];
  } {
    const startMin = this.timeToMinutes(time);
    const endMin = startMin + duration;
    const bookings = this.getBookingsForDate(dateStr);
    const coveredSlots = this.getSlotsCoveredBySession(time, duration);

    // 1. Is the slot directly occupied?
    const directlyOccupied = bookings.some(b => startMin >= b.startMin && startMin < b.endMin);
    if (directlyOccupied) {
      return {
        available: false,
        reason: 'Ocupado por outro cliente',
        coveredSlots
      };
    }

    // 2. Does this proposed session collide with any active booking?
    for (const b of bookings) {
      if (startMin < b.endMin && b.startMin < endMin) {
        const conflictTime = this.minutesToTime(b.startMin);
        return {
          available: false,
          reason: `Colide com agendamento das ${conflictTime}`,
          coveredSlots
        };
      }
    }

    // 3. Does it exceed atelier closing time (20:30)?
    const STUDIO_CLOSE_MIN = 20 * 60 + 30;
    if (endMin > STUDIO_CLOSE_MIN) {
      return {
        available: false,
        reason: 'Excede encerramento do atelier (20:30)',
        coveredSlots
      };
    }

    return {
      available: true,
      coveredSlots
    };
  }

  findFirstAvailableSlot(dateStr: string, duration: number): string | null {
    for (const slot of this.availableTimeSlots) {
      const check = this.checkSlotAvailability(dateStr, slot, duration);
      if (check.available) {
        return slot;
      }
    }
    return null;
  }

  checkAvailability(): void {
    if (!this.selectedDate || !this.selectedTime) return;
    const check = this.checkSlotAvailability(this.selectedDate, this.selectedTime, this.durationMinutes);
    this.hasCollisionWarning.set(!check.available);
  }

  goToStep3(): void {
    if (!this.selectedDate || !this.selectedTime) {
      this.toast.error('Selecione a data e o horário desejados no calendário.');
      return;
    }
    const availability = this.checkSlotAvailability(this.selectedDate, this.selectedTime, this.durationMinutes);
    if (!availability.available) {
      this.toast.error(availability.reason || 'O horário selecionado está ocupado na agenda do tatuador. Escolha outra janela.');
      return;
    }
    this.currentStep.set(3);
  }

  formatFullDate(dateStr: string): string {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' });
    const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
    return `${capitalizedWeekday}, ${d} de ${this.monthNames[m - 1]} de ${y}`;
  }

  formattedDateSummary(): string {
    if (!this.selectedDate || !this.selectedTime) return '';
    const [y, m, d] = this.selectedDate.split('-');
    const endTime = this.getEndSessionTime(this.selectedTime, this.durationMinutes);
    return `${d}/${m}/${y} das ${this.selectedTime} às ${endTime} (${this.durationMinutes / 60}h)`;
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
    const coveredSlots = this.getCoveredSlotsLabel(this.selectedTime, this.durationMinutes);
    const fullSpecs = `Local: ${this.placement} | Escala: ${this.scale} | Janelas Ocupadas: ${coveredSlots} | Especificações: ${this.conceptDescription.trim()}`;

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
