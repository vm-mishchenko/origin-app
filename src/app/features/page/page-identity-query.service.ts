import {Injectable} from '@angular/core';
import {QueryEntity} from '@datorama/akita';
import {IIndentityPageState} from './page-identity-memory-store.service';
import {IIndentityPage} from './page.types';

@Injectable()
export class PageIdentitiesQuery extends QueryEntity<IIndentityPageState, IIndentityPage> {
}
