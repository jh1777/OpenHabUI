import { Component, OnInit, Input } from '@angular/core';
import { OpenhabItem } from 'src/app/services/model/openhabItem';
import { OpenhabApiService } from 'src/app/services/openhab-api.service';
import { CategoryType } from 'src/app/models/config/category';
import { EventbusService } from 'src/app/services/eventbus.service';
import { ItemStateChangedEvent } from 'src/app/services/model/itemStateChangedEvent';

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
  showModal: boolean = false;
  categoryType = CategoryType;
  stateHistory: ItemStateChangedEvent[] = [];
  
  constructor(private service: OpenhabApiService, private eventService: EventbusService) { }

  ngOnInit(): void {

  }

  switchWallPlug(event: MouseEvent, item: OpenhabItem) {
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

   // For Details button
   openModal($event: MouseEvent, item: OpenhabItem) {
    $event.preventDefault();
    this.item = item;

    // Getting History from Openhab API
    this.service.getItemHistory(item.name).subscribe(history => {
      console.log(history.name+": Hitory entries found = "+history.data.length);
    });

    // --> TO be replaced:
    this.stateHistory = [];
    if (this.eventService.itemchangedHistory.has(item.name)) {
      this.eventService.itemchangedHistory.get(item.name).subscribe({
        next: (v) =>  this.stateHistory.push(v)
      });
    }
    // <---

    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.item = null;
  }
}