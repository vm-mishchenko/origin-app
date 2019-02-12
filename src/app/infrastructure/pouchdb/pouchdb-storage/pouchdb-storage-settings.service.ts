import {Injectable} from '@angular/core';

const REMOTE_DB_URL_KEY = 'pouchdb-storage:removeDbUrl';

@Injectable()
export class PouchdbStorageSettings {
    localDbNames: string[] = [];
    remoteDbUrl: string;

    constructor() {
        this.remoteDbUrl = localStorage.getItem(REMOTE_DB_URL_KEY);
    }

    addLocalDbName(name: string) {
        this.localDbNames.push(name);
    }

    setRemoteDbUrl(url: string) {
        this.remoteDbUrl = url;
        localStorage.setItem(REMOTE_DB_URL_KEY, this.remoteDbUrl);
    }
}
