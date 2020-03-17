import { Component, OnInit, Input } from '@angular/core';
import { OpenhabItem } from 'src/app/services/model/openhabItem';
import { OpenhabApiService } from 'src/app/services/openhab-api.service';
import { CategoryType } from 'src/app/models/config/category';

@Component({
  selector: 'app-tile',
  templateUrl: './tile.component.html',
  styleUrls: ['./tile.component.css']
})
export class TileComponent implements OnInit {
  @Input() tileName: string;
  @Input() items: OpenhabItem[];
  @Input() hasWarningItem: boolean;
  categoryType = CategoryType;
  
  constructor(private service: OpenhabApiService) { }

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
}