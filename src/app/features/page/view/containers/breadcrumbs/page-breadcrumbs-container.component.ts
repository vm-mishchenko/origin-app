import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {filter, switchMap} from 'rxjs/internal/operators';
import {PageViewQuery} from '../../state/page-view.query';
import {PageRepositoryService} from '../../../repository';

interface IBreadcrumbItem {
    pageId: string;
    pageTitle: string;
}

@Component({
    selector: 'app-page-breadcrumbs-container',
    templateUrl: './page-breadcrumbs-container.component.html',
    styleUrls: ['./page-breadcrumbs-container.component.scss']
})
export class PageBreadcrumbsContainerComponent implements OnInit {
    breadcrumbs$: Observable<IBreadcrumbItem[]>;

    constructor(private pageViewQuery: PageViewQuery,
                private pageRepositoryService: PageRepositoryService) {
    }

    ngOnInit() {
        this.breadcrumbs$ = this.pageViewQuery.selectedPageId$.pipe(
            filter((selectedPageId) => Boolean(selectedPageId)),
            switchMap((selectedPageId) => {
                return this.buildBreadcrumbItem(selectedPageId);
            })
        );
    }

    private buildBreadcrumbItem(pageId: string, result = []): Promise<IBreadcrumbItem[]> {
        return Promise.all([
            this.pageRepositoryService.getIdentityPage(pageId),
            this.pageRepositoryService.getRelationPage(pageId)
        ]).then(([pageIdentity, pageRelation]) => {
            const breadcrumbItem: IBreadcrumbItem = {
                pageId: pageIdentity.id,
                pageTitle: pageIdentity.title
            };

            result.unshift(breadcrumbItem);

            if (pageRelation.parentPageId) {
                return this.buildBreadcrumbItem(pageRelation.parentPageId, result);
            }

            return result;
        });
    }
}
