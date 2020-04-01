import { Component, OnInit, Input } from '@angular/core';
import { OpenhabItem } from 'src/app/services/model/openhabItem';
import { SummaryEntry } from './summaryEntry';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent implements OnInit {

  @Input() summaryItems: Map<string, SummaryEntry[]>;
  @Input() categories: string[];

  dialogEntry: SummaryEntry;
  showModal: boolean;
  
  constructor() { }
  ngOnInit(): void {}

  openModal($event: MouseEvent, entry: SummaryEntry) {
    $event.preventDefault();
    this.dialogEntry = entry;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.dialogEntry = null;
  }
}
