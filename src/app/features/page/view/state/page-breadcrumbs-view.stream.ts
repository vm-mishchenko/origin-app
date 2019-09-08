import {Injectable} from '@angular/core';
import {combineLatest, Observable} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {PageRepositoryService2} from '../../repository/page-repository.service2';
import {PageViewQuery} from './page-view.query';

export interface IBreadcrumbItem {
    pageId: string;
    pageTitle: string;
}

@Injectable()
export class PageBreadcrumbStream {
    breadcrumbs$: Observable<IBreadcrumbItem[]> = this.pageViewQuery.selectedPageId$.pipe(
        switchMap((selectedPageId) => {
            return combineLatest(
              this.pageRepositoryService2.selectPageIdentities(),
              this.pageRepositoryService2.selectPageRelations(),
            ).pipe(
                map(([pageIdentity, pageRelation]) => this.buildBreadcrumbItem(selectedPageId, pageIdentity, pageRelation))
            );
        })
    );

    constructor(private pageViewQuery: PageViewQuery,
                private pageRepositoryService2: PageRepositoryService2) {
    }

    private buildBreadcrumbItem(pageId: string, pageIdentitiesSnapshot, pageRelationsSnapshot, result = []): IBreadcrumbItem[] {
        const pageIdentitySnapshot = pageIdentitiesSnapshot.getDocWithId(pageId);
        const pageRelationSnapshot = pageRelationsSnapshot.getDocWithId(pageId);

        if (pageIdentitySnapshot) {
            const breadcrumbItem: IBreadcrumbItem = {
                pageId: pageIdentitySnapshot.id,
                pageTitle: pageIdentitySnapshot.data().title
            };

            result.unshift(breadcrumbItem);
        }

        if (pageRelationSnapshot && pageRelationSnapshot.data().parentPageId) {
            return this.buildBreadcrumbItem(
              pageRelationSnapshot.data().parentPageId,
              pageIdentitiesSnapshot,
              pageRelationsSnapshot,
              result
            );
        }

        return result;
    }
}
