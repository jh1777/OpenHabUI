import { Component, OnInit, Input } from '@angular/core';
import { OpenhabItem } from 'src/app/services/model/openhabItem';
import { CategoryType } from 'src/app/models/config/category';
import { OpenhabItemHistory } from 'src/app/services/model/openhabItemHistory';

@Component({
  selector: 'app-item-details-dialog',
  templateUrl: './item-details-dialog.component.html',
  styleUrls: ['./item-details-dialog.component.css']
})
export class ItemDetailsDialogComponent implements OnInit {

  @Input() item: OpenhabItem;
  @Input() stateHistory: OpenhabItemHistory;
  categoryType = CategoryType;

  constructor() { }

  ngOnInit(): void {}  
}
