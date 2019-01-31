import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageEditorViewContainerComponent } from './page-editor-view-container.component';

describe('PageEditorViewContainerComponent', () => {
  let component: PageEditorViewContainerComponent;
  let fixture: ComponentFixture<PageEditorViewContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageEditorViewContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageEditorViewContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
