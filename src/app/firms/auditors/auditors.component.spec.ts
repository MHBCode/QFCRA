import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditorsComponent } from './auditors.component';

describe('AuditorsComponent', () => {
  let component: AuditorsComponent;
  let fixture: ComponentFixture<AuditorsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AuditorsComponent]
    });
    fixture = TestBed.createComponent(AuditorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
