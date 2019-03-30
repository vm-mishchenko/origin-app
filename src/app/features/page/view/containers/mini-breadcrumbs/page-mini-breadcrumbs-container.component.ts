import {Component, OnInit} from '@angular/core';
import {PageBreadcrumbStream} from '../../state/page-breadcrumbs-view.stream';
import {map} from 'rxjs/operators';

@Component({
    selector: 'app-page-mini-breadcrumbs-container',
    templateUrl: './page-mini-breadcrumbs-container.component.html',
    styleUrls: ['./page-mini-breadcrumbs-container.component.scss']
})
export class PageMiniBreadcrumbsContainerComponent implements OnInit {
    lastBreadcrumb$ = this.pageBreadcrumbStream.breadcrumbs$.pipe(
        map((breadcrumbs) => breadcrumbs[breadcrumbs.length - 1])
    );

    penultBreadcrumb$ = this.pageBreadcrumbStream.breadcrumbs$.pipe(
        map((breadcrumbs) => breadcrumbs[breadcrumbs.length - 2])
    );

    constructor(public pageBreadcrumbStream: PageBreadcrumbStream) {
    }

    ngOnInit() {
    }
}
