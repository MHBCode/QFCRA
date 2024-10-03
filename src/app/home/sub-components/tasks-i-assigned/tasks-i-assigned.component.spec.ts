import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TasksIAssignedComponent } from './tasks-i-assigned.component';

describe('TasksIAssignedComponent', () => {
  let component: TasksIAssignedComponent;
  let fixture: ComponentFixture<TasksIAssignedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TasksIAssignedComponent]
    });
    fixture = TestBed.createComponent(TasksIAssignedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
