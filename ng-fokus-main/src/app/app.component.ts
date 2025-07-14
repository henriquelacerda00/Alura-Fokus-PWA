import { Component, OnInit, effect, inject } from '@angular/core';
import { UpdateService } from './shared/services/update.service';
import { NotificationService } from './shared/services/notification.service';
import { ConnectivityService } from './shared/services/connectivity.service';
import { CacheInspectorService } from './shared/services/cache-inspector.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  private updateService = inject(UpdateService);
  private notificationService = inject(NotificationService);
  private connectivityService = inject(ConnectivityService);
  private cacheInspector = inject(CacheInspectorService);

  constructor(){
    effect(() => {
      if(!this.connectivityService.isOnline){
        this.notificationService.showNotification('Sem conexão', {body: 'Você está offline :('});
        return;
      }
      this.notificationService.showNotification('Conectado', {body: 'Você está online :)'});
    })
  }

  async ngOnInit(){
    const hasUpdate = await this.updateService.checkForUpdate();

    if(hasUpdate){
      console.log('Atualização disponível')
    }

    this.cacheInspector.checkAssetsCache();
  }


}
