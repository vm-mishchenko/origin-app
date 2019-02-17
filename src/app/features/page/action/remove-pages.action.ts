import {WallModelFactory} from 'ngx-wall';
import {PersistentStorage} from '../../../infrastructure/persistent-storage';
import {PageFileUploaderService} from '../page-file-uploader.service';
import {IBodyPage, IIdentityPage, IRelationPage} from '../page.types';
import {RemovePageAction} from './remove-page.action';
import {RemoveSiblingsPageAction} from './remove-siblings-page.action';

/**
 * There is sophisticated strategy for removing list of page id.
 *
 * First step: filter all pages which are children of other removed pages.
 * For example pageIds is a list of [A, B] page ids. If B is a child of A
 * we should call remove method only for A page. All children will be removed automatically.
 * Without such filtering there is might be a race condition, where page A was already removed
 * but removing process of page B tries to change page A body property.
 *
 * Second step: siblings pages should be removed in one update operation. Removing them separately might
 * lead to race condition.
 *
 * First step is less likely at least for current UI implementation. In UI hard simultaneously remove
 * pages from different position in the tree.
 * So currently only Second constraint is implemented.
 * */
export class RemovePagesAction {
    constructor(private pageIds: string[],
                private pageIdentityStorage: PersistentStorage<IIdentityPage>,
                private pageBodyStorage: PersistentStorage<IBodyPage>,
                private pageRelationStorage: PersistentStorage<IRelationPage>,
                private wallModelFactory: WallModelFactory,
                private pageFileUploaderService: PageFileUploaderService) {
    }

    execute(): Promise<any> {
        return this.getPageIdsSiblingsList().then((pageIdSiblingList) => {
            return pageIdSiblingList.map((pageIdSibling) => {
                if (pageIdSibling.length === 1) {
                    return new RemovePageAction(
                        pageIdSibling[0],
                        this.pageIdentityStorage,
                        this.pageBodyStorage,
                        this.pageRelationStorage,
                        this.wallModelFactory,
                        this.pageFileUploaderService
                    ).execute();
                } else if (pageIdSibling.length > 1) {
                    return new RemoveSiblingsPageAction(
                        pageIdSibling,
                        this.pageIdentityStorage,
                        this.pageBodyStorage,
                        this.pageRelationStorage,
                        this.wallModelFactory,
                        this.pageFileUploaderService
                    ).execute();
                }

                throw new Error('Unexpected remove page action arguments');
            });
        });
    }

    /*
    * Get all page relations for page ids
    * Group them by parentId
    * Return list of pairs
    * */
    private getPageIdsSiblingsList(): Promise<Array<string[]>> {
        // Get all page relations for page ids
        return Promise.all(
            this.pageIds.map((pageId) => this.pageRelationStorage.get(pageId))
        ).then((pageRelations) => {
            const KEY_NULL_PARENT_ID = 'Relation without parent id';
            const pageRelationMapByParentId = new Map<string, IRelationPage[]>();

            // Group them by parentId
            pageRelations
                .forEach((pageRelation) => {
                    this.addItemToMapArray(
                        pageRelationMapByParentId,
                        pageRelation.parentPageId || KEY_NULL_PARENT_ID,
                        pageRelation
                    );
                });

            // Return list of pairs
            return Array.from(pageRelationMapByParentId.keys())
                .filter((pageRelationMapKey) => pageRelationMapKey !== KEY_NULL_PARENT_ID)
                .map((pageRelationMapKey) =>
                    pageRelationMapByParentId
                        .get(pageRelationMapKey)
                        .map((pageRelation) => pageRelation.id))
                .concat(
                    (pageRelationMapByParentId
                        .get(KEY_NULL_PARENT_ID) || [])
                        .map((pageRelationsWithoutParent) => [pageRelationsWithoutParent.id])
                );
        });
    }

    private addItemToMapArray(map: Map<string, IRelationPage[]>, key: string, value: IRelationPage) {
        if (!map.has(key)) {
            map.set(key, []);
        }

        const pageRelationList = map.get(key);

        pageRelationList.push(value);
        map.set(key, pageRelationList);
    }
}
