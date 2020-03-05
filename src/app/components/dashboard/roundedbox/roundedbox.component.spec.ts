import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundedboxComponent } from './roundedbox.component';

describe('RoundedboxComponent', () => {
  let component: RoundedboxComponent;
  let fixture: ComponentFixture<RoundedboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoundedboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoundedboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
