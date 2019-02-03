import {MediaMatcher} from '@angular/cdk/layout';
import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {PageService} from '../../../../features/page/page.service';

@Component({
    selector: 'app-page-base-view-container',
    templateUrl: './page-base-view-container.component.html',
    styleUrls: ['./page-base-view-container.component.scss']
})
export class PageBaseViewContainerComponent implements OnInit, OnDestroy {
    mobileQuery: MediaQueryList;

    private _mobileQueryListener: () => void;

    constructor(changeDetectorRef: ChangeDetectorRef, media: MediaMatcher,
                private pageService: PageService) {
        this.mobileQuery = media.matchMedia('(max-width: 600px)');
        this._mobileQueryListener = () => changeDetectorRef.detectChanges();
        this.mobileQuery.addListener(this._mobileQueryListener);
    }

    ngOnInit() {
    }

    ngOnDestroy(): void {
        this.mobileQuery.removeListener(this._mobileQueryListener);
    }

    addPage() {
        this.pageService.createPage();
    }
}
