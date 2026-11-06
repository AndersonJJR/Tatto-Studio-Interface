import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../booking/services/appointment.service';
import { AppointmentResponseDTO, AppointmentStatus } from '../../../core/models/appointment.models';
import { ToastService } from '../../../core/services/toast.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-artist-agenda',
  standalone: true,
  imports: [CommonModule, EmptyStateComponent],
  template: `
    <div class="w-full flex flex-col bg-background pt-20 min-h-screen">
      <!-- Top Header & Breadcrumbs Context -->
      <section class="w-full px-gutter md:px-margin pt-space-lg pb-space-md border-b border-outline-variant/20 bg-surface-container-lowest">
        <div class="flex flex-col gap-space-md">
          <div class="flex items-center gap-space-xs text-on-surface-variant font-label-caps text-label-caps uppercase tracking-widest">
            <span>PAINEL DO TATUADOR</span>
            <span class="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
            <span class="text-primary font-bold">AGENDA & BANCADA CIRÚRGICA</span>
          </div>

          <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg">
            <div class="space-y-space-xs max-w-3xl">
              <h1 class="font-headline-lg text-headline-lg tracking-tight text-on-surface">
                Fluxo Operacional de <span class="text-primary">Horários & Bancada</span>
              </h1>
              <p class="font-body-md text-body-md text-on-surface-variant">
                Controle de acolhimento e confirmação de sessões, conciliação de horários de assepsia e finalização técnica dos atendimentos.
              </p>
            </div>

            <!-- Quick Status Metrics Summary -->
            <div class="flex items-center gap-space-md shrink-0">
              <div class="px-space-md py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-center">
                <span class="font-label-caps text-[10px] text-outline uppercase block">Pendentes</span>
                <span class="font-headline-md text-headline-md text-amber-400 font-bold">{{ pendingCount() }}</span>
              </div>
              <div class="px-space-md py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-center">
                <span class="font-label-caps text-[10px] text-outline uppercase block">Confirmadas</span>
                <span class="font-headline-md text-headline-md text-emerald-400 font-bold">{{ confirmedCount() }}</span>
              </div>
              <div class="px-space-md py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-center">
                <span class="font-label-caps text-[10px] text-outline uppercase block">Total</span>
                <span class="font-headline-md text-headline-md text-primary font-bold">{{ appointments().length }}</span>
              </div>
            </div>
          </div>

          <!-- Status Filter Tabs -->
          <div class="flex items-center gap-2 pt-2 border-t border-outline-variant/20 overflow-x-auto pb-1">
            @for (filter of filterOptions; track filter.key) {
              <button
                type="button"
                (click)="selectedStatusFilter.set(filter.key)"
                class="py-1.5 px-space-md rounded-lg font-label-md text-label-md transition-all cursor-pointer whitespace-nowrap border"
                [ngClass]="selectedStatusFilter() === filter.key ? 'bg-primary text-on-primary font-bold border-primary shadow-sm' : 'bg-surface-container text-on-surface-variant border-outline-variant/30 hover:text-on-surface'"
              >
                {{ filter.label }}
              </button>
            }
          </div>
        </div>
      </section>

      <!-- Main Agenda Content -->
      <main class="w-full px-gutter md:px-margin py-space-xl">
        @if (isLoading()) {
          <div class="w-full py-20 flex flex-col items-center justify-center gap-4">
            <span class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
            <p class="font-label-caps text-label-caps text-outline uppercase tracking-widest">Sincronizando Agenda na API...</p>
          </div>
        } @else if (filteredAppointments().length === 0) {
          <!-- Empty State when artist has 0 appointments -->
          <div class="py-12">
            <app-empty-state
              icon="calendar_today"
              title="Nenhum atendimento encontrado para este filtro"
              message="Sua bancada está livre. Conforme os clientes solicitarem orçamentos e agendamentos pelo portfólio, as sessões aparecerão aqui para sua aprovação."
            />
          </div>
        } @else {
          <div class="space-y-space-md">
            @for (apt of filteredAppointments(); track apt.id) {
              <div
                class="rounded-xl bg-surface-container border p-space-lg flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg shadow-md hover:border-primary/50 transition-all duration-300"
                [ngClass]="statusBorderClass(apt.status)"
              >
                <!-- Client & Session Info -->
                <div class="space-y-space-xs flex-1">
                  <div class="flex items-center gap-3 flex-wrap">
                    <span
                      class="px-2.5 py-0.5 rounded-full text-xs font-label-caps uppercase font-bold border flex items-center gap-1.5"
                      [ngClass]="statusBadgeClass(apt.status)"
                    >
                      <span class="w-2 h-2 rounded-full" [ngClass]="statusDotClass(apt.status)"></span>
                      {{ statusLabel(apt.status) }}
                    </span>

                    <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold">
                      {{ apt.clientName }}
                    </h3>

                    @if (apt.clientPhone) {
                      <span class="text-xs font-mono text-secondary px-2 py-0.5 rounded bg-surface-container-high border border-outline-variant/30 flex items-center gap-1">
                        <span class="material-symbols-outlined text-[14px]">call</span>
                        {{ apt.clientPhone }}
                      </span>
                    }

                    <span class="text-xs text-outline font-label-md">
                      {{ apt.clientEmail }}
                    </span>
                  </div>

                  <!-- Date & Specs -->
                  <div class="pt-1 flex flex-wrap items-center gap-4 text-xs font-label-md text-on-surface-variant">
                    <div class="flex items-center gap-1 text-primary">
                      <span class="material-symbols-outlined text-[16px]">schedule</span>
                      <strong class="font-semibold text-sm">{{ formatDate(apt.sessionDate) }}</strong>
                    </div>

                    <div class="flex items-center gap-1">
                      <span class="material-symbols-outlined text-[16px]">timer</span>
                      <span>{{ apt.estimatedDurationMinutes }} min na bancada</span>
                    </div>

                    <div class="flex items-center gap-1 text-outline">
                      <span class="material-symbols-outlined text-[16px]">event</span>
                      <span>Solicitado em {{ formatDateOnly(apt.createdAt) }}</span>
                    </div>
                  </div>

                  <!-- Design specifications -->
                  <div class="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/20 mt-2">
                    <span class="font-label-caps text-[10px] text-outline uppercase block mb-0.5">Especificações do Projeto</span>
                    <p class="font-body-sm text-body-sm text-on-surface leading-relaxed">
                      {{ apt.designSpecifications }}
                    </p>
                  </div>
                </div>

                <!-- Action Buttons based on status -->
                <div class="flex flex-wrap items-center gap-2 shrink-0">
                  @if (apt.status === 'PENDING') {
                    <button
                      type="button"
                      (click)="updateStatus(apt.id, 'CONFIRMED')"
                      class="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-fixed text-on-primary font-label-md text-label-md font-bold shadow-[0_0_16px_-4px_rgba(212,175,55,0.3)] transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span class="material-symbols-outlined text-[18px]">check_circle</span>
                      <span>Confirmar Sessão</span>
                    </button>

                    <button
                      type="button"
                      (click)="updateStatus(apt.id, 'CANCELLED')"
                      class="px-3 py-2 rounded-xl bg-surface-container-high hover:bg-rose-950/80 text-rose-300 border border-rose-500/30 text-xs font-label-md transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span class="material-symbols-outlined text-[16px]">cancel</span>
                      <span>Recusar</span>
                    </button>
                  } @else if (apt.status === 'CONFIRMED') {
                    <button
                      type="button"
                      (click)="updateStatus(apt.id, 'FINISHED')"
                      class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-label-md text-label-md font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span class="material-symbols-outlined text-[18px]">done_all</span>
                      <span>Finalizar Sessão</span>
                    </button>

                    <button
                      type="button"
                      (click)="updateStatus(apt.id, 'CANCELLED')"
                      class="px-3 py-2 rounded-xl bg-surface-container-high hover:bg-rose-950/80 text-rose-300 border border-rose-500/30 text-xs font-label-md transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span class="material-symbols-outlined text-[16px]">cancel</span>
                      <span>Cancelar</span>
                    </button>
                  } @else if (apt.status === 'FINISHED') {
                    <span class="px-3 py-1.5 rounded-lg bg-surface-container-highest text-slate-300 font-label-md text-xs border border-outline-variant/30 flex items-center gap-1">
                      <span class="material-symbols-outlined text-[16px] text-emerald-400">check</span>
                      <span>Sessão Finalizada</span>
                    </span>
                  } @else {
                    <span class="px-3 py-1.5 rounded-lg bg-surface-container-highest text-rose-300 font-label-md text-xs border border-outline-variant/30 flex items-center gap-1">
                      <span class="material-symbols-outlined text-[16px]">close</span>
                      <span>Cancelado</span>
                    </span>
                  }
                </div>
              </div>
            }
          </div>
        }
      </main>
    </div>
  `
})
export class ArtistAgendaComponent implements OnInit {
  private readonly appointmentService = inject(AppointmentService);
  private readonly toast = inject(ToastService);

