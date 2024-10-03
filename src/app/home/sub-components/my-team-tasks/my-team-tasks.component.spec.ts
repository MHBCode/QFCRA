import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTeamTasksComponent } from './my-team-tasks.component';

describe('MyTeamTasksComponent', () => {
  let component: MyTeamTasksComponent;
  let fixture: ComponentFixture<MyTeamTasksComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MyTeamTasksComponent]
    });
    fixture = TestBed.createComponent(MyTeamTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
