import {InjectionToken, NgModule} from '@angular/core';
import {DatabaseManager, MemoryDb, PouchDbRemoteProvider, RemoteDb} from 'cinatabase';

export const DATABASE_MANAGER = new InjectionToken('Store Manager');
export const REMOTE_PROVIDER_INJECTION_TOKEN = new InjectionToken('Remote provider');
export const REMOTE_DB_INJECTION_TOKEN = new InjectionToken('Remote Db');
export const MEMORY_DB_INJECTION_TOKEN = new InjectionToken('Memory Db');

let dbName = localStorage.getItem('pouchdb-storage:local-database-name');

if (!dbName) {
  dbName = String(Date.now());

  localStorage.setItem('pouchdb-storage:local-database-name', dbName);
}

@NgModule({
  providers: [
    {
      provide: MEMORY_DB_INJECTION_TOKEN,
      useValue: new MemoryDb()
    },
    {
      provide: REMOTE_PROVIDER_INJECTION_TOKEN,
      useValue: new PouchDbRemoteProvider(dbName)
    },
    {
      provide: REMOTE_DB_INJECTION_TOKEN,
      useFactory: (remoteProvider) => {
        return new RemoteDb(remoteProvider);
      },
      deps: [REMOTE_PROVIDER_INJECTION_TOKEN]
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
