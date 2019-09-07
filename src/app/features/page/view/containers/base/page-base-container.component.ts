import {Component, OnDestroy, OnInit} from '@angular/core';

@Component({
    selector: 'app-page-base-view-container',
    templateUrl: './page-base-container.component.html',
    styleUrls: ['./page-base-container.component.scss']
})
export class PageBaseContainerComponent implements OnInit, OnDestroy {
    ngOnInit() {
    }

    ngOnDestroy(): void {
    }
}
