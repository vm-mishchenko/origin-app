import {Injectable} from '@angular/core';
import {HashMap} from '@datorama/akita';
import {Observable} from 'rxjs';
import {PageStoragesService} from './page-storages.service';
import {IBodyPage, IIdentityPage, IRelationPage} from './page.types';

@Injectable()
export class PageRepositoryService {
    pageIdentity$: Observable<HashMap<IIdentityPage>>;
    pageRelation$: Observable<HashMap<IRelationPage>>;
    pageBody$: Observable<HashMap<IBodyPage>>;

    constructor(private pageStoragesService: PageStoragesService) {
        this.pageIdentity$ = this.pageStoragesService.pageIdentityStorage.entities$;
        this.pageRelation$ = this.pageStoragesService.pageRelationStorage.entities$;
        this.pageBody$ = this.pageStoragesService.pageBodyStorage.entities$;
    }

    loadIdentityPage(id: string): Promise<IIdentityPage> {
        return this.pageStoragesService.pageIdentityStorage.load(id).catch(() => {
            // todo: log internal error
            throw new Error(`Identity page "${id}" does not exist`);
        });
    }

    loadBodyPage(id: string): Promise<IBodyPage> {
        return this.pageStoragesService.pageBodyStorage.load(id).catch(() => {
            // todo: log internal error
            throw new Error(`Body page "${id}" does not exist`);
        });
    }

    loadRelationPage(id: string): Promise<IRelationPage> {
        return this.pageStoragesService.pageRelationStorage.load(id).catch((e) => {
            // todo: log internal error
            throw new Error(`Relation page "${id}" does not exist`);
        });
    }

    loadRootPages(): Promise<any> {
        return this.pageStoragesService.pageRelationStorage.findAndLoad({
            selector: {
                parentPageId: null
            }
        }).then((rootPageRelations) => {
            return Promise.all(rootPageRelations.map((rootPageRelation) => {
                return this.pageStoragesService.pageIdentityStorage.load(rootPageRelation.id);
            }));
        });
    }

    // todo: Refactor that code
    loadTreePageChildren(pageId: string) {
        this.pageStoragesService.pageRelationStorage.get(pageId).then((relation) => {
            return Promise.all(relation.childrenPageId.map((childPageId) => {
                return Promise.all([
                    this.pageStoragesService.pageIdentityStorage.load(childPageId),
                    this.pageStoragesService.pageRelationStorage.load(childPageId),
                ]);
            }));
        }).catch((e) => {
            // todo: login error, most likely child page was already deleted
        });
    }
}
