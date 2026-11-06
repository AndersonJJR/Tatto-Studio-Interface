import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  let component: EmptyStateComponent;
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
  });

  it('should create and render title and message', () => {
    fixture.componentRef.setInput('title', 'Nenhum item encontrado');
    fixture.componentRef.setInput('message', 'Por favor, tente novamente mais tarde.');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h3')?.textContent).toContain('Nenhum item encontrado');
    expect(compiled.querySelector('p')?.textContent).toContain('Por favor, tente novamente mais tarde.');
  });
});
