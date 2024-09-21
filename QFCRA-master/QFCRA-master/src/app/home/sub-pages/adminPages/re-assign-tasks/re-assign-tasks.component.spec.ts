import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReAssignTasksComponent } from './re-assign-tasks.component';

describe('ReAssignTasksComponent', () => {
  let component: ReAssignTasksComponent;
  let fixture: ComponentFixture<ReAssignTasksComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReAssignTasksComponent]
    });
    fixture = TestBed.createComponent(ReAssignTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
