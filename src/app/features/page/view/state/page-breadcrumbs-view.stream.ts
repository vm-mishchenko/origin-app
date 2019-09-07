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
              this.pageRepositoryService2.pageIdentities(),
              this.pageRepositoryService2.pageRelations(),
            ).pipe(
                map(([pageIdentity, pageRelation]) => this.buildBreadcrumbItem(selectedPageId, pageIdentity, pageRelation))
            );
        })
    );

    constructor(private pageViewQuery: PageViewQuery,
                private pageRepositoryService2: PageRepositoryService2) {
    }

    private buildBreadcrumbItem(pageId: string, pageIdentities, pageRelations, result = []): IBreadcrumbItem[] {
        const pageIdentity = pageIdentities[pageId];
        const pageRelation = pageRelations[pageId];

        if (pageIdentity) {
            const breadcrumbItem: IBreadcrumbItem = {
                pageId: pageIdentity.id,
                pageTitle: pageIdentity.title
            };

            result.unshift(breadcrumbItem);
        }

        if (pageRelation && pageRelation.parentPageId) {
            return this.buildBreadcrumbItem(pageRelation.parentPageId, pageIdentities, pageRelations, result);
        }

        return result;
    }
}
