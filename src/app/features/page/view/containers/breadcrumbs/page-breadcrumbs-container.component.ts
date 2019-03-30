import {Component} from '@angular/core';
import {PageBreadcrumbStream} from '../../state/page-breadcrumbs-view.stream';

@Component({
    selector: 'app-page-breadcrumbs-container',
    templateUrl: './page-breadcrumbs-container.component.html',
    styleUrls: ['./page-breadcrumbs-container.component.scss']
})
export class PageBreadcrumbsContainerComponent {
    constructor(public pageBreadcrumbStream: PageBreadcrumbStream) {
    }
}
