import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageBaseViewContainerComponent } from './page-base-view-container.component';

describe('PageBaseViewContainerComponent', () => {
  let component: PageBaseViewContainerComponent;
  let fixture: ComponentFixture<PageBaseViewContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageBaseViewContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageBaseViewContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
