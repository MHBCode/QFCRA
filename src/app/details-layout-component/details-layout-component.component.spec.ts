import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsLayoutComponent } from './details-layout-component.component';

describe('DetailsLayoutComponent', () => {
  let component: DetailsLayoutComponent;
  let fixture: ComponentFixture<DetailsLayoutComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DetailsLayoutComponent]
    });
    fixture = TestBed.createComponent(DetailsLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
