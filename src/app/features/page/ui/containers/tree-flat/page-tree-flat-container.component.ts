import {FlatTreeControl} from '@angular/cdk/tree';
import {Component, OnDestroy} from '@angular/core';
import {HashMap} from '@datorama/akita';
import {combineLatest} from 'rxjs';
import {PageRepositoryService, PageService} from '../../../repository';
import {IIdentityPage, IRelationPage} from '../../../repository/page.types';
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
    pageTreeFlatSelection: PageTreeFlatSelection = new PageTreeFlatSelection(this.pageRepositoryService.pageRelation$);
    treeControl: FlatTreeControl<IPageTreeNode>;
    dataSource: PageTreeFlatDataSource = new PageTreeFlatDataSource();
    private pageRelations: HashMap<IRelationPage>;
    private pageIdentities: HashMap<IIdentityPage>;

    constructor(private pageService: PageService, private pageRepositoryService: PageRepositoryService) {
        this.treeControl = new FlatTreeControl<IPageTreeNode>(this.getLevel, this.isExpandable);

        // todo: unsubscribe after
        combineLatest(
            this.pageRepositoryService.pageIdentity$,
            this.pageRepositoryService.pageRelation$
        ).subscribe(([pageIdentities, pageRelations]) => {
            this.pageIdentities = pageIdentities;
            this.pageRelations = pageRelations;

            this.reRenderTree();
        });

        this.treeControl.expansionModel.changed.subscribe((changed) => {
            // page is expanded
            changed.added
                .map(selectedPageTreeNode => selectedPageTreeNode.id)
                .forEach((selectedPageId) => {
                    this.pageRepositoryService.loadTreePageChildren(selectedPageId);
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
            this.pageRelations,
            this.pageIdentities,
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
