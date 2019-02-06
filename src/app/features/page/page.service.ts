import {Injectable} from '@angular/core';
import {HashMap} from '@datorama/akita';
import {WallModelFactory} from 'ngx-wall';
import {Observable} from 'rxjs';
import {PersistentStorage, PersistentStorageFactory} from '../../infrastructure/persistent-storage';
import {Guid} from '../../infrastructure/utils';
import {IBodyPage, IIdentityPage, IRelationPage} from './page.types';

@Injectable()
export class PageService {
    // todo: move to other service
    pageIdentity$: Observable<HashMap<IIdentityPage>>;
    pageRelation$: Observable<HashMap<IRelationPage>>;
    pageBody$: Observable<HashMap<IBodyPage>>;

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

        // test

        // [
        //     '1',
        //     '2',
        //     '3'
        // ].forEach((title) => {
        //     this.pageIdentityStorage.update('b40a4678-f0bb-55e4-6830-6374934b83c5', {
        //         title
        //     }).then(() => {
        //         console.log(`${title} was applied`);
        //     });
        // });
    }

    createPage(parentPageId: string = null): Promise<string> {
        const id = this.guid.generate();

        const pageIdentity = {
            id,
            title: 'Default title'
        };

        const pageBody = {
            id,
            body: this.wallModelFactory.create().api.core.getPlan()
        };

        const pageRelation = {
            id,
            parentPageId: parentPageId,
            childrenPageId: []
        };

        /* If parent exists we should update parent relations as well */
        const updateParentPageRelation = new Promise((resolve, reject) => {
            if (parentPageId) {
                this.pageRelationStorage.get(parentPageId).then(() => {
                    const relationEntries = this.pageRelationStorage.getMemoryEntries();

                    this.pageRelationStorage.update(parentPageId, {
                        childrenPageId: [
                            ...relationEntries[parentPageId].childrenPageId,
                            id
                        ]
                    }).then(resolve, reject);
                });
            } else {
                resolve();
            }
        });

        return Promise.all([
            updateParentPageRelation,
            this.pageIdentityStorage.add(pageIdentity),
            this.pageBodyStorage.add(pageBody),
            this.pageRelationStorage.add(pageRelation)
        ]).then(() => id);
    }

    removePage(id: string): Promise<any> {
        const removeChildPages = this.pageRelationStorage.get(id).then((pageRelation) => {
            return pageRelation.childrenPageId.map((childrenPageId) => this.removePage(childrenPageId));
        });

        return Promise.all([
            removeChildPages,
            this.pageIdentityStorage.remove(id),
            this.pageBodyStorage.remove(id),
            this.pageRelationStorage.remove(id),
        ]);
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
        });
    }
}
