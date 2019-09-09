import {QuerySnapshot} from 'cinatabase';
import {IPageIdentity, IPageRelation} from '../../../repository/interfaces';
import {IPageTreeNode} from './page-tree-flat.types';

const INITIAL_PAGE_LEVEL = 0;

export class PageTreeFlat {
    constructor(
      private pageRelations: QuerySnapshot<IPageRelation>,
      private pageIdentities: QuerySnapshot<IPageIdentity>,
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
        const pageIdentitySnapshot = this.pageIdentities.getDocWithId(pageId);
        const pageRelationSnapshot = this.pageRelations.getDocWithId(pageId);

        return {
            id: pageIdentitySnapshot.id,
            title: pageIdentitySnapshot.data().title,
            level: level,
            expandable: Boolean(pageRelationSnapshot.data().childrenPageId.length)
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
        return this.pageRelations.getDocWithId(parentPageId).data().childrenPageId.filter((childPageId) => {
            return this.pageIdentities.hasDocWithId(childPageId) && this.pageRelations.hasDocWithId(childPageId);
        });
    }

    private getRootPageIds(): string[] {
        return this.pageRelations.data()
          .filter((pageRelationDocSnapshot) => {
              return !Boolean(pageRelationDocSnapshot.data().parentPageId);
          })
          .filter((pageRelationDocSnapshot) => {
              return this.pageIdentities.hasDocWithId(pageRelationDocSnapshot.id);
          })
          .map((pageRelationDocSnapshot) => pageRelationDocSnapshot.id);
    }
}
