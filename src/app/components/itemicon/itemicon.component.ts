import { Component, OnInit, Input } from '@angular/core';
import { OpenhabItem } from 'src/app/services/model/openhabItem';
import { CategoryType } from 'src/app/models/config/category';

@Component({
  selector: 'app-itemicon',
  templateUrl: './itemicon.component.html',
  styleUrls: ['./itemicon.component.css']
})
export class ItemiconComponent implements OnInit {

  @Input() item: OpenhabItem;
  @Input() iconSize = "36";
  @Input() isDisabled = false;
  @Input() hasWarning = false;
  @Input() isCritical = false;

  categoryType = CategoryType;

  constructor() { }

  ngOnInit(): void {
  }
}