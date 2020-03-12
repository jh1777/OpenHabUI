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
  @Input() categoriesByRoom: Map<string, string[]>;

  dataTypes: Group[] = AppComponent.configuration.groups;
  //categories: string[];
  batteryWarning: boolean = false;

  constructor(private service: OpenhabApiService) {

  }

  ngOnInit(): void {
  
  }


/* 

  ngOnChanges(changes: SimpleChanges) {
    if (this.data) {
      // TODO: do this again here or somewhere else:

      // check battery
      this.data.filter(i => i.category == "battery").forEach(item => {
        var threshold = this.dataTypes.filter(t => t.category == "battery" && item.groupNames.includes(t.name))[0].warningThreshold;
        if (!threshold) {
          threshold = 0;
        }
        if (Number.parseInt(item.state) < threshold) {
          this.batteryWarning = true;
        }
      });

      
    }
  }
*/

  switchWallPlug(event: MouseEvent, item: OpenhabItem) {
    let newState = item.state == "ON" ? "OFF" : "ON";
    this.service.setItemState(item, newState)
      .subscribe(event => {
        console.log(`Setting new state = ${newState} on item ${item.name}. Result Code: ${event.statusText}`);
    });
  }
}