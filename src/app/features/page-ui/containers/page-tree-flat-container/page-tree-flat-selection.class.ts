import {HashMap} from '@datorama/akita';
import {Observable, Subscription} from 'rxjs';
import {IRelationPage} from '../../../page/page.types';

export class PageTreeFlatSelection {
    selectedIds: string[] = [];
    pageRelations: HashMap<IRelationPage>;

    pageRelationsSubscription: Subscription;

    constructor(private pageRelations$: Observable<HashMap<IRelationPage>>) {
        this.pageRelationsSubscription = this.pageRelations$.subscribe((pageRelations) => {
            this.pageRelations = pageRelations;
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
        this.pageRelations[pageId].childrenPageId
            .forEach((childPageId) => result.push(childPageId));

        this.pageRelations[pageId].childrenPageId
            .filter((childPageId) => Boolean(this.pageRelations[childPageId]))
            .map((childPageId) => this.getAllPageChildrenIds(childPageId, result));

        return result;
    }
}
