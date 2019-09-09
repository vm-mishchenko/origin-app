import {QuerySnapshot} from 'cinatabase';
import {Observable, Subscription} from 'rxjs';
import {IPageRelation} from '../../../repository/interfaces';

export class PageTreeFlatSelection {
    selectedIds: string[] = [];
    pageRelationsQuerySnapshot: QuerySnapshot<IPageRelation>;

    pageRelationsSubscription: Subscription;

    constructor(private pageRelationsQuerySnapshot$: Observable<QuerySnapshot<IPageRelation>>) {
        this.pageRelationsSubscription = this.pageRelationsQuerySnapshot$.subscribe((pageRelationsQuerySnapshot) => {
            this.pageRelationsQuerySnapshot = pageRelationsQuerySnapshot;
        });
    }

    addSelectedPageId(pageId: string) {
        this.selectedIds.push(pageId);
    }

    removeSelectedPageId(removedPageId: string) {
        this.getAllPageChildrenIds(removedPageId).concat(removedPageId)
            .filter((pageId) => this.selectedIds.includes(pageId))
            .forEach((pageId) => {
                this.selectedIds.splice(this.selectedIds.indexOf(pageId), 1);
            });
    }

    destructor() {
        this.pageRelationsSubscription.unsubscribe();
    }

    private getAllPageChildrenIds(pageId: string, result = []) {
        this.pageRelationsQuerySnapshot.getDocWithId(pageId).data().childrenPageId
            .forEach((childPageId) => result.push(childPageId));

        this.pageRelationsQuerySnapshot.getDocWithId(pageId).data().childrenPageId
          .filter((childPageId) => Boolean(this.pageRelationsQuerySnapshot.hasDocWithId(childPageId)))
            .map((childPageId) => this.getAllPageChildrenIds(childPageId, result));

        return result;
    }
}
