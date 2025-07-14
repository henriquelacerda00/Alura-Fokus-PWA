import { computed, Injectable, signal } from '@angular/core';

export type ContextType = 'foco' | 'descanso-curto' | 'descanso-longo';

@Injectable({
  providedIn: 'root'
})
export class ContextService {
  private contextSignal = signal<ContextType>('foco');

  readonly isFoco = computed(() => this.contextSignal() === 'foco');
  readonly isDescansoCurto = computed(() => this.contextSignal() === 'descanso-curto');
  readonly isDescansoLongo = computed(() => this.contextSignal() === 'descanso-longo');

  get context() {
    return this.contextSignal();
  }

  get contextSignal$() {
    return this.contextSignal;
  }

  updateContext(newContext: ContextType) {
    this.contextSignal.set(newContext);
  }

  isFocoActive(): boolean {
    return this.contextSignal() === 'foco';
  }

  isDescansoCurtoActive(): boolean {
    return this.contextSignal() === 'descanso-curto';
  }

  isDescansoLongoActive(): boolean {
    return this.contextSignal() === 'descanso-longo';
  }
}
