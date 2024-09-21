import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateControllerComponent } from './create-controller.component';

describe('CreateControllerComponent', () => {
  let component: CreateControllerComponent;
  let fixture: ComponentFixture<CreateControllerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateControllerComponent]
    });
    fixture = TestBed.createComponent(CreateControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
