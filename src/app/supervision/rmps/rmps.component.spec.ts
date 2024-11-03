import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RmpsComponent } from './rmps.component';

describe('RmpsComponent', () => {
  let component: RmpsComponent;
  let fixture: ComponentFixture<RmpsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RmpsComponent]
    });
    fixture = TestBed.createComponent(RmpsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
