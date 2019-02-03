import {FlatTreeControl} from '@angular/cdk/tree';
import {Component} from '@angular/core';
import {HashMap} from '@datorama/akita';
import {combineLatest} from 'rxjs';
import {PageService} from '../../../page/page.service';
import {IIdentityPage, IRelationPage} from '../../../page/page.types';
import {PageTreeFlatDataSource} from './page-tree-flat-data-source.class';
import {PageTreeFlatSelection} from './page-tree-flat-selection.class';
import {PageTreeFlat} from './page-tree-flat.class';
import {IPageTreeNode} from './page-tree-flat.types';

@Component({
    selector: 'app-page-tree-flat-container',
    templateUrl: './page-tree-flat-container.component.html',
    styleUrls: ['./page-tree-flat-container.component.scss']
})
export class PageTreeFlatContainerComponent {
    private pageRelations: HashMap<IRelationPage>;
    private pageIdentities: HashMap<IIdentityPage>;

    pageTreeFlatSelection: PageTreeFlatSelection = new PageTreeFlatSelection(this.pageRelations);

    treeControl: FlatTreeControl<IPageTreeNode>;

    dataSource: PageTreeFlatDataSource = new PageTreeFlatDataSource();

    getLevel = (node: IPageTreeNode) => node.level;

    isExpandable = (node: IPageTreeNode) => node.expandable;

    hasChild = (_: number, _nodeData: IPageTreeNode) => _nodeData.expandable;

    constructor(private pageService: PageService) {
        this.treeControl = new FlatTreeControl<IPageTreeNode>(this.getLevel, this.isExpandable);

        // todo: unsubscribe after
        combineLatest(
            this.pageService.pageIdentity$,
            this.pageService.pageRelation$
        ).subscribe(([pageIdentities, pageRelations]) => {
            this.pageIdentities = pageIdentities;
            this.pageRelations = pageRelations;

            this.pageTreeFlatSelection.updatePageRelations(this.pageRelations);
            this.reRenderTree();
        });

        this.treeControl.expansionModel.changed.subscribe((changed) => {
            changed.added
                .map(selectedPageTreeNode => selectedPageTreeNode.id)
                .forEach((selectedPageId) => {
                    this.pageService.loadTreePageChildren(selectedPageId);
                    this.pageTreeFlatSelection.addSelectedPageId(selectedPageId);
                });

            changed.removed
                .map((removedItem) => removedItem.id)
                .forEach(removedPageId => {
                    this.pageTreeFlatSelection.removeSelectedPageId(removedPageId);
                });

            this.reRenderTree();
        });
    }

    removePage(id: string) {
        this.pageTreeFlatSelection.removeSelectedPageId(id);
        this.pageService.removePage(id);
    }

    reRenderTree() {
        this.dataSource.data = new PageTreeFlat(
            this.pageRelations,
            this.pageIdentities,
            this.pageTreeFlatSelection.selectedIds
        ).build();
    }

    trackByFn(i, node) {
        return node.id;
    }
}
