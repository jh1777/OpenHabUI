import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomboxComponent } from './roombox.component';

describe('HeaderboxComponent', () => {
  let component: RoomboxComponent;
  let fixture: ComponentFixture<RoomboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoomboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
