import { Component, OnInit, Input } from '@angular/core';
import { Tile } from 'src/app/models/config/tile';
import { AppComponent } from 'src/app/app.component';
import { Item } from 'src/app/models/config/item';

@Component({
  selector: 'app-tile-config',
  templateUrl: './tile-config.component.html',
  styleUrls: ['./tile-config.component.css']
})
export class TileConfigComponent implements OnInit {

  @Input() tileName: string;

  tile: Tile;
  selectedItem: Item;
  
  constructor() { }

  ngOnInit(): void {
    var tiles = AppComponent.configuration.dashboardTiles.filter(t => t.title == this.tileName);
    if (tiles.some) {
      this.tile = tiles[0];
    }
  }

  selectItem(item: Item) {
    this.selectedItem = item;
  }

  createNewItem() {
    
  }
}
