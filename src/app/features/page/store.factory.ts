import {Injectable} from '@angular/core';
import * as PouchDB from 'pouchdb/dist/pouchdb';
import {PageIdentityMemoryStore} from './page-identity-memory-store.service';

/*
* Responsibilities
* -
* */
@Injectable()
export class StoreFactory {
    constructor() {
    }

    create<T>(): any {
        /*this.persistentDb = new PouchDB('page-identity');
        this.memoryDb = new PageIdentityMemoryStore();*/
    }
}
