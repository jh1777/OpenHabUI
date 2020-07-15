import { Component, OnInit, Input, ViewChild, AfterViewInit } from '@angular/core';
import { OpenhabItem } from 'src/app/services/model/openhabItem';
import { OpenhabApiService } from 'src/app/services/openhab-api.service';
import { CategoryType } from 'src/app/models/config/category';
import { OpenhabItemHistory } from 'src/app/services/model/openhabItemHistory';
import { ConfigService } from 'src/app/services/config.service';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.css']
})
export class TileComponent implements OnInit {
  @Input() tileName: string;
  @Input() items: OpenhabItem[];
  @Input() hasWarningItem: boolean;
  @Input() hasCriticalItem: boolean = false;
  
  // UI needed
  item: OpenhabItem;
  showItemDetails: boolean = false;
  categoryType = CategoryType;
  stateHistory: OpenhabItemHistory;
  
  constructor(
    private service: OpenhabApiService, 
    private configService: ConfigService,
    private appComponent: AppComponent) { }

  ngOnInit(): void {

  }

  switchAction(event: MouseEvent, item: OpenhabItem) {
    let newState = item.state == "ON" ? "OFF" : "ON";
    this.service.setItemState(item, newState)
      .subscribe(event => {
        console.log(`Setting new state = ${newState} on item ${item.name}. Result Code: ${event.statusText}`);
    });
  }

  setDimmer(event: MouseEvent, item: OpenhabItem, value: number) {
    let newState = Number.parseInt(item.state) == value ? 0 : value;
    this.service.setItemState(item, newState.toString())
      .subscribe(event => {
        console.log(`Setting new state = ${newState} on item ${item.name}. Result Code: ${event.statusText}`);
    });
  }

  editConfig($event: MouseEvent, tileName: string) {
    let tile = this.configService.getTileWithName(tileName);
    if (tile != null) {
      this.appComponent.tileConfigDialog.openDialog(tile);
    }
  }

   // For Details button
   openModal($event: MouseEvent, item: OpenhabItem) {
    $event.preventDefault();
    this.item = item;

    // Getting History from Openhab API
    this.service.getItemHistory(item.name, ConfigService.configuration.itemStateHistory).subscribe(history => {
      this.stateHistory = history;
    });

    // --> ReplaySubject : is replaced:
    /*
    this.stateHistory = [];
    if (this.eventService.itemchangedHistory.has(item.name)) {
      this.eventService.itemchangedHistory.get(item.name).subscribe({
        next: (v) =>  this.stateHistory.push(v)
      });
    }
    */
    // <---

    this.showItemDetails = true;
  }

  closeModal() {
    this.showItemDetails = false;
    this.item = null;
  }
}