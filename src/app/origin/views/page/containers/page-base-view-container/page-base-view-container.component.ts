import {MediaMatcher} from '@angular/cdk/layout';
import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatSidenav} from '@angular/material';
import {Subscription} from 'rxjs';
import {NavigationService} from '../../../../../features/navigation';
import {PageRepositoryService, PageService} from '../../../../../features/page';
import {PageViewQuery} from '../../state/page-view.query';
import {PageViewStore} from '../../state/page-view.store';

@Component({
    selector: 'app-page-base-view-container',
    templateUrl: './page-base-view-container.component.html',
    styleUrls: ['./page-base-view-container.component.scss']
})
export class PageBaseViewContainerComponent implements OnInit, OnDestroy {
    mobileQuery: MediaQueryList;
    private _mobileQueryListener: () => void;
    private subscriptions: Subscription[] = [];

    @ViewChild('sidenav') private sidenav: MatSidenav;

    constructor(changeDetectorRef: ChangeDetectorRef,
                media: MediaMatcher,
                private pageService: PageService,
                private pageRepositoryService: PageRepositoryService,
                private navigationService: NavigationService,
                private pageViewStore: PageViewStore,
                private pageViewQuery: PageViewQuery) {
        this.mobileQuery = media.matchMedia('(max-width: 600px)');
        this._mobileQueryListener = () => changeDetectorRef.detectChanges();
        this.mobileQuery.addListener(this._mobileQueryListener);
    }

    ngOnInit() {
        this.pageRepositoryService.loadRootPages();

        if (this.mobileQuery.matches) {
            this.pageViewStore.closeMenu();
        }

        this.subscriptions.push(
            this.pageViewQuery.isMenuOpen$.subscribe((isMenuOpen) => {
                if (isMenuOpen) {
                    this.sidenav.open();
                } else {
                    this.sidenav.close();
                }
            })
        );

        this.subscriptions.push(
            this.sidenav.openedChange.subscribe((value) => {
                if (value) {
                    this.pageViewStore.openMenu();
                } else {
                    this.pageViewStore.closeMenu();
                }
            })
        );
    }

    ngOnDestroy(): void {
        this.mobileQuery.removeListener(this._mobileQueryListener);

        this.subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });
    }

    addPage() {
        this.pageService.createPage().then((newPageId) => {
            this.navigationService.toPage(newPageId);
        });
    }

    toggleMenu() {
        this.pageViewStore.toggleMenu();
    }
}
