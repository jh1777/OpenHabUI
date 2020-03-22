import { Component, OnInit, Input } from '@angular/core';
import { OpenhabItem } from 'src/app/services/model/openhabItem';
import { SummaryEntry } from './summaryEntry';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent implements OnInit {

  @Input() summaryItems: Map<string, SummaryEntry>;
  @Input() categories: string[];
  
  constructor() { }
  ngOnInit(): void {}
}
