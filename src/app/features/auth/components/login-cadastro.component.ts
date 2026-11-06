import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { UserRole } from '../../../core/models/auth.models';

@Component({
  selector: 'app-login-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full min-h-[calc(100vh-5rem)] grid grid-cols-1 lg:grid-cols-12 bg-background relative overflow-hidden pt-20">
      <!-- LEFT PANEL: Visual Sanctuary & Editorial Exhibition (5 Cols Desktop) -->
      <div class="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-space-xl bg-surface-container-lowest overflow-hidden">
        <!-- Background Editorial Photography -->
        <div
          class="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105 opacity-40 mix-blend-luminosity"
          style="background-image: url('https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=1200&q=80');"
        ></div>
        <div class="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/80 to-transparent"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-surface-container-lowest/50 to-surface-container-lowest"></div>

        <!-- Atmospheric Ambient Glow -->
        <div class="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-[100px] pointer-events-none"></div>
        <div class="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-secondary-container/20 blur-[90px] pointer-events-none"></div>

        <!-- Top Label & Atelier Credentials -->
        <div class="relative z-10 space-y-space-md">
          <div class="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-high/90 text-secondary border border-outline-variant/30 backdrop-blur-md">
            <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            <span class="font-label-caps text-label-caps uppercase tracking-widest text-primary">Atelier Privatif · Depuis 2018</span>
          </div>
          <div class="space-y-space-xs pt-space-sm">
            <p class="font-label-caps text-label-caps uppercase tracking-[0.25em] text-outline">São Paulo · Curitiba · Guest Spots Paris</p>
            <h2 class="font-headline-lg text-headline-lg text-on-surface max-w-sm leading-tight tracking-tight">
              A pele como suporte eterno da alta arte visual.
            </h2>
          </div>
        </div>

        <!-- Centerpiece: Editorial Philosophy Quote -->
        <div class="relative z-10 my-auto py-space-xl">
          <div class="relative pl-space-lg border-l-2 border-primary/40 space-y-space-sm">
            <span class="material-symbols-outlined text-primary/60 text-3xl font-light">format_quote</span>
            <p class="font-body-lg text-body-lg text-on-surface-variant italic font-light leading-relaxed max-w-md">
              "Não imprimimos meros desenhos na derme; orquestramos diálogos definitivos entre anatomia viva, silêncio e pigmento puro."
            </p>
            <div class="pt-space-xs flex items-center gap-space-sm">
              <span class="w-6 h-px bg-outline-variant"></span>
              <p class="font-label-caps text-label-caps uppercase text-secondary tracking-widest">Manifesto Curatorial InkCraft</p>
            </div>
          </div>
        </div>

        <!-- Bottom Badges: Clinical Precision & Curatorial Standards -->
        <div class="relative z-10 pt-space-lg border-t border-outline-variant/20 space-y-space-md">
          <div class="grid grid-cols-2 gap-space-md">
            <div class="p-space-sm rounded-lg bg-surface-container-low/80 backdrop-blur-md">
              <div class="flex items-center gap-space-xs text-primary mb-1">
                <span class="material-symbols-outlined text-[18px]">verified_user</span>
                <span class="font-label-caps text-label-caps uppercase tracking-wider font-semibold">Biossegurança</span>
              </div>
              <p class="font-body-sm text-body-sm text-on-surface-variant">Protocolo cirúrgico ISO Classe 5 e esterilização hospitalar.</p>
            </div>
            <div class="p-space-sm rounded-lg bg-surface-container-low/80 backdrop-blur-md">
              <div class="flex items-center gap-space-xs text-secondary mb-1">
                <span class="material-symbols-outlined text-[18px]">workspace_premium</span>
                <span class="font-label-caps text-label-caps uppercase tracking-wider font-semibold">Curadoria Bespoke</span>
              </div>
              <p class="font-body-sm text-body-sm text-on-surface-variant">Artistas residentes com trabalhos autorais avaliados.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT PANEL: Authentication & Registration Desk (7 Cols Desktop) -->
      <div class="lg:col-span-7 flex flex-col justify-center px-gutter-mobile md:px-space-xl py-space-xl relative z-10">
        <div class="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div class="w-full max-w-2xl mx-auto space-y-space-lg">
          <!-- Header -->
          <div class="space-y-space-xs">
            <h1 class="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight">
              {{ isLoginTab() ? 'Bem-vindo de Volta ao Atelier' : 'Acesso ao Santuário Criativo' }}
            </h1>
            <p class="font-body-md text-body-md text-on-surface-variant">
              {{ isLoginTab() ? 'Acesse seus projetos em andamento, sessões agendadas e instruções pós-tatuagem.' : 'Inicie sua jornada autoral como colecionador ou integre nossa bancada residente.' }}
            </p>
          </div>

          <!-- High Precision Segmented Switcher (Tabs) -->
          <div class="p-1 rounded-xl bg-surface-container-lowest shadow-inner flex items-center gap-1 border border-outline-variant/30">
            <button
              type="button"
              (click)="isLoginTab.set(true)"
              class="flex-1 py-space-sm px-space-md rounded-lg font-label-lg text-label-lg transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
              [ngClass]="isLoginTab() ? 'bg-surface-container-high text-primary shadow-[0_0_20px_-4px_rgba(212,175,55,0.2)] font-semibold' : 'text-on-surface-variant hover:text-on-surface'"
            >
              <span class="material-symbols-outlined text-[18px]">vpn_key</span>
              <span>Acessar Conta</span>
            </button>
            <button
              type="button"
              (click)="isLoginTab.set(false)"
              class="flex-1 py-space-sm px-space-md rounded-lg font-label-lg text-label-lg transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
              [ngClass]="!isLoginTab() ? 'bg-surface-container-high text-primary shadow-[0_0_20px_-4px_rgba(212,175,55,0.2)] font-semibold' : 'text-on-surface-variant hover:text-on-surface'"
            >
              <span class="material-symbols-outlined text-[18px]">person_add</span>
              <span>Criar Cadastro</span>
            </button>
          </div>

          <!-- ======================= SECTION: LOGIN FLOW ======================= -->
          @if (isLoginTab()) {
            <form (ngSubmit)="handleLogin()" class="space-y-space-md">
              <div class="space-y-1">
                <label class="font-label-caps text-label-caps uppercase text-on-surface-variant flex items-center gap-1" for="login-email">
                  <span>E-mail Cadastrado</span>
                  <span class="text-primary">*</span>
                </label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3 top-3 text-[18px] text-outline">mail</span>
                  <input
                    id="login-email"
                    type="email"
                    [(ngModel)]="loginEmail"
                    name="loginEmail"
                    required
                    placeholder="seu.email@dominio.com"
                    class="w-full bg-surface-container-low text-on-surface placeholder:text-outline/60 text-body-md font-body-md pl-10 pr-4 py-2.5 rounded-lg border border-outline-variant/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              <div class="space-y-1">
                <div class="flex items-center justify-between">
                  <label class="font-label-caps text-label-caps uppercase text-on-surface-variant flex items-center gap-1" for="login-password">
                    <span>Senha de Acesso</span>
                    <span class="text-primary">*</span>
                  </label>
                </div>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3 top-3 text-[18px] text-outline">lock</span>
                  <input
                    id="login-password"
                    [type]="showLoginPassword() ? 'text' : 'password'"
                    [(ngModel)]="loginPassword"
                    name="loginPassword"
                    required
                    placeholder="••••••••••••"
                    class="w-full bg-surface-container-low text-on-surface placeholder:text-outline/60 text-body-md font-body-md pl-10 pr-10 py-2.5 rounded-lg border border-outline-variant/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                  <button
                    type="button"
                    (click)="showLoginPassword.update(v => !v)"
                    class="absolute right-3 top-3 text-outline hover:text-on-surface transition-colors cursor-pointer"
                  >
                    <span class="material-symbols-outlined text-[18px]">
                      {{ showLoginPassword() ? 'visibility_off' : 'visibility' }}
                    </span>
                  </button>
                </div>
              </div>

              <div class="pt-space-sm">
                <button
                  type="submit"
                  [disabled]="isSubmitting()"
                  class="w-full py-3.5 px-space-lg rounded-xl bg-primary hover:bg-primary-fixed text-on-primary font-label-lg text-label-lg font-bold shadow-[0_0_28px_-6px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
                >
                  @if (isSubmitting()) {
                    <span class="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                    <span>Validando Credenciais...</span>
                  } @else {
                    <span>Entrar no Atelier InkCraft</span>
                    <span class="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">login</span>
                  }
                </button>
              </div>

              <!-- Switch to Register Tip -->
              <div class="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
                <div>
                  <p class="font-headline-sm text-[15px] text-on-surface font-semibold">Novo no InkCraft?</p>
                  <p class="font-body-sm text-body-sm text-on-surface-variant">Cadastre-se para solicitar orçamentos e agendamentos.</p>
                </div>
                <button
                  type="button"
                  (click)="isLoginTab.set(false)"
                  class="px-space-md py-2 rounded-lg bg-surface-container-high text-secondary hover:text-primary font-label-lg text-label-lg font-semibold transition-colors cursor-pointer"
                >
                  Criar Conta
                </button>
              </div>
            </form>
          } @else {
            <!-- ======================= SECTION: REGISTRATION FLOW ======================= -->
            <form (ngSubmit)="handleRegister()" class="space-y-space-md">
              <!-- Profile Type Selector (Collectors vs Artists) -->
              <div class="space-y-space-xs">
                <span class="font-label-caps text-label-caps uppercase text-secondary tracking-wider block">Perfil de Acesso</span>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                  <!-- Collector -->
                  <div
                    (click)="selectedRole.set('ROLE_CLIENT')"
                    class="cursor-pointer p-space-md rounded-xl transition-all flex flex-col justify-between group border"
                    [ngClass]="selectedRole() === 'ROLE_CLIENT' ? 'bg-surface-container-high border-primary shadow-[0_0_24px_-4px_rgba(212,175,55,0.2)]' : 'bg-surface-container-low border-outline-variant/30 hover:bg-surface-container'"
                  >
                    <div class="flex items-start justify-between">
                      <div class="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <span class="material-symbols-outlined text-[20px]">brush</span>
                      </div>
                      <div class="w-5 h-5 rounded-full flex items-center justify-center" [ngClass]="selectedRole() === 'ROLE_CLIENT' ? 'bg-primary' : 'bg-surface-container-highest'">
                        <span class="w-2 h-2 rounded-full" [ngClass]="selectedRole() === 'ROLE_CLIENT' ? 'bg-on-primary' : 'bg-transparent'"></span>
                      </div>
                    </div>
                    <div class="pt-space-sm">
                      <h3 class="font-headline-sm text-[16px] leading-5 text-on-surface font-semibold">Cliente / Colecionador</h3>
                      <p class="font-body-sm text-body-sm text-on-surface-variant pt-1">
                        Agende consultas exclusivas, gerencie datas e acompanhe cicatrizações.
                      </p>
                    </div>
                  </div>

                  <!-- Artist -->
                  <div
                    (click)="selectedRole.set('ROLE_ARTIST')"
                    class="cursor-pointer p-space-md rounded-xl transition-all flex flex-col justify-between group border"
                    [ngClass]="selectedRole() === 'ROLE_ARTIST' ? 'bg-surface-container-high border-primary shadow-[0_0_24px_-4px_rgba(212,175,55,0.2)]' : 'bg-surface-container-low border-outline-variant/30 hover:bg-surface-container'"
                  >
                    <div class="flex items-start justify-between">
                      <div class="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                        <span class="material-symbols-outlined text-[20px]">ink_pen</span>
                      </div>
                      <div class="flex items-center gap-1.5">
                        <span class="px-1.5 py-0.5 rounded text-[10px] font-label-caps uppercase bg-primary/10 text-primary border border-primary/20">Residente</span>
                        <div class="w-5 h-5 rounded-full flex items-center justify-center" [ngClass]="selectedRole() === 'ROLE_ARTIST' ? 'bg-primary' : 'bg-surface-container-highest'">
                          <span class="w-2 h-2 rounded-full" [ngClass]="selectedRole() === 'ROLE_ARTIST' ? 'bg-on-primary' : 'bg-transparent'"></span>
                        </div>
                      </div>
                    </div>
                    <div class="pt-space-sm">
                      <h3 class="font-headline-sm text-[16px] leading-5 text-on-surface font-semibold">Tatuador Residente</h3>
                      <p class="font-body-sm text-body-sm text-on-surface-variant pt-1">
                        Gerencie sua bancada cirúrgica, portfólio autoral e agenda no atelier.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Name and Phone -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <div class="space-y-1">
                  <label class="font-label-caps text-label-caps uppercase text-on-surface-variant flex items-center gap-1" for="reg-name">
                    <span>Nome Completo</span>
                    <span class="text-primary">*</span>
                  </label>
                  <div class="relative">
                    <span class="material-symbols-outlined absolute left-3 top-3 text-[18px] text-outline">badge</span>
                    <input
                      id="reg-name"
                      type="text"
                      [(ngModel)]="regName"
                      name="regName"
                      required
                      placeholder="Ex: Julian de Oliveira"
                      class="w-full bg-surface-container-low text-on-surface placeholder:text-outline/60 text-body-md font-body-md pl-10 pr-4 py-2.5 rounded-lg border border-outline-variant/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                </div>

                <div class="space-y-1">
                  <label class="font-label-caps text-label-caps uppercase text-on-surface-variant flex items-center gap-1" for="reg-phone">
                    <span>Telefone / WhatsApp</span>
                    <span class="text-primary">*</span>
                  </label>
                  <div class="relative">
                    <span class="material-symbols-outlined absolute left-3 top-3 text-[18px] text-outline">call</span>
                    <input
                      id="reg-phone"
                      type="tel"
                      [(ngModel)]="regPhone"
                      (input)="formatPhone($event)"
                      name="regPhone"
                      required
                      placeholder="(11) 98765-4321"
                      class="w-full bg-surface-container-low text-on-surface placeholder:text-outline/60 text-body-md font-body-md pl-10 pr-4 py-2.5 rounded-lg border border-outline-variant/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono"
                    />
                  </div>
                </div>
              </div>

              <!-- Email -->
              <div class="space-y-1">
                <label class="font-label-caps text-label-caps uppercase text-on-surface-variant flex items-center gap-1" for="reg-email">
                  <span>Endereço de E-mail</span>
                  <span class="text-primary">*</span>
                </label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3 top-3 text-[18px] text-outline">alternate_email</span>
                  <input
                    id="reg-email"
                    type="email"
                    [(ngModel)]="regEmail"
                    name="regEmail"
                    required
                    placeholder="seu.email@dominio.com"
                    class="w-full bg-surface-container-low text-on-surface placeholder:text-outline/60 text-body-md font-body-md pl-10 pr-4 py-2.5 rounded-lg border border-outline-variant/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              <!-- Passwords -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <div class="space-y-1">
                  <label class="font-label-caps text-label-caps uppercase text-on-surface-variant flex items-center gap-1" for="reg-password">
                    <span>Senha de Acesso</span>
                    <span class="text-primary">*</span>
                  </label>
                  <div class="relative">
                    <span class="material-symbols-outlined absolute left-3 top-3 text-[18px] text-outline">lock</span>
                    <input
                      id="reg-password"
                      [type]="showRegPassword() ? 'text' : 'password'"
                      [(ngModel)]="regPassword"
                      (ngModelChange)="checkPasswordStrength($event)"
                      name="regPassword"
                      required
                      placeholder="Mínimo 8 caracteres"
                      class="w-full bg-surface-container-low text-on-surface placeholder:text-outline/60 text-body-md font-body-md pl-10 pr-10 py-2.5 rounded-lg border border-outline-variant/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                    <button
                      type="button"
                      (click)="showRegPassword.update(v => !v)"
                      class="absolute right-3 top-3 text-outline hover:text-on-surface transition-colors cursor-pointer"
                    >
                      <span class="material-symbols-outlined text-[18px]">
                        {{ showRegPassword() ? 'visibility_off' : 'visibility' }}
                      </span>
                    </button>
                  </div>
                </div>

                <div class="space-y-1">
                  <label class="font-label-caps text-label-caps uppercase text-on-surface-variant flex items-center gap-1" for="reg-confirm">
                    <span>Confirmar Senha</span>
                    <span class="text-primary">*</span>
                  </label>
                  <div class="relative">
                    <span class="material-symbols-outlined absolute left-3 top-3 text-[18px] text-outline">verified</span>
                    <input
                      id="reg-confirm"
                      [type]="showRegConfirm() ? 'text' : 'password'"
                      [(ngModel)]="regConfirmPassword"
                      name="regConfirmPassword"
                      required
                      placeholder="Repita sua senha"
                      class="w-full bg-surface-container-low text-on-surface placeholder:text-outline/60 text-body-md font-body-md pl-10 pr-10 py-2.5 rounded-lg border border-outline-variant/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                    <button
                      type="button"
                      (click)="showRegConfirm.update(v => !v)"
                      class="absolute right-3 top-3 text-outline hover:text-on-surface transition-colors cursor-pointer"
                    >
                      <span class="material-symbols-outlined text-[18px]">
                        {{ showRegConfirm() ? 'visibility_off' : 'visibility' }}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Password strength meter -->
              <div class="p-space-sm rounded-lg bg-surface-container-lowest border border-outline-variant/20 space-y-1.5">
                <div class="flex items-center justify-between text-[11px] font-label-caps uppercase">
                  <span class="text-outline">Segurança da Senha</span>
                  <span class="text-secondary font-semibold">{{ passwordStrengthLabel() }}</span>
                </div>
                <div class="grid grid-cols-4 gap-1.5 h-1.5">
                  <div class="rounded-full transition-colors duration-300" [ngClass]="strengthScore() >= 1 ? 'bg-primary' : 'bg-surface-container-high'"></div>
                  <div class="rounded-full transition-colors duration-300" [ngClass]="strengthScore() >= 2 ? 'bg-primary' : 'bg-surface-container-high'"></div>
                  <div class="rounded-full transition-colors duration-300" [ngClass]="strengthScore() >= 3 ? 'bg-primary' : 'bg-surface-container-high'"></div>
                  <div class="rounded-full transition-colors duration-300" [ngClass]="strengthScore() >= 4 ? 'bg-primary' : 'bg-surface-container-high'"></div>
                </div>
                <div class="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-[11px] text-on-surface-variant font-label-md">
                  <span class="flex items-center gap-1" [ngClass]="hasLength() ? 'text-primary' : 'text-outline'">
                    <span class="material-symbols-outlined text-[14px]">{{ hasLength() ? 'check' : 'radio_button_unchecked' }}</span> 8+ dígitos
                  </span>
                  <span class="flex items-center gap-1" [ngClass]="hasUppercase() ? 'text-primary' : 'text-outline'">
                    <span class="material-symbols-outlined text-[14px]">{{ hasUppercase() ? 'check' : 'radio_button_unchecked' }}</span> Maiúscula
                  </span>
                  <span class="flex items-center gap-1" [ngClass]="hasSymbol() ? 'text-primary' : 'text-outline'">
                    <span class="material-symbols-outlined text-[14px]">{{ hasSymbol() ? 'check' : 'radio_button_unchecked' }}</span> Símbolo ou número
                  </span>
                </div>
              </div>

              <!-- ARTIST SPECIFIC FIELDS -->
              @if (selectedRole() === 'ROLE_ARTIST') {
                <div class="p-space-md rounded-xl bg-surface-container space-y-space-md border-l-2 border-primary border border-outline-variant/30">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <span class="material-symbols-outlined text-primary text-[20px]">palette</span>
                      <span class="font-label-caps text-label-caps uppercase text-primary tracking-wider">Credenciamento de Artista</span>
                    </div>
                    <span class="font-label-caps text-[10px] text-secondary uppercase bg-surface-container-high px-2 py-0.5 rounded border border-outline-variant/30">Bancada Residente</span>
                  </div>

                  <div class="space-y-1">
                    <label class="font-label-caps text-label-caps uppercase text-on-surface-variant" for="artist-specialty">
                      Especialidade Principal
                    </label>
                    <input
                      id="artist-specialty"
                      type="text"
                      [(ngModel)]="artistSpecialty"
                      name="artistSpecialty"
                      placeholder="Ex: Realismo Dark & Chiaroscuro"
                      class="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline/60 text-body-md font-body-md px-4 py-2 rounded-lg border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <!-- Quick Chips for Style Tags -->
                  <div class="space-y-1.5">
                    <label class="font-label-caps text-label-caps uppercase text-on-surface-variant block">
                      Estilos Rápidos (Clique para preencher)
                    </label>
                    <div class="flex flex-wrap gap-1.5">
                      @for (style of availableStyles; track style) {
                        <button
                          type="button"
                          (click)="selectStyle(style)"
                          class="px-2.5 py-1 rounded-full text-[12px] font-label-md transition-all cursor-pointer border"
                          [ngClass]="artistSpecialty === style ? 'bg-primary text-on-primary border-primary font-bold' : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/30 hover:bg-surface-container-high'"
                        >
                          {{ style }}
                        </button>
                      }
                    </div>
                  </div>

                  <div class="space-y-1">
                    <label class="font-label-caps text-label-caps uppercase text-on-surface-variant" for="artist-bio">
                      Biografia Artística / Manifesto
                    </label>
                    <textarea
                      id="artist-bio"
                      [(ngModel)]="artistBio"
                      name="artistBio"
                      rows="3"
                      placeholder="Conte sobre sua trajetória, formação artística e inspirações..."
                      class="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline/60 text-body-md font-body-md p-3 rounded-lg border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                    ></textarea>
                  </div>
                </div>
              } @else {
                <!-- CLIENT SPECIFIC FIELDS -->
                <div class="space-y-1">
                  <label class="font-label-caps text-label-caps uppercase text-on-surface-variant" for="client-preferences">
                    Preferências Estilísticas & Ideias (Opcional)
                  </label>
                  <textarea
                    id="client-preferences"
                    [(ngModel)]="clientPreferences"
                    name="clientPreferences"
                    rows="2"
                    placeholder="Ex: Gosta de traços finos, botânicos, sombreado suave e referências clássicas..."
                    class="w-full bg-surface-container-low text-on-surface placeholder:text-outline/60 text-body-md font-body-md p-3 rounded-lg border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                  ></textarea>
                </div>
              }

              <!-- Terms Checkbox -->
              <div class="space-y-space-xs pt-space-xs">
                <label class="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    [(ngModel)]="agreeTerms"
                    name="agreeTerms"
                    required
                    class="mt-1 w-4 h-4 rounded bg-surface-container-low accent-primary"
                  />
                  <div class="font-body-sm text-body-sm text-on-surface-variant leading-tight">
                    Declaro ciência e concordo com os Termos de Uso do Atelier, os Protocolos de Biossegurança Cirúrgica e o tratamento de dados de acordo com a LGPD.
                  </div>
                </label>
              </div>

              <!-- Submit -->
              <div class="pt-space-sm">
                <button
                  type="submit"
                  [disabled]="isSubmitting() || !agreeTerms"
                  class="w-full py-3.5 px-space-lg rounded-xl bg-primary hover:bg-primary-fixed text-on-primary font-label-lg text-label-lg font-bold shadow-[0_0_28px_-6px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
                >
                  @if (isSubmitting()) {
                    <span class="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                    <span>Criando Registro no Atelier...</span>
                  } @else {
                    <span>Finalizar Cadastro no Atelier</span>
                    <span class="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  }
                </button>
              </div>
            </form>
          }

          <!-- Micro-banner footer -->
          <div class="pt-space-md border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-space-sm text-on-surface-variant text-[11px] font-label-caps uppercase text-outline">
            <span>InkCraft Atelier · Protocolo Criptográfico ISO/IEC 25010</span>
            <div class="flex items-center gap-space-md">
              <span class="hover:text-secondary transition-colors cursor-pointer">Termos & Ética</span>
              <span>·</span>
              <span class="hover:text-secondary transition-colors cursor-pointer">Biossegurança</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginCadastroComponent {
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly isLoginTab = signal<boolean>(true);
  protected readonly selectedRole = signal<UserRole>('ROLE_CLIENT');
  protected readonly isSubmitting = signal<boolean>(false);

  // Login form
  protected loginEmail = '';
  protected loginPassword = '';
  protected showLoginPassword = signal<boolean>(false);

  // Register form
  protected regName = '';
  protected regPhone = '';
  protected regEmail = '';
  protected regPassword = '';
  protected regConfirmPassword = '';
  protected showRegPassword = signal<boolean>(false);
  protected showRegConfirm = signal<boolean>(false);
  protected artistSpecialty = '';
  protected artistBio = '';
  protected clientPreferences = '';
  protected agreeTerms = true;

  // Password strength
  protected strengthScore = signal<number>(0);
  protected hasLength = signal<boolean>(false);
  protected hasUppercase = signal<boolean>(false);
  protected hasSymbol = signal<boolean>(false);

  protected readonly availableStyles = [
    'Blackwork',
    'Fineline Anatômico',
    'Geometria Sagrada',
    'Irezumi Contemporâneo',
    'Micro-Realismo',
    'Realismo Dark'
  ];

  selectStyle(style: string): void {
    this.artistSpecialty = style;
  }

  formatPhone(event: Event): void {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 6) {
      input.value = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
    } else if (v.length > 2) {
      input.value = `(${v.slice(0, 2)}) ${v.slice(2)}`;
    } else if (v.length > 0) {
      input.value = `(${v}`;
    }
    this.regPhone = input.value;
  }

  checkPasswordStrength(pwd: string): void {
    const hasLen = pwd.length >= 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasSymOrNum = /[0-9!@#$%^&*(),.?":{}|<>]/.test(pwd);

    this.hasLength.set(hasLen);
    this.hasUppercase.set(hasUpper);
    this.hasSymbol.set(hasSymOrNum);

    let score = 0;
    if (pwd.length > 0) score++;
    if (hasLen) score++;
    if (hasUpper) score++;
    if (hasSymOrNum && hasLen) score++;
    this.strengthScore.set(score);
  }

  passwordStrengthLabel(): string {
    const s = this.strengthScore();
    if (s <= 1) return 'Fraca';
    if (s === 2) return 'Moderada';
    if (s === 3) return 'Boa';
    return 'Forte';
  }

  handleLogin(): void {
    if (!this.loginEmail || !this.loginPassword) {
      this.toast.error('Informe o e-mail e a senha cadastrados.');
      return;
    }

    this.isSubmitting.set(true);
    this.authService.login({
      email: this.loginEmail,
      password: this.loginPassword
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/portfolio';
        this.router.navigateByUrl(returnUrl);
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }

  handleRegister(): void {
    if (!this.regName.trim() || !this.regEmail.trim() || !this.regPhone.trim() || !this.regPassword) {
      this.toast.error('Preencha todos os campos obrigatórios (*).');
      return;
    }

    if (this.regPassword !== this.regConfirmPassword) {
      this.toast.error('As senhas não coincidem.');
      return;
    }

    if (this.regPassword.length < 8) {
      this.toast.error('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    this.isSubmitting.set(true);

    this.authService.register({
      name: this.regName.trim(),
      email: this.regEmail.trim(),
      phone: this.regPhone.trim(),
      password: this.regPassword,
      role: this.selectedRole(),
      specialty: this.selectedRole() === 'ROLE_ARTIST' ? this.artistSpecialty.trim() : undefined,
      bio: this.selectedRole() === 'ROLE_ARTIST' ? this.artistBio.trim() : undefined,
      preferences: this.selectedRole() === 'ROLE_CLIENT' ? this.clientPreferences.trim() : undefined
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || (this.selectedRole() === 'ROLE_ARTIST' ? '/agenda' : '/portfolio');
        this.router.navigateByUrl(returnUrl);
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }
}
