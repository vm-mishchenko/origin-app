import {Injectable} from '@angular/core';
import {HashMap} from '@datorama/akita';
import {WallModelFactory} from 'ngx-wall';
import {Observable, Subject} from 'rxjs';
import {PersistentStorage, PersistentStorageFactory} from '../../infrastructure/persistent-storage';
import {Guid} from '../../infrastructure/utils';
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
        const newPageId = this.guid.generate();

        const pageIdentity = {
            id: newPageId,
            title: 'Default title'
        };

        const pageBody = {
            id: newPageId,
            body: this.wallModelFactory.create().api.core.getPlan()
        };

        const pageRelation = {
            id: newPageId,
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
                            newPageId
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
        ]).then(() => newPageId);
    }

    removePage(pageId: string): Promise<any> {
        return Promise.all([
            this.updateParentChildrenAfterRemove(pageId),
            this.removePageWithChildren(pageId),
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
            console.log(relation);

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

    private updateParentChildrenAfterRemove(removedPageId: string): Promise<any> {
        return this.pageRelationStorage.get(removedPageId)
            .then((removedPageRelation) => {
                if (removedPageRelation.parentPageId) {
                    return this.pageRelationStorage.get(removedPageRelation.parentPageId).then((parentPageRelation) => {
                        // remove page from children
                        const removedChildIndex = parentPageRelation.childrenPageId.indexOf(removedPageId);

                        return this.pageRelationStorage.update(parentPageRelation.id, {
                            childrenPageId: [
                                ...parentPageRelation.childrenPageId.slice(0, removedChildIndex),
                                ...parentPageRelation.childrenPageId.slice(removedChildIndex + 1)
                            ]
                        }).then(() => {
                        });
                    });
                } else {
                    return Promise.resolve();
                }
            });
    }

    private removePageWithChildren(removedPageId: string) {
        const removeChildPages = this.pageRelationStorage.get(removedPageId).then((pageRelation) => {
            return pageRelation.childrenPageId.map((childrenPageId) => this.removePageWithChildren(childrenPageId));
        });

        return Promise.all([
            removeChildPages,
            this.pageIdentityStorage.remove(removedPageId),
            this.pageBodyStorage.remove(removedPageId),
            this.pageRelationStorage.remove(removedPageId),
        ]).then(() => {
            (this.events$ as Subject<any>).next(new DeletePageEvent(removedPageId));
        });
    }
}
