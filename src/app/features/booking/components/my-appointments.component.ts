import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppointmentService } from '../services/appointment.service';
import { AppointmentResponseDTO, AppointmentStatus } from '../../../core/models/appointment.models';
import { ToastService } from '../../../core/services/toast.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [CommonModule, RouterLink, EmptyStateComponent],
  template: `
    <div class="w-full flex flex-col bg-background pt-20 min-h-screen">
      <!-- Top Header & Breadcrumbs Context -->
      <section class="w-full px-gutter md:px-margin pt-space-lg pb-space-md border-b border-outline-variant/20 bg-surface-container-lowest">
        <div class="flex flex-col gap-space-md">
          <div class="flex items-center gap-space-xs text-on-surface-variant font-label-caps text-label-caps uppercase tracking-widest">
            <span>CLIENTE COLECCIONADOR</span>
            <span class="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
            <span class="text-primary font-bold">MEUS AGENDAMENTOS & SESSÕES</span>
          </div>

          <div class="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
            <div class="space-y-space-xs">
              <h1 class="font-headline-lg text-headline-lg tracking-tight text-on-surface">
                Meus Agendamentos & <span class="text-primary">Sessões no Atelier</span>
              </h1>
              <p class="font-body-md text-body-md text-on-surface-variant max-w-2xl">
                Acompanhe o status curatorial das suas propostas, datas de bancada confirmadas e histórico de atendimentos.
              </p>
            </div>

            <a
              routerLink="/agendar"
              class="inline-flex items-center gap-space-xs px-space-lg py-2.5 rounded-xl bg-primary hover:bg-primary-fixed text-on-primary font-label-lg text-label-lg font-bold shadow-[0_0_24px_-4px_rgba(212,175,55,0.3)] transition-all shrink-0 cursor-pointer"
            >
              <span class="material-symbols-outlined text-[20px]">add</span>
              <span>Solicitar Novo Agendamento</span>
            </a>
          </div>

          <!-- Main Tabs Switcher -->
          <div class="flex items-center gap-2 pt-2 border-t border-outline-variant/20">
            <button
              type="button"
              (click)="activeTab.set('upcoming')"
              class="py-2 px-space-md rounded-lg font-label-md text-label-md transition-all cursor-pointer border"
              [ngClass]="activeTab() === 'upcoming' ? 'bg-surface-container-high text-primary border-primary font-bold shadow-sm' : 'bg-surface-container text-on-surface-variant border-outline-variant/30 hover:text-on-surface'"
            >
              <span>Próximos Atendimentos & Em Análise</span>
              <span class="ml-2 px-2 py-0.5 rounded-full text-[11px] bg-surface-container-highest text-secondary">
                {{ upcomingCount() }}
              </span>
            </button>

            <button
              type="button"
              (click)="activeTab.set('history')"
              class="py-2 px-space-md rounded-lg font-label-md text-label-md transition-all cursor-pointer border"
              [ngClass]="activeTab() === 'history' ? 'bg-surface-container-high text-primary border-primary font-bold shadow-sm' : 'bg-surface-container text-on-surface-variant border-outline-variant/30 hover:text-on-surface'"
            >
              <span>Histórico & Sessões Concluídas</span>
              <span class="ml-2 px-2 py-0.5 rounded-full text-[11px] bg-surface-container-highest text-secondary">
                {{ historyCount() }}
              </span>
            </button>
          </div>
        </div>
      </section>

      <!-- Content Area -->
      <main class="w-full px-gutter md:px-margin py-space-xl">
        @if (isLoading()) {
          <div class="w-full py-20 flex flex-col items-center justify-center gap-4">
            <span class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
            <p class="font-label-caps text-label-caps text-outline uppercase tracking-widest">Consultando Seus Agendamentos na API...</p>
          </div>
        } @else if (displayedAppointments().length === 0) {
          <!-- Empty State when client has 0 appointments in DB -->
          <div class="py-12">
            <app-empty-state
              icon="event_busy"
              title="Nenhum agendamento encontrado nesta seção"
              message="Você não possui sessões registradas no momento. Explore as obras dos nossos tatuadores residentes e agende sua primeira sessão."
              actionLabel="Agendar Sessão no Atelier"
              actionRoute="/agendar"
              actionIcon="calendar_today"
            />
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
            @for (apt of displayedAppointments(); track apt.id) {
              <div
                class="rounded-xl overflow-hidden bg-surface-container border transition-all duration-300 flex flex-col justify-between shadow-lg group hover:border-primary/50"
                [ngClass]="statusBorderClass(apt.status)"
              >
                <!-- Card Header -->
                <div class="p-space-lg border-b border-outline-variant/20 flex items-start justify-between gap-space-md">
                  <div>
                    <div class="flex items-center gap-2 mb-1">
                      <span class="material-symbols-outlined text-primary text-[20px]">brush</span>
                      <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold">
                        {{ apt.artistName }}
                      </h3>
                    </div>
                    <span class="text-xs text-secondary font-label-md">
                      {{ apt.artistSpecialty }}
                    </span>
                  </div>

                  <!-- Status Chip -->
                  <span
                    class="px-3 py-1 rounded-full text-xs font-label-caps uppercase tracking-wider font-bold border flex items-center gap-1.5"
                    [ngClass]="statusBadgeClass(apt.status)"
                  >
                    <span class="w-2 h-2 rounded-full" [ngClass]="statusDotClass(apt.status)"></span>
                    {{ statusLabel(apt.status) }}
                  </span>
                </div>

                <!-- Card Body -->
                <div class="p-space-lg space-y-space-md flex-1">
                  <!-- Date & Duration Box -->
                  <div class="grid grid-cols-2 gap-space-sm p-space-sm rounded-lg bg-surface-container-lowest border border-outline-variant/20">
                    <div class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-primary text-[20px]">calendar_today</span>
                      <div>
                        <span class="font-label-caps text-[10px] text-outline uppercase block">Data da Sessão</span>
                        <strong class="font-body-sm text-body-sm text-on-surface">{{ formatDate(apt.sessionDate) }}</strong>
                      </div>
                    </div>

                    <div class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-secondary text-[20px]">timer</span>
                      <div>
                        <span class="font-label-caps text-[10px] text-outline uppercase block">Duração Estimada</span>
                        <strong class="font-body-sm text-body-sm text-on-surface">{{ apt.estimatedDurationMinutes }} minutos</strong>
                      </div>
                    </div>
                  </div>

                  <!-- Specifications -->
                  <div class="space-y-1">
                    <span class="font-label-caps text-[11px] text-outline uppercase block">Memorial Descritivo & Projeto</span>
                    <p class="font-body-sm text-body-sm text-on-surface-variant leading-relaxed line-clamp-3">
                      {{ apt.designSpecifications }}
                    </p>
                  </div>
                </div>

                <!-- Card Actions -->
                <div class="p-space-md border-t border-outline-variant/20 bg-surface-container-low flex items-center justify-between">
                  <span class="text-xs text-outline font-label-md">
                    Criado em {{ formatDateOnly(apt.createdAt) }}
                  </span>

                  <div class="flex items-center gap-2">
                    @if (apt.status === 'PENDING' || apt.status === 'CONFIRMED') {
                      <button
                        type="button"
                        (click)="confirmCancel(apt)"
                        class="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-rose-950/80 text-rose-300 hover:text-rose-200 border border-rose-500/30 text-xs font-label-md transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span class="material-symbols-outlined text-[16px]">cancel</span>
                        <span>Cancelar Sessão</span>
                      </button>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </main>

      <!-- CANCEL MODAL -->
      @if (appointmentToCancel(); as apt) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div class="w-full max-w-md bg-surface-container rounded-2xl border border-outline-variant/40 p-space-lg shadow-2xl space-y-space-md">
            <div class="flex items-center gap-3 text-error">
              <span class="material-symbols-outlined text-3xl">event_busy</span>
              <h3 class="font-headline-sm text-headline-sm text-on-surface font-semibold">Cancelar Agendamento?</h3>
            </div>
            <p class="font-body-md text-body-md text-on-surface-variant">
              Você tem certeza de que deseja cancelar sua sessão com <strong class="text-on-surface">{{ apt.artistName }}</strong> agendada para <strong class="text-primary">{{ formatDate(apt.sessionDate) }}</strong>?
            </p>
            <div class="flex justify-end gap-3 pt-2">
              <button
                type="button"
                (click)="appointmentToCancel.set(null)"
                class="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface font-label-md hover:bg-surface-container-highest cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                (click)="executeCancel()"
                class="px-4 py-2 rounded-lg bg-error hover:bg-rose-700 text-on-error font-label-md font-bold cursor-pointer"
              >
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class MyAppointmentsComponent implements OnInit {
  private readonly appointmentService = inject(AppointmentService);
  private readonly toast = inject(ToastService);

  protected readonly appointments = signal<AppointmentResponseDTO[]>([]);
  protected readonly isLoading = signal<boolean>(true);
  protected readonly activeTab = signal<'upcoming' | 'history'>('upcoming');
  protected readonly appointmentToCancel = signal<AppointmentResponseDTO | null>(null);

  protected readonly upcomingAppointments = computed(() => {
    return this.appointments().filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED');
  });

  protected readonly historyAppointments = computed(() => {
    return this.appointments().filter(a => a.status === 'CANCELLED' || a.status === 'FINISHED');
  });

  protected readonly upcomingCount = computed(() => this.upcomingAppointments().length);
  protected readonly historyCount = computed(() => this.historyAppointments().length);

  protected readonly displayedAppointments = computed(() => {
    return this.activeTab() === 'upcoming' ? this.upcomingAppointments() : this.historyAppointments();
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

  confirmCancel(apt: AppointmentResponseDTO): void {
    this.appointmentToCancel.set(apt);
  }

  executeCancel(): void {
    const apt = this.appointmentToCancel();
    if (!apt) return;

    this.appointmentService.cancel(apt.id).subscribe({
      next: () => {
        this.toast.success('Agendamento cancelado com sucesso.');
        this.appointmentToCancel.set(null);
        this.loadAppointments();
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Falha ao cancelar o agendamento.');
        this.appointmentToCancel.set(null);
      }
    });
  }

  statusLabel(status: AppointmentStatus): string {
    switch (status) {
      case 'PENDING': return 'Em Curadoria';
      case 'CONFIRMED': return 'Confirmado';
      case 'CANCELLED': return 'Cancelado';
      case 'FINISHED': return 'Concluído';
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
