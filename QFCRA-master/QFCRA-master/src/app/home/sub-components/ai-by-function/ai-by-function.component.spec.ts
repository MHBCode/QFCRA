import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AIByFunctionComponent } from './ai-by-function.component';

describe('AIByFunctionComponent', () => {
  let component: AIByFunctionComponent;
  let fixture: ComponentFixture<AIByFunctionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AIByFunctionComponent]
    });
    fixture = TestBed.createComponent(AIByFunctionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
