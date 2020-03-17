import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemiconComponent } from './itemicon.component';

describe('ItemiconComponent', () => {
  let component: ItemiconComponent;
  let fixture: ComponentFixture<ItemiconComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemiconComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemiconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
