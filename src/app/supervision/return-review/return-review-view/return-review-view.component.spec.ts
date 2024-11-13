import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnReviewViewComponent } from './return-review-view.component';

describe('ReturnReviewViewComponent', () => {
  let component: ReturnReviewViewComponent;
  let fixture: ComponentFixture<ReturnReviewViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReturnReviewViewComponent]
    });
    fixture = TestBed.createComponent(ReturnReviewViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
