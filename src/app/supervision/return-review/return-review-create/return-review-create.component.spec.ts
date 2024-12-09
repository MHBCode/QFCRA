import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnReviewCreateComponent } from './return-review-create.component';

describe('ReturnReviewCreateComponent', () => {
  let component: ReturnReviewCreateComponent;
  let fixture: ComponentFixture<ReturnReviewCreateComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReturnReviewCreateComponent]
    });
    fixture = TestBed.createComponent(ReturnReviewCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
