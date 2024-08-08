import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateNoticesComponent } from './create-notices.component';

describe('CreateNoticesComponent', () => {
  let component: CreateNoticesComponent;
  let fixture: ComponentFixture<CreateNoticesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateNoticesComponent]
    });
    fixture = TestBed.createComponent(CreateNoticesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
