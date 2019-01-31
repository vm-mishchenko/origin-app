import {Injectable} from '@angular/core';
import {HashMap} from '@datorama/akita';
import {WallModelFactory} from 'ngx-wall';
import {Observable} from 'rxjs';
import {PersistentStorage, PersistentStorageFactory} from '../../infrastructure/persistent-storage';
import {IBodyPage, IIdentityPage, IRelationPage} from './page.types';

@Injectable()
export class PageService {
    // todo: move to other service
    pageIdentity$: Observable<HashMap<IIdentityPage>>;
    pageRelation$: Observable<HashMap<IRelationPage>>;

    private pageIdentityStorage: PersistentStorage<IIdentityPage>;
    private pageBodyStorage: PersistentStorage<IBodyPage>;
    private pageRelationStorage: PersistentStorage<IRelationPage>;

    constructor(private persistentStorageFactory: PersistentStorageFactory,
                private wallModelFactory: WallModelFactory) {
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

        // this.initializePage();
        this.loadRootPages();
    }

    createPage(parentPageId: string = null): Promise<string> {
        const id = String(Date.now());

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

        const updateParentPageRelation = new Promise((resolve, reject) => {
            if (parentPageId) {
                this.pageRelationStorage.load(parentPageId).then(() => {
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
        return this.pageIdentityStorage.remove(id);
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

    // todo: temporary page
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

    private initializePage() {
        Promise.all([
            this.pageIdentityStorage.removeAll(),
            this.pageRelationStorage.removeAll(),
            this.pageBodyStorage.removeAll()
        ]).then(() => {
            Promise.all([
                this.createPage().then((id) => {
                    this.createPage(id).then((childId) => {
                        this.createPage(childId);
                    });
                }),
                this.createPage().then((id) => {
                    this.createPage(id);
                })
            ]).then(() => {
                console.log(`done`);
            });
        });
    }
}
