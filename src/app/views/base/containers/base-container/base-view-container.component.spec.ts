import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseViewContainerComponent } from './base-view-container.component';

describe('BaseViewContainerComponent', () => {
  let component: BaseViewContainerComponent;
  let fixture: ComponentFixture<BaseViewContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BaseViewContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseViewContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
