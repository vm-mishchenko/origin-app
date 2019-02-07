import {Injectable} from '@angular/core';
import {HashMap} from '@datorama/akita';
import {WallModelFactory} from 'ngx-wall';
import {Observable, Subject} from 'rxjs';
import {PersistentStorage, PersistentStorageFactory} from '../../infrastructure/persistent-storage';
import {Guid} from '../../infrastructure/utils';
import {CreatePageAction} from './action/create-page.action';
import {RemovePageAction} from './action/remove-page.action';
import {DeletePageEvent} from './page-events.type';
import {IBodyPage, IIdentityPage, IRelationPage} from './page.types';

@Injectable()
export class PageService {
    // todo: move to other service
    pageIdentity$: Observable<HashMap<IIdentityPage>>;
    pageRelation$: Observable<HashMap<IRelationPage>>;
    pageBody$: Observable<HashMap<IBodyPage>>;

    // todo - integrate to application event stream
    // todo - replace any type
    events$: Observable<any> = new Subject<any>();

    private pageIdentityStorage: PersistentStorage<IIdentityPage>;
    private pageBodyStorage: PersistentStorage<IBodyPage>;
    private pageRelationStorage: PersistentStorage<IRelationPage>;

    constructor(private persistentStorageFactory: PersistentStorageFactory,
                private wallModelFactory: WallModelFactory,
                private guid: Guid) {
        // initialize required storage
        this.pageIdentityStorage = this.persistentStorageFactory.create<IIdentityPage>({
            name: 'page-identity'
        });
        this.pageBodyStorage = this.persistentStorageFactory.create<IBodyPage>({
            name: 'page-body'
        });
        this.pageRelationStorage = this.persistentStorageFactory.create<IRelationPage>({
            name: 'page-relation'
        });

        // todo: move to the separate query service
        this.pageIdentity$ = this.pageIdentityStorage.entities$;
        this.pageRelation$ = this.pageRelationStorage.entities$;
        this.pageBody$ = this.pageBodyStorage.entities$;
    }

    createPage(parentPageId: string = null): Promise<string> {
        return new CreatePageAction(
            parentPageId,
            this.pageIdentityStorage,
            this.pageBodyStorage,
            this.pageRelationStorage,
            this.guid,
            this.wallModelFactory
        ).execute();
    }

    removePage(pageId: string): Promise<any> {
        return new RemovePageAction(
            pageId,
            this.pageIdentityStorage,
            this.pageBodyStorage,
            this.pageRelationStorage,
            this.wallModelFactory
        ).execute().then(() => {
            (this.events$ as Subject<any>).next(new DeletePageEvent(pageId));
        });
    }

    loadIdentityPage(id: string): Promise<IIdentityPage> {
        return this.pageIdentityStorage.load(id).catch(() => {
            // todo: log internal error
            throw new Error(`Identity page "${id}" does not exist`);
        });
    }

    updatePageIdentity(identityPage: Partial<IIdentityPage>): Promise<Partial<IIdentityPage>> {
        return this.pageIdentityStorage.update(identityPage.id, identityPage);
    }

    updatePageBody(bodyPage: Partial<IBodyPage>): Promise<Partial<IBodyPage>> {
        return this.pageBodyStorage.update(bodyPage.id, bodyPage);
    }

    loadBodyPage(id: string): Promise<IBodyPage> {
        return this.pageBodyStorage.load(id).catch(() => {
            // todo: log internal error
            throw new Error(`Body page "${id}" does not exist`);
        });
    }

    loadRelationPage(id: string): Promise<IRelationPage> {
        return this.pageRelationStorage.load(id).catch((e) => {
            // todo: log internal error
            throw new Error(`Relation page "${id}" does not exist`);
        });
    }

    loadPage(id: string): Promise<any> {
        return Promise.all([
            this.pageIdentityStorage.load(id),
            this.pageBodyStorage.load(id),
            this.pageRelationStorage.load(id),
        ]);
    }

    loadRootPages(): Promise<any> {
        return this.pageRelationStorage.findAndLoad({
            selector: {
                parentPageId: null
            }
        }).then((rootPageRelations) => {
            return Promise.all(rootPageRelations.map((rootPageRelation) => {
                return this.pageIdentityStorage.load(rootPageRelation.id);
            }));
        });
    }

    // todo: Refactor that code
    loadTreePageChildren(pageId: string) {
        this.pageRelationStorage.get(pageId).then((relation) => {
            return Promise.all(relation.childrenPageId.map((childPageId) => {
                return Promise.all([
                    this.pageIdentityStorage.load(childPageId),
                    this.pageRelationStorage.load(childPageId),
                ]);
            }));
        }).catch((e) => {
            // todo: login error, most likely child page was already deleted
        });
    }
}
