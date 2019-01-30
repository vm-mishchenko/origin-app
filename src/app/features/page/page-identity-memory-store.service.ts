import {EntityState, EntityStore, StoreConfig} from '@datorama/akita';
import {IIndentityPage} from './page.types';

export interface IIndentityPageState extends EntityState<IIndentityPage> {
}

@StoreConfig({name: 'page-identity'})
export class PageIdentityMemoryStore extends EntityStore<IIndentityPageState, IIndentityPage> {
    constructor() {
        super();
    }
}
