import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalViewDetailsComponent } from './journal-view-details.component';

describe('JournalViewDetailsComponent', () => {
  let component: JournalViewDetailsComponent;
  let fixture: ComponentFixture<JournalViewDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JournalViewDetailsComponent]
    });
    fixture = TestBed.createComponent(JournalViewDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
