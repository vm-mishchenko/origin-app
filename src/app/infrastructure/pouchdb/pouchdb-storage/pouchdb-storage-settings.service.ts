import {Injectable} from '@angular/core';

const REMOTE_DB_URL_KEY = 'pouchdb-storage:removeDbUrl';
const LOCAL_DB_NAMES_KEY = 'pouchdb-storage:localDbNames';

@Injectable({
    providedIn: 'root'
})
export class PouchdbStorageSettings {
    localDbNames: string[] = [];
    remoteDbUrl: string;

    constructor() {
        this.remoteDbUrl = localStorage.getItem(REMOTE_DB_URL_KEY);
        this.localDbNames = JSON.parse(localStorage.getItem(LOCAL_DB_NAMES_KEY)) || [];
    }

    registerLocalDbName(name: string) {
        if (!this.localDbNames.includes(name)) {
            this.localDbNames.push(name);
            this.saveLocalDbNames();
        }
    }

    setRemoteDbUrl(url: string) {
        this.remoteDbUrl = url;
        this.saveRemoteDbUrl();
    }

    private saveLocalDbNames() {
        localStorage.setItem(LOCAL_DB_NAMES_KEY, JSON.stringify(this.localDbNames));
    }

    private saveRemoteDbUrl() {
        localStorage.setItem(REMOTE_DB_URL_KEY, this.remoteDbUrl);
    }
}
