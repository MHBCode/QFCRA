import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShadowSupervisorComponent } from './shadow-supervisor.component';

describe('ShadowSupervisorComponent', () => {
  let component: ShadowSupervisorComponent;
  let fixture: ComponentFixture<ShadowSupervisorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShadowSupervisorComponent]
    });
    fixture = TestBed.createComponent(ShadowSupervisorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
