import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataPlaceComponent } from './data-place.component';

describe('DataPlaceComponent', () => {
  let component: DataPlaceComponent;
  let fixture: ComponentFixture<DataPlaceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DataPlaceComponent]
    });
    fixture = TestBed.createComponent(DataPlaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
