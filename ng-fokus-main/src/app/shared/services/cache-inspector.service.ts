import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CacheInspectorService {

  constructor() { }

  async checkAssetsCache():Promise<void>{
    try{
      const cacheNames = await caches.keys();
      for(const cacheName of cacheNames){
        if(cacheName.includes('ngsw')){
          const cache = await caches.open(cacheName);
          const cacheRequests = await cache.keys();

          console.log(`\nCache encontrado: ${cacheName}`);
          console.log(`Assets em cache:`);

          cacheRequests.filter(request => {
            request.url.includes('/assets/')
          }).forEach(request => {
            console.log(`- ${new URL(request.url).pathname.replace('/assets/', '')}`);
          })
        }
      }

    }catch(error){
      console.error('Erro ao verificar cache: ',error)
    }
  }
}
