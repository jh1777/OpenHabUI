import { Component, OnInit, Input } from '@angular/core';
import { OpenhabItem } from 'src/app/services/model/openhabItem';
import { Group } from 'src/app/models/config/group';
import { AppComponent } from 'src/app/app.component';
import { OpenhabApiService } from 'src/app/services/openhab-api.service';
import { CategoryType } from 'src/app/models/config/category';

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

  //dataTypes: Group[] = AppComponent.configuration.groups;
  warningCategories: string[] = []; // names of item categores (because of the icon!) which are in warning state!

  constructor(private service: OpenhabApiService) {

  }
  
  ngOnChanges() {
    this.warningCategories = this.data?.filter(i => i.hasWarning == true).map(i => CategoryType[i.category]);
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