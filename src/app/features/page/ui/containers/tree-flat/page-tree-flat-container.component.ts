import {FlatTreeControl} from '@angular/cdk/tree';
import {Component, OnDestroy} from '@angular/core';
import {QuerySnapshot} from 'cinatabase';
import {combineLatest} from 'rxjs';
import {PageService} from '../../../repository';
import {PageRepositoryService2} from '../../../repository/page-repository.service2';
import {PageTreeFlatDataSource} from './page-tree-flat-data-source.class';
import {PageTreeFlatSelection} from './page-tree-flat-selection.class';
import {PageTreeFlat} from './page-tree-flat.class';
import {IPageTreeNode} from './page-tree-flat.types';

@Component({
    selector: 'app-page-tree-flat-container',
    templateUrl: './page-tree-flat-container.component.html',
    styleUrls: ['./page-tree-flat-container.component.scss']
})
export class PageTreeFlatContainerComponent implements OnDestroy {
    pageTreeFlatSelection: PageTreeFlatSelection = new PageTreeFlatSelection(this.pageRepositoryService2.selectPageRelations());
    treeControl: FlatTreeControl<IPageTreeNode>;
    dataSource: PageTreeFlatDataSource = new PageTreeFlatDataSource();

    private pageRelationsQuerySnapshot: QuerySnapshot;
    private pageIdentitiesQuerySnapshot: QuerySnapshot;

    constructor(private pageService: PageService,
                private pageRepositoryService2: PageRepositoryService2) {
        this.treeControl = new FlatTreeControl<IPageTreeNode>(this.getLevel, this.isExpandable);

        // todo: unsubscribe after
        combineLatest(
          this.pageRepositoryService2.selectPageIdentities(),
          this.pageRepositoryService2.selectPageRelations()
        ).subscribe(([pageIdentities, pageRelations]) => {
            this.pageIdentitiesQuerySnapshot = pageIdentities;
            this.pageRelationsQuerySnapshot = pageRelations;

            this.reRenderTree();
        });

        this.treeControl.expansionModel.changed.subscribe((changed) => {
            // page is expanded
            changed.added
                .map(selectedPageTreeNode => selectedPageTreeNode.id)
                .forEach((selectedPageId) => {
                    this.pageRepositoryService2.syncTreePageChildren(selectedPageId);
                    this.pageTreeFlatSelection.addSelectedPageId(selectedPageId);
                });

            // page is collapsed
            changed.removed
                .map((removedItem) => removedItem.id)
                .forEach(removedPageId => {
                    this.pageTreeFlatSelection.removeSelectedPageId(removedPageId);
                });

            this.reRenderTree();
        });
    }

    getLevel = (node: IPageTreeNode) => node.level;

    isExpandable = (node: IPageTreeNode) => node.expandable;

    hasChild = (_: number, node: IPageTreeNode) => node.expandable;

    removePage(id: string) {
        this.pageTreeFlatSelection.removeSelectedPageId(id);
        this.pageService.removePage2(id);
    }

    reRenderTree() {
        this.dataSource.data = new PageTreeFlat(
          this.pageRelationsQuerySnapshot,
          this.pageIdentitiesQuerySnapshot,
            this.pageTreeFlatSelection.selectedIds
        ).build();
    }

    trackByFn(i, node) {
        return JSON.stringify(node);
    }

    ngOnDestroy() {
        this.pageTreeFlatSelection.destructor();
    }
}
