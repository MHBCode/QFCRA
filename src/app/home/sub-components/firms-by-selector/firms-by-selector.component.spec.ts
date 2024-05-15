import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirmsBySelectorComponent } from './firms-by-selector.component';

describe('FirmsBySelectorComponent', () => {
  let component: FirmsBySelectorComponent;
  let fixture: ComponentFixture<FirmsBySelectorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FirmsBySelectorComponent]
    });
    fixture = TestBed.createComponent(FirmsBySelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
