import {InjectionToken, NgModule} from '@angular/core';
import {DatabaseManager, MemoryDb, RemoteDb} from 'cinatabase';

export const DATABASE_MANAGER = new InjectionToken('Store Manager');
export const REMOTE_DB_INJECTION_TOKEN = new InjectionToken('Remote Db');
export const MEMORY_DB_INJECTION_TOKEN = new InjectionToken('Memory Db');

@NgModule({
  providers: [
    {
      provide: MEMORY_DB_INJECTION_TOKEN,
      useValue: new MemoryDb()
    },
    {
      provide: REMOTE_DB_INJECTION_TOKEN,
      useValue: new RemoteDb()
    },
    {
      provide: DATABASE_MANAGER,
      useFactory: (memoryDb, remoteDb) => {
        return new DatabaseManager(memoryDb, remoteDb);
      },
      deps: [MEMORY_DB_INJECTION_TOKEN, REMOTE_DB_INJECTION_TOKEN]
    }
  ]
})
export class StoreModule {
}
