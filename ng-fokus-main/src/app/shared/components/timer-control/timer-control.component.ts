import { SwPush } from '@angular/service-worker';
import { NotificationService } from './../../services/notification.service';
import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit } from '@angular/core';
import { ContextService, ContextType } from '../../services/context.service';
import { FormsModule } from '@angular/forms';
import { AudioService } from '../../services/audio.service';
import { NotificationMensage } from '../../services/types';

@Component({
  selector: 'app-timer-control',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './timer-control.component.html',
  styleUrl: './timer-control.component.scss',
})
export class TimerControlComponent implements OnInit {
  timerFormat = '';

  isTimerStarted = false;

  timerInSeconds = 30;

  hasPlaySong = false;

  private intervalId: any;

  private contextService = inject(ContextService);
  private audioService = inject(AudioService);

  context = this.contextService.contextSignal$;

  constructor(private notificationService: NotificationService,private SwPush: SwPush) {
    effect(() => {
      this.setTimerSecond();
      this.configTimer();
    });
  }

  ngOnInit(): void {
    this.SwPush.messages.subscribe((msg) => {
      const notificationMessage = msg as NotificationMensage;
      this.notificationService.showNotification('Notificação', {
        body: notificationMessage.body,
      });
    });
  }

  onStartClick(): void {
    this.intervalId = setInterval(() => {
      this.countdown();
    }, 1000);

    this.isTimerStarted = true;
    this.audioService.play('play');
  }

  onPauseClick(): void {
    this.isTimerStarted = false;
    clearInterval(this.intervalId);

    this.audioService.play('pause');
  }

  onChangeContext(context: ContextType): void {
    this.contextService.updateContext(context);
  }

  onToggleMusicClick(): void {
    if (this.hasPlaySong) {
      this.audioService.play('environment');
      return;
    }

    this.audioService.stop('environment');
  }

  private countdown(): void {
    if (this.timerInSeconds <= 0) {
      this.audioService.play('beep');

      this.resetTimer();
      this.setTimerSecond();
      this.configTimer();

      this.sendNotificationAfterCountdown();

      return;
    }

    this.timerInSeconds -= 1;
    this.configTimer();
  }

  private resetTimer(): void {
    this.isTimerStarted = false;
    clearInterval(this.intervalId);
  }

  private configTimer(): void {
    this.timerFormat = new Date(this.timerInSeconds * 1000).toLocaleTimeString(
      'pt-Br',
      { minute: '2-digit', second: '2-digit' }
    );
  }

  private setTimerSecond(): void {
    switch (this.context()) {
      case 'foco':
        this.timerInSeconds = 15; // 25 minutos
        break;
      case 'descanso-curto':
        this.timerInSeconds = 5; // 5 minutos
        break;
      case 'descanso-longo':
        this.timerInSeconds = 9; // 15 minutos
        break;
    }
  }

  private async sendNotificationAfterCountdown(): Promise<void> {
    const context = this.context();
    const mensagem =
      context === 'foco'
        ? 'Tempo de foco finalizado! Hora de descansar.'
        : 'Descanso finalizado! Vamos voltar ao foco.';

    console.log('[NOTIFICAÇÃO] Tentando enviar...', Notification.permission);

    try {
      await this.notificationService.showNotification('NG Fokus', {
        body: mensagem,
        icon: 'assets/icons/icon-192x192.png',
      });
    } catch (err) {
      console.error('Falha ao exibir a notificação', err);
    }
  }
}
