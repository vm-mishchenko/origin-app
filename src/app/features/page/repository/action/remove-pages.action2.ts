import {WallModelFactory} from 'ngx-wall';
import {PageFileUploaderService} from '../page-file-uploader.service';
import {PageStoragesService2} from '../page-storages.service2';
import {IRelationPage} from '../page.types';
import {RemovePageAction2} from './remove-page.action2';
import {RemoveSiblingsPageAction2} from './remove-siblings-page.action2';

/**
 * There is sophisticated strategy for removing list of page id.
 *
 * First step: filter all pages which are children of other removed pages.
 * For example pageIds is a list of [A, B] page ids. If B is a child of A
 * we should call remove method only for A page. All children will be removed automatically.
 * Without such filtering there is might be a race condition, where page A was already removed
 * but removing process of page B tries to change page A body-editor property.
 *
 * Second step: siblings pages should be removed in one update operation. Removing them separately might
 * lead to race condition.
 *
 * First step is less likely at least for current UI implementation. In UI hard simultaneously remove
 * pages from different position in the tree-flat.
 * So currently only Second constraint is implemented.
 * */
export class RemovePagesAction2 {
  constructor(private pageIds: string[],
              private wallModelFactory: WallModelFactory,
              private pageFileUploaderService: PageFileUploaderService,
              private pageStoragesService2: PageStoragesService2,
  ) {
  }

  execute(): Promise<any> {
    return this.getPageIdsSiblingsList().then((pageIdSiblingList) => {
      const removingPromises = pageIdSiblingList.map((pageIdSibling) => {
        if (pageIdSibling.length === 1) {
          return new RemovePageAction2(
            pageIdSibling[0],
            this.wallModelFactory,
            this.pageFileUploaderService,
            this.pageStoragesService2
          ).execute();
        } else if (pageIdSibling.length > 1) {
          return new RemoveSiblingsPageAction2(
            pageIdSibling,
            this.wallModelFactory,
            this.pageFileUploaderService,
            this.pageStoragesService2
          ).execute();
        }

        throw new Error('Unexpected remove page action arguments');
      });

      return Promise.all(removingPromises);
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
      this.pageIds.map((pageId) => this.pageStoragesService2.pageRelations.doc(pageId).snapshot())
    ).then((pageRelationSnapshots) => {
      const KEY_NULL_PARENT_ID = 'Relation without parent id';
      const pageRelationMapByParentId = new Map<string, IRelationPage[]>();

      // Group them by parentId
      pageRelationSnapshots
        .forEach((pageRelationSnapshot) => {
          this.addItemToMapArray(
            pageRelationMapByParentId,
            pageRelationSnapshot.data().parentPageId || KEY_NULL_PARENT_ID,
            {
              id: pageRelationSnapshot.id,
              ...pageRelationSnapshot.data()
            }
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
