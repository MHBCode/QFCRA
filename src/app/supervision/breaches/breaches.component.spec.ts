import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BreachesComponent } from './breaches.component';

describe('BreachesComponent', () => {
  let component: BreachesComponent;
  let fixture: ComponentFixture<BreachesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BreachesComponent]
    });
    fixture = TestBed.createComponent(BreachesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
