import {HashMap} from '@datorama/akita';
import {IIdentityPage, IRelationPage} from '../../../repository/page.types';
import {IPageTreeNode} from './page-tree-flat.types';

const INITIAL_PAGE_LEVEL = 0;

export class PageTreeFlat {
    constructor(
        private pageRelations: HashMap<IRelationPage>,
        private pageIdentities: HashMap<IIdentityPage>,
        private selectedIds: string[]
    ) {
    }

    build(): IPageTreeNode[] {
        const rootPageIds = this.getRootPageIds();
        const flatPageTreeNodes = this.buildPageTreeNodes(this.getRootPageIds(), INITIAL_PAGE_LEVEL);

        this.filterSelectedPageTreeNodeIds(rootPageIds)
            .forEach((pageId) => {
                this.buildPageChildrenNodes(this.getPageChildrenIds(pageId), pageId, flatPageTreeNodes);
            });

        return flatPageTreeNodes;
    }

    private buildPageTreeNodes(pageIds: string[], level: number): IPageTreeNode[] {
        return pageIds.map((pageId) => this.buildPageTreeNode(pageId, level));
    }

    private buildPageTreeNode(pageId: string, level: number): IPageTreeNode {
        const pageIdentity = this.pageIdentities[pageId];
        const pageRelation = this.pageRelations[pageId];

        return {
            id: pageIdentity.id,
            title: pageIdentity.title,
            level: level,
            expandable: Boolean(pageRelation.childrenPageId.length)
        };
    }

    private buildPageChildrenNodes(pageIds: string[], parentPageId: string, result: IPageTreeNode[] = []): IPageTreeNode[] {
        const parentPageNodeIndex = result.findIndex((pageTreeNode) => pageTreeNode.id === parentPageId);
        const parentLevel = result[parentPageNodeIndex].level;
        const pageTreeNodes = this.buildPageTreeNodes(pageIds, parentLevel + 1);

        result.splice(parentPageNodeIndex + 1, 0, ...pageTreeNodes);

        this.filterSelectedPageTreeNodeIds(pageIds)
            .forEach((pageId) => {
                this.buildPageChildrenNodes(this.getPageChildrenIds(pageId), pageId, result);
            });

        return result;
    }

    private filterSelectedPageTreeNodeIds(pageIds: string[]): string[] {
        return pageIds
            .filter((pageId) => Boolean(this.selectedIds.includes(pageId)));
    }

    private getPageChildrenIds(parentPageId: string): string[] {
        return this.pageRelations[parentPageId].childrenPageId
            .filter((childPageId) => {
                return this.pageIdentities[childPageId] && this.pageRelations[childPageId];
            });
    }

    private getRootPageIds(): string[] {
        return Object.values(this.pageRelations)
            .filter((pageRelation) => !Boolean(pageRelation.parentPageId))
            .filter((pageRelation) => Boolean(this.pageIdentities[pageRelation.id]))
            .map((pageRelation) => pageRelation.id);
    }
}
