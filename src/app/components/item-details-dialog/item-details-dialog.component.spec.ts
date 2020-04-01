import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemDetailsDialogComponent } from './item-details-dialog.component';

describe('ItemDetailsDialogComponent', () => {
  let component: ItemDetailsDialogComponent;
  let fixture: ComponentFixture<ItemDetailsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemDetailsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
