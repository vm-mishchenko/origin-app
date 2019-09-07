import {QuerySnapshot} from 'cinatabase';
import {Observable, Subscription} from 'rxjs';

export class PageTreeFlatSelection {
    selectedIds: string[] = [];
    pageRelationsQuerySnapshot: QuerySnapshot;

    pageRelationsSubscription: Subscription;

    constructor(private pageRelationsQuerySnapshot$: Observable<QuerySnapshot>) {
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
