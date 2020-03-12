import { Component, OnInit, Input, NgZone, SimpleChanges } from '@angular/core';
import { OpenhabItem } from 'src/app/services/model/openhabItem';
import { Group } from 'src/app/models/config/group';
import { AppComponent } from 'src/app/app.component';
import { OpenhabApiService } from 'src/app/services/openhab-api.service';

@Component({
  selector: 'app-roombox',
  templateUrl: './roombox.component.html',
  styleUrls: ['./roombox2.component.css']
})
export class RoomboxComponent implements OnInit {
  @Input() shape: string;
  @Input() data: OpenhabItem[];
  @Input() groupName: string;
  @Input() simple: boolean;
  @Input() categoriesByRoom: Map<string, string[]>;

  dataTypes: Group[] = AppComponent.configuration.groups;
  batteryWarning: boolean = false;

  constructor(private service: OpenhabApiService) {

  }

  ngOnInit(): void {
  
  }

  switchWallPlug(event: MouseEvent, item: OpenhabItem) {
    let newState = item.state == "ON" ? "OFF" : "ON";
    this.service.setItemState(item, newState)
      .subscribe(event => {
        console.log(`Setting new state = ${newState} on item ${item.name}. Result Code: ${event.statusText}`);
    });
  }
}