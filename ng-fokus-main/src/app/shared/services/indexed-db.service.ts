import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, filter, Observable, switchMap, take } from 'rxjs';
import { TaskItem } from '../components/task-manager/task-item';
import * as CryptoJS from 'crypto-js';



@Injectable({
  providedIn: 'root',
})
export class IndexedDBService {
  private readonly db$ = new BehaviorSubject<IDBDatabase | null>(null);
  private readonly store = { name: 'tasks', key: 'uuid' };
  private dbReady$ = new BehaviorSubject<boolean>(false);

  private readonly secretKey = 'chave-secreta';


  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeIndexedDB();
    }
  }

  private initializeIndexedDB(): void {
    const request = indexedDB.open('TaskMangerDB', 1);

    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(this.store.name)) {
        db.createObjectStore(this.store.name, { keyPath: this.store.key });
      }
    };

    request.onsuccess = (e) => {
      this.db$.next((e.target as IDBOpenDBRequest).result);
      this.dbReady$.next(true);
    };
  }

  private encrypt(data: any) : string {
    return CryptoJS.AES.encrypt(JSON.stringify(data), this.secretKey).toString();
  }

  private decrypt(encryptedData: string) : any {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.secretKey);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }

  private waitForDB(): Observable<boolean> {
    return this.dbReady$.pipe(
      filter((ready) => ready),
      take(1)
    );
  }

  private get store$(): IDBObjectStore {
    if(!isPlatformBrowser(this.platformId)){
      throw new Error('IndexDB is only avaible in browser')
    }
    const db = this.db$.getValue();
    return db?.transaction(this.store.name, 'readwrite').objectStore(this.store.name) ?? (() =>
      {
      throw new Error('DB not initialized')
    })();
  }

  addTask(task: TaskItem): Observable<TaskItem> {
    return this.waitForDB().pipe(
      switchMap(() => new Observable<TaskItem>(obs => {
        const encryptTask = {
          uuid: task.uuid,
          encryptedData: this.encrypt({
            ...task
          })
        };

        const req = this.store$.add(encryptTask);
        req.onsuccess = () => {obs.next(task); obs.complete();}
        req.onerror = () => {obs.error('Add task failed')}
      }))
    )
  }

  listAllTasks(): Observable<TaskItem[]> {
  return this.waitForDB().pipe(
    switchMap(() => new Observable<TaskItem[]>(obs => {
      const req = this.store$.getAll();
      req.onsuccess = () => {
        try {
          const tasks = (req.result as any[]).map(item => {
            try {
              const decrypted = this.decrypt(item.encryptedData);
              return { ...decrypted, uuid: item.uuid };
            } catch (e) {
              console.warn('Falha ao descriptografar item, ignorando:', item);
              return null; // ignora esse item
            }
          }).filter((task): task is TaskItem => task !== null); // remove nulos

          obs.next(tasks);
          obs.complete();
        } catch (err) {
          obs.error('Decryption failed');
        }
      };
      req.onerror = () => obs.error('List task failed');
    }))
  );
}


  clearAllTasks(): Observable<void> {
    return this.waitForDB().pipe(
      switchMap(() => new Observable<void>(obs => {
        const req = this.store$.clear();
        req.onsuccess = () => {obs.next(); obs.complete();}
        req.onerror = () => {obs.error('Clear tasks failed')}
      }))
    )
  }



}
