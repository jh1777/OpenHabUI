import { Component, OnInit, Input } from '@angular/core';
import { Tile } from 'src/app/models/config/tile';
import { AppComponent } from 'src/app/app.component';
import { Item } from 'src/app/models/config/item';
import { Subject } from 'rxjs';
import { CategoryType } from 'src/app/models/config/category';
import { IConfirmationModal } from 'src/app/services/model/confirmation-modal.model';
import { ConfigService } from 'src/app/services/config.service';

@Component({
  selector: 'app-tile-config',
  templateUrl: './tile-config.component.html',
  styleUrls: ['./tile-config.component.css']
})
export class TileConfigComponent implements OnInit, IConfirmationModal {
  destroy$: Subject<boolean> = new Subject();

  id: string;
  tileName: string;
  open = true;
  tile: Tile;
  selectedItem: Item;
  category: CategoryType;
  categories: string[] = Object.keys(CategoryType).filter(v => isNaN(Number(v))) as string[];
  
  constructor(private configService: ConfigService) {}

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

  applyConfig(result) {
    if (!result) {
      this.open = false;
      this.destroy$.next(result);
    }
    else {
      let saveConfigSuccess = this.saveConfig();
      if (saveConfigSuccess) {
        this.open = false;
        this.destroy$.next(result);
      } else {
        // TODO: show error in ui
      }
    }
  }

 
  private saveConfig(): boolean {
    this.configService.saveConfig(AppComponent.configuration)
      .subscribe(event => {
        console.log(`Saving the config. Status = ${event.statusText}; Body = ${JSON.stringify(event.body)}`);
        return event.ok
      });
    return false;
  }
}
