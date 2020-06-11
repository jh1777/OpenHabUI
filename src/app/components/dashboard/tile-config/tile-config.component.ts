import { Component, OnInit, Input } from '@angular/core';
import { Tile } from 'src/app/models/config/tile';
import { AppComponent } from 'src/app/app.component';
import { Item } from 'src/app/models/config/item';
import { Subject } from 'rxjs';
import { CategoryType } from 'src/app/models/config/category';

@Component({
  selector: 'app-tile-config',
  templateUrl: './tile-config.component.html',
  styleUrls: ['./tile-config.component.css']
})
export class TileConfigComponent implements OnInit {
  destroy$: Subject<boolean> = new Subject();

  id: string;
  tileName: string;
  open = true;
  tile: Tile;
  selectedItem: Item;
  category: CategoryType;
  categories: string[] = Object.keys(CategoryType).filter(v => isNaN(Number(v))) as string[];
  
  constructor() {}

  ngOnInit(): void {
    this.tileName = this.id;
    var tiles = AppComponent.configuration.dashboardTiles.filter(t => t.title == this.tileName);
    if (tiles.some) {
      this.tile = tiles[0];
    }
  }

  selectItem(item: Item) {
    this.selectedItem = item;
  }

  createNewItem() {
    // TODO
  }

  Apply(result) {
    // TODO
    this.open = false;
    this.destroy$.next(result);
  }
}
