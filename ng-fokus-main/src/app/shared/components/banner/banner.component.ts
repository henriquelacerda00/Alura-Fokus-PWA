import { DOCUMENT } from '@angular/common';
import { ContextService, ContextType } from './../../services/context.service';
import { Component, effect, inject, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.scss'
})
export class BannerComponent {

  title = 'Otimize sua produtividade,';
  titleStrong = 'mergulhe no que importa.';

  src = './assets/images/foco.png';

  private contextService = inject(ContextService);
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);

  constructor() {
    effect(() => {
      const context = this.contextService.contextSignal$();

      switch (context) {
        case 'foco':
          this.title = 'Otimize sua produtividade,';
          this.titleStrong = 'mergulhe no que importa.';
          this.src = './assets/images/foco.png';

          this.renderer.setAttribute(this.document.documentElement, 'data-contexto', 'foco');
          break;
        case 'descanso-curto':
          this.title = 'Que tal dar uma respirada?';
          this.titleStrong = 'Faça uma pausa curta!';
          this.src = './assets/images/descanso-curto.png';

          this.renderer.setAttribute(this.document.documentElement, 'data-contexto', 'descanso-curto');
          break;
        case 'descanso-longo':
          this.title = 'Hora de voltar à superfície.';
          this.titleStrong = 'Faça uma pausa longa.';
          this.src = './assets/images/descanso-longo.png';

          this.renderer.setAttribute(this.document.documentElement, 'data-contexto', 'descanso-longo');
          break;
        default:
          this.renderer.setAttribute(this.document.documentElement, 'data-contexto', 'foco');
      }
    });
  }
}
