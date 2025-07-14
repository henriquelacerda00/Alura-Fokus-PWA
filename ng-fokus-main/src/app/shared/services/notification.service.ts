import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { Observable, of } from 'rxjs';
import { NotificationMensage } from './types';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  readonly VAPID_PUBLIC_KEY =
  "BJh7FetkyGpADhoXbt85LKhnLNlYp_VOYtdZ9tT-cUm1k8cKb7yPdwm0YJuFP6EZlCvFz9XPKlAL5czs7eukpaQ";

  private baseUrl = 'http://localhost:3000';

  constructor(@Inject(PLATFORM_ID) private platformId: Object , private http : HttpClient , private swPush: SwPush)  {
    this.subscribeToNotifications()

  }

  /**
   * Solicita permissão para exibir notificações no navegador
   */
  requestPermission(): Promise<NotificationPermission> {
    if (!this.notificationSupported) {
      return Promise.reject('Notifications not supported');
    }

    return Notification.requestPermission();
  }

  /**
   * Exibe uma notificação (preferencialmente via Service Worker)
   * Se não houver SW, faz fallback para `new Notification(...)`
   */
  showNotification(title: string, options?: NotificationOptions): void {
    if (!this.notificationSupported) {
        console.warn('Notifications not supported');
        return;
    }

    if (window.Notification.permission === 'granted') {
        new window.Notification(title, options);
    } else {
        console.warn('Notifications not supported');
    }
}

private get notificationSupported(): boolean {
    return isPlatformBrowser(this.platformId) && 'Notification' in window;
}

  subscribeToNotifications(){
    this.swPush.requestSubscription({
      serverPublicKey: this.VAPID_PUBLIC_KEY
    }).then(subscription =>{
      this.sendSubscriptionToServer(subscription).subscribe()

    })

  }

  sendSubscriptionToServer(subscription:PushSubscription): Observable<NotificationMensage>{
    return this.http.post<NotificationMensage>(`${this.baseUrl}/subscribe`, subscription)
  }


}
