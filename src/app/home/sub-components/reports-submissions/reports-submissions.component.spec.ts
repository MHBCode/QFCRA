import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsSubmissionsComponent } from './reports-submissions.component';

describe('ReportsSubmissionsComponent', () => {
  let component: ReportsSubmissionsComponent;
  let fixture: ComponentFixture<ReportsSubmissionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReportsSubmissionsComponent]
    });
    fixture = TestBed.createComponent(ReportsSubmissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
