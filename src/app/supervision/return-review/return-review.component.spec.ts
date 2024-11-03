import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnReviewComponent } from './return-review.component';

describe('ReturnReviewComponent', () => {
  let component: ReturnReviewComponent;
  let fixture: ComponentFixture<ReturnReviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReturnReviewComponent]
    });
    fixture = TestBed.createComponent(ReturnReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
