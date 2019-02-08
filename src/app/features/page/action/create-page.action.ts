import {WallModelFactory} from 'ngx-wall';
import {PersistentStorage} from '../../../infrastructure/persistent-storage';
import {Guid} from '../../../infrastructure/utils';
import {IBodyPage, IIdentityPage, IRelationPage} from '../page.types';

export class CreatePageAction {
    constructor(
        private parentPageId: string = null,
        private pageIdentityStorage: PersistentStorage<IIdentityPage>,
        private pageBodyStorage: PersistentStorage<IBodyPage>,
        private pageRelationStorage: PersistentStorage<IRelationPage>,
        private guid: Guid,
        private wallModelFactory: WallModelFactory
    ) {
    }

    execute(): Promise<string> {
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
            parentPageId: this.parentPageId,
            childrenPageId: []
        };

        /* If parent exists we should update parent relations as well */
        const updateParentPageRelation = new Promise((resolve, reject) => {
            if (this.parentPageId) {
                this.pageRelationStorage.get(this.parentPageId).then(() => {
                    const relationEntries = this.pageRelationStorage.getMemoryEntries();

                    this.pageRelationStorage.update(this.parentPageId, {
                        childrenPageId: [
                            ...relationEntries[this.parentPageId].childrenPageId,
                            newPageId
                        ]
                    }).then(resolve, reject);
                });
            } else {
                resolve();
            }
        });

        const updateParentPageBody = new Promise((resolve, reject) => {
            if (this.parentPageId) {
                this.pageBodyStorage.get(this.parentPageId).then((parentPageBody) => {
                    const wallModel = this.wallModelFactory.create({plan: parentPageBody.body});

                    wallModel.api.core.addBrickAtStart('page', {pageId: newPageId});

                    this.pageBodyStorage.update(this.parentPageId, {
                        body: wallModel.api.core.getPlan()
                    }).then(resolve, reject);
                });
            } else {
                resolve();
            }
        });

        return Promise.all([
            updateParentPageBody,
            updateParentPageRelation,
            this.pageIdentityStorage.add(pageIdentity),
            this.pageBodyStorage.add(pageBody),
            this.pageRelationStorage.add(pageRelation)
        ]).then(() => newPageId);
    }
}