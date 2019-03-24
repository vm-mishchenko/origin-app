import {CollectionViewer} from '@angular/cdk/collections';
import {BehaviorSubject, merge, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {IPageTreeNode} from './page-tree-flat.types';

export class PageTreeFlatDataSource {
    private dataChange = new BehaviorSubject<IPageTreeNode[]>([]);

    get data(): IPageTreeNode[] {
        return this.dataChange.value;
    }

    set data(value: IPageTreeNode[]) {
        this.dataChange.next(value);
    }

    connect(collectionViewer: CollectionViewer): Observable<IPageTreeNode[]> {
        return merge(collectionViewer.viewChange, this.dataChange).pipe(map(() => this.data));
    }
}
