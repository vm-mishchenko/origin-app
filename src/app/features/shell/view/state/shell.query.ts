import {Injectable} from '@angular/core';
import {Query} from '@datorama/akita';
import {IShellStore, ShellStore} from './shell.store';

@Injectable()
export class ShellQuery extends Query<IShellStore> {
    isMenuOpen$ = this.select(shellStore => Boolean(shellStore.isMenuOpen));

    constructor(protected shellStore: ShellStore) {
        super(shellStore);
    }
}
