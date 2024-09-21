import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndividualPendingAiAppsComponent } from './individual-pending-ai-apps.component';

describe('IndividualPendingAiAppsComponent', () => {
  let component: IndividualPendingAiAppsComponent;
  let fixture: ComponentFixture<IndividualPendingAiAppsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IndividualPendingAiAppsComponent]
    });
    fixture = TestBed.createComponent(IndividualPendingAiAppsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
