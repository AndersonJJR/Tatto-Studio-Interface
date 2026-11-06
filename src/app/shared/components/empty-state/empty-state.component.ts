import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="w-full flex flex-col items-center justify-center p-space-xl rounded-2xl bg-surface-container-low/60 border border-outline-variant/30 text-center relative overflow-hidden backdrop-blur-md">
      <!-- Ambient subtle glow -->
      <div class="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

      <!-- Icon Capsule -->
      <div class="w-16 h-16 rounded-2xl bg-surface-container-high/90 border border-outline-variant/40 flex items-center justify-center text-primary shadow-[0_0_24px_-4px_rgba(212,175,55,0.15)] mb-space-md">
        <span class="material-symbols-outlined text-[32px] font-light">{{ icon() }}</span>
      </div>

      <!-- Headline & Message -->
      <h3 class="font-headline-sm text-headline-sm text-on-surface mb-2 font-semibold">
        {{ title() }}
      </h3>
      <p class="font-body-md text-body-md text-on-surface-variant max-w-md leading-relaxed mb-space-lg">
        {{ message() }}
      </p>

      <!-- Optional Action Button -->
      @if (actionLabel()) {
        @if (actionRoute()) {
          <a
            [routerLink]="actionRoute()"
            class="inline-flex items-center gap-space-xs px-space-lg py-2.5 rounded-xl bg-primary hover:bg-primary-fixed text-on-primary font-label-lg text-label-lg font-bold shadow-[0_0_20px_-4px_rgba(212,175,55,0.3)] transition-all group cursor-pointer"
          >
            @if (actionIcon()) {
              <span class="material-symbols-outlined text-[18px]">{{ actionIcon() }}</span>
            }
            <span>{{ actionLabel() }}</span>
            <span class="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </a>
        } @else {
          <button
            (click)="actionClick.emit()"
            type="button"
            class="inline-flex items-center gap-space-xs px-space-lg py-2.5 rounded-xl bg-primary hover:bg-primary-fixed text-on-primary font-label-lg text-label-lg font-bold shadow-[0_0_20px_-4px_rgba(212,175,55,0.3)] transition-all group cursor-pointer"
          >
            @if (actionIcon()) {
              <span class="material-symbols-outlined text-[18px]">{{ actionIcon() }}</span>
            }
            <span>{{ actionLabel() }}</span>
            <span class="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        }
      }
    </div>
  `
})
export class EmptyStateComponent {
  readonly icon = input<string>('auto_stories');
  readonly title = input.required<string>();
  readonly message = input.required<string>();
  readonly actionLabel = input<string>();
  readonly actionRoute = input<string>();
  readonly actionIcon = input<string>();

  readonly actionClick = output<void>();
}
