import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndividualListComponent } from './individual-list.component';

describe('IndividualListComponent', () => {
  let component: IndividualListComponent;
  let fixture: ComponentFixture<IndividualListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IndividualListComponent]
    });
    fixture = TestBed.createComponent(IndividualListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
