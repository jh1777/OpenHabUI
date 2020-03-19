import { Component, OnInit, Input } from '@angular/core';
import { OpenhabItem } from 'src/app/services/model/openhabItem';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent implements OnInit {

  @Input() summaryItems: Map<string, OpenhabItem[]>; // Key is category name
  @Input() summary: Map<string, string>;

  constructor() { }

  ngOnInit(): void {
    
  }
}
