import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TileConfigComponent } from './tile-config.component';

describe('TileConfigComponent', () => {
  let component: TileConfigComponent;
  let fixture: ComponentFixture<TileConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TileConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TileConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
