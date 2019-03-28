import {Component, OnInit} from '@angular/core';
import {combineLatest, Observable} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
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
            switchMap((selectedPageId) => {
                return combineLatest(
                    this.pageRepositoryService.pageIdentity$,
                    this.pageRepositoryService.pageRelation$,
                ).pipe(
                    map(([pageIdentity, pageRelation]) => this.buildBreadcrumbItem(selectedPageId, pageIdentity, pageRelation))
                );
            })
        );
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
