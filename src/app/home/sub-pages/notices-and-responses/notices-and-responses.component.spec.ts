import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoticesAndResponsesComponent } from './notices-and-responses.component';

describe('NoticesAndResponsesComponent', () => {
  let component: NoticesAndResponsesComponent;
  let fixture: ComponentFixture<NoticesAndResponsesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NoticesAndResponsesComponent]
    });
    fixture = TestBed.createComponent(NoticesAndResponsesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
