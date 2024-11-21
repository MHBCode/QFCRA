import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoticesDetailsComponent } from './notices-details.component';

describe('NoticesDetailsComponent', () => {
  let component: NoticesDetailsComponent;
  let fixture: ComponentFixture<NoticesDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NoticesDetailsComponent]
    });
    fixture = TestBed.createComponent(NoticesDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