  protected readonly appointments = signal<AppointmentResponseDTO[]>([]);
  protected readonly isLoading = signal<boolean>(true);
  protected readonly selectedStatusFilter = signal<string>('all');

  protected readonly filterOptions = [
    { key: 'all', label: 'Todas as Sessões' },
    { key: 'PENDING', label: 'Em Análise (Pendentes)' },
    { key: 'CONFIRMED', label: 'Confirmadas na Bancada' },
    { key: 'FINISHED', label: 'Concluídas' },
    { key: 'CANCELLED', label: 'Canceladas' }
  ];

  protected readonly pendingCount = computed(() =>
    this.appointments().filter(a => a.status === 'PENDING').length
  );

  protected readonly confirmedCount = computed(() =>
    this.appointments().filter(a => a.status === 'CONFIRMED').length
  );

  protected readonly filteredAppointments = computed(() => {
    const filter = this.selectedStatusFilter();
    if (filter === 'all') return this.appointments();
    return this.appointments().filter(a => a.status === filter);
  });

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading.set(true);
    this.appointmentService.findMyAppointments().subscribe({
      next: (data) => {
        this.appointments.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.appointments.set([]);
        this.isLoading.set(false);
      }
    });
  }

  updateStatus(id: string, newStatus: AppointmentStatus): void {
    this.appointmentService.updateStatus(id, newStatus).subscribe({
      next: () => {
        const msg = newStatus === 'CONFIRMED' ? 'Sessão confirmada na bancada com sucesso!' :
                    newStatus === 'FINISHED' ? 'Atendimento finalizado com sucesso!' :
                    'Sessão cancelada.';
        this.toast.success(msg);
        this.loadAppointments();
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Falha ao atualizar o status da sessão.');
      }
    });
  }

  statusLabel(status: AppointmentStatus): string {
    switch (status) {
      case 'PENDING': return 'Em Curadoria';
      case 'CONFIRMED': return 'Confirmado';
      case 'CANCELLED': return 'Cancelado';
      case 'FINISHED': return 'Finalizado';
    }
  }

  statusBadgeClass(status: AppointmentStatus): string {
    switch (status) {
      case 'PENDING': return 'bg-amber-950/40 text-amber-300 border-amber-500/40';
      case 'CONFIRMED': return 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40';
      case 'CANCELLED': return 'bg-rose-950/40 text-rose-300 border-rose-500/40';
      case 'FINISHED': return 'bg-slate-800/40 text-slate-300 border-slate-600/40';
    }
  }

  statusDotClass(status: AppointmentStatus): string {
    switch (status) {
      case 'PENDING': return 'bg-amber-400';
      case 'CONFIRMED': return 'bg-emerald-400';
      case 'CANCELLED': return 'bg-rose-400';
      case 'FINISHED': return 'bg-slate-400';
    }
  }

  statusBorderClass(status: AppointmentStatus): string {
    switch (status) {
      case 'CONFIRMED': return 'border-l-4 border-l-emerald-500 border-outline-variant/30';
      case 'PENDING': return 'border-l-4 border-l-amber-500 border-outline-variant/30';
      case 'CANCELLED': return 'border-l-4 border-l-rose-500 border-outline-variant/30';
      case 'FINISHED': return 'border-l-4 border-l-slate-500 border-outline-variant/30';
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDateOnly(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR');
  }
}
