import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreDetailsComponent } from './core-details.component';

describe('CoreDetailsComponent', () => {
  let component: CoreDetailsComponent;
  let fixture: ComponentFixture<CoreDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CoreDetailsComponent]
    });
    fixture = TestBed.createComponent(CoreDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
