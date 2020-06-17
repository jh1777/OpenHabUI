import { Component, OnInit, Input } from '@angular/core';
import { Tile } from 'src/app/models/config/tile';
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
  selectedItem: Item;  // Item from Tile Edit dialog
  alertText: string = null; // Error Text
  isLoading: boolean = false; // Spinner
  categories: string[] = Object.keys(CategoryType).filter(v => isNaN(Number(v))) as string[];
  // TODO: Query for available Items in OpenHab

  constructor(private configService: ConfigService) {}

  ngOnInit(): void {
    if (this.id == null) {
      // Assume that Create New Tile was called
      this.tile = this.createNewTile();
    } 
    else {
      // Edit existing Tile
      this.tileName = this.id;
      var tile = this.configService.getTileWithName(this.tileName);
      if (tile != null) {
        this.tile = tile;
      } else {
        this.alertText = `Tile with name ${this.id} could not be found in config.`;
      }
    }
  }

  private createNewTile(): Tile {
    var tile = this.configService.addTile();
    return tile;
  }

  selectItem(item: Item) {
    this.selectedItem = item;
  }

  createNewItem() {
    var item = new Item();
    // Set some mandatory defaults
    item.displayName = "<New Item>";
    item.name = "<New Item>";
    item.category = "battery";
    this.tile.items?.push(item);
  }

  applyConfig(result) {
    if (!result) {
      this.open = false;
      this.destroy$.next(result);
    }
    else {
      let valid = this.tileNameIsValid();
      if (!valid) {
        this.alertText = `Tile with name ${this.tileName} is already in use - please use a different one!`;
      }
      else {
        this.isLoading = true;
        // assign new tile Name
        this.tile.title = this.tileName;
        // Save the new Config using Config Service
        let saveConfigSuccess = this.saveConfig();
        // On Success: Close dialog and reload
        if (saveConfigSuccess) {
          this.open = false;
          this.destroy$.next(result);
          window.location.reload();
        }
      }
    }
  }
 
  private tileNameIsValid(): boolean {
    if (this.tileName == this.id) {
      // unchanged tile name
      return true;
    } else {
      // tile was renamed
      let tiles = ConfigService.configuration.dashboardTiles.filter(t => t.title == this.tileName);
      if (tiles.length > 0) {
        return false;
      } 
      return true;
    }
  }

  private saveConfig(): boolean {
    this.configService.saveConfig(ConfigService.configuration)
      .subscribe(
        event => {
          console.log(`Saving the config. Status = ${event.statusText}; Body = ${JSON.stringify(event.body)}`);
          if (event.ok) {
            this.alertText = null;
          }
          return event.ok
        },
        error => {
          if (error) {
            this.alertText = `Error: ${error}`;
          } else {
            this.alertText = null;
          }
        });
    return false;
  }
}
