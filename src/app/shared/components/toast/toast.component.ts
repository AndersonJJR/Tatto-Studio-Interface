import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl shadow-2xl backdrop-blur-xl border transition-all animate-slide-up"
          [class.bg-surface-container-high]="toast.type === 'info'"
          [class.border-primary]="toast.type === 'info'"
          [class.text-on-surface]="toast.type === 'info'"
          [class.bg-emerald-950/90]="toast.type === 'success'"
          [class.border-emerald-500/50]="toast.type === 'success'"
          [class.text-emerald-100]="toast.type === 'success'"
          [class.bg-rose-950/90]="toast.type === 'error'"
          [class.border-rose-500/50]="toast.type === 'error'"
          [class.text-rose-100]="toast.type === 'error'"
        >
          <div class="flex items-center gap-3">
            @if (toast.type === 'success') {
              <span class="material-symbols-outlined text-emerald-400 text-[20px]">check_circle</span>
            } @else if (toast.type === 'error') {
              <span class="material-symbols-outlined text-rose-400 text-[20px]">error</span>
            } @else {
              <span class="material-symbols-outlined text-primary text-[20px]">info</span>
            }
            <span class="font-body-sm text-body-sm leading-snug">{{ toast.message }}</span>
          </div>

          <button
            type="button"
            (click)="toastService.remove(toast.id)"
            class="text-outline hover:text-on-surface p-1 rounded transition-colors"
          >
            <span class="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  protected readonly toastService = inject(ToastService);
}
