import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {PageTreeFlatContainerComponent} from './page-tree-flat-container.component';

describe('PageTreeFlatContainerComponent', () => {
    let component: PageTreeFlatContainerComponent;
    let fixture: ComponentFixture<PageTreeFlatContainerComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [PageTreeFlatContainerComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PageTreeFlatContainerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
