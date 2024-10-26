import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirmsDetailsComponent } from './firms-details.component';

describe('FirmsDetailsComponent', () => {
  let component: FirmsDetailsComponent;
  let fixture: ComponentFixture<FirmsDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FirmsDetailsComponent]
    });
    fixture = TestBed.createComponent(FirmsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
