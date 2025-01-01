import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BreachesDetailsComponent } from './breaches-details.component';

describe('BreachesDetailsComponent', () => {
  let component: BreachesDetailsComponent;
  let fixture: ComponentFixture<BreachesDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BreachesDetailsComponent]
    });
    fixture = TestBed.createComponent(BreachesDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
