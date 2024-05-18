import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirmsPageComponent } from './firms-page.component';

describe('FirmsPageComponent', () => {
  let component: FirmsPageComponent;
  let fixture: ComponentFixture<FirmsPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FirmsPageComponent]
    });
    fixture = TestBed.createComponent(FirmsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
