import { Component, Output, EventEmitter } from '@angular/core';
import { Tile } from 'src/app/models/config/tile';
import { Item } from 'src/app/models/config/item';
import { CategoryType } from 'src/app/models/config/category';
import { ConfigService } from 'src/app/services/config.service';
import { ObservableService } from 'src/app/services/observable.service';
import { EventData } from 'src/app/services/model/event.model';
import { LogEntry, LogLevel } from 'src/app/services/model/logEntry.model';
import { ObservableEvents } from 'src/app/services/model/observable.eventTypes';
import { Configuration } from 'src/app/services/model/configuration-model';

@Component({
  selector: 'app-tile-config',
  templateUrl: './tile-config.component.html',
  styleUrls: ['./tile-config.component.css']
})
export class TileConfigComponent  {
  workingConfig: Configuration = null;

  initialTileName: string;
  tileName: string;
  open = false;
  tile: Tile = null;
  selectedItem: Item;  // Item from Tile Edit dialog

  alertText: string = null; // Error Text
  alertText2: string = null; // Error Text
  alertText3: string = null; // Error Text

  isLoading: boolean = false; // Spinner
  categories: string[] = Object.keys(CategoryType).filter(v => isNaN(Number(v))) as string[];
  
  // DONE: Modal Dialog like: https://blog.armstrongconsulting.com/vmware-clarity-angular-modal-dialogs/
  // DONE: Cancel click still leaves all changes alive in configuration
  // TODO: Query for available Items in OpenHab
  // TODO: Feature: Remove Item -> TODO: Show confirmation before Remove Item
  // TODO: Create Log entry only events -> post to Logging service only on OK-click

  @Output() onSave: EventEmitter<Tile> = new EventEmitter<Tile>();
  
  constructor(
    private configService: ConfigService, 
    private observableService: ObservableService) {
    }
 
  openDialog(tile: Tile = null) {
    this.open = true;
    this.workingConfig = this.configService.create();
    if (tile == null) {
      // Assume this is new Tile creation
      this.tile = this.configService.createTile();
      this.tileName = "";
      this.initialTileName = "";

      // Add tile
      this.workingConfig.dashboardTiles.push(this.tile);
    } else {
      var tiles = this.workingConfig.dashboardTiles.filter(t => t.title === tile.title);
      if (tiles.length == 1) {
        this.tileName = tile.title;
        this.initialTileName = tile.title;
        // edit tile
        this.tile = tiles[0];
        if (tiles[0].items.length > 0) {
          this.selectedItem = tiles[0].items[0];
        }
      }
    }
  }

  selectItem(item: Item) {
    this.selectedItem = item;
  }

  removeItem(item: Item) {
    console.log(`Remove item ${item.displayName} clicked...`);
    // TODO: REmove Item confirm
    // ..
    //. ...
    let idx = this.tile.items?.findIndex(i => i === item);
    if (idx > -1) {
      let removedItems = this.tile.items?.splice(idx, 1);
      if (removedItems.length == 1) {
        this.selectedItem = this.tile.items[0];
        // Log
        let entry = new LogEntry(`"${this.tileName}" item ${removedItems[0].displayName} (${removedItems[0].name}) was removed.`, LogLevel.Info, "Remove Item", `${JSON.stringify(removedItems[0])}`);
        this.observableService.emit<LogEntry>(new EventData(ObservableEvents.LOG, entry));
      }
      
    }

  }

  createNewItem() {
    var item = new Item();
    // Set some mandatory defaults
    item.displayName = "<New Item>";
    item.name = "<New Item>";
    let idx = this.tile.items?.push(item);
    this.selectedItem = this.tile.items[idx-1];
  }

  applyConfig(result) {
    if (!result) {
      this.open = false;
    }
    else {
      let formInvalid = this.formDataIsInvalid();

      if (!formInvalid) {
        this.isLoading = true;
        // assign new tile Name
        this.tile.title = this.tileName;
        // Save the new Config using Config Service
        let saveConfigSuccess = this.saveConfig();
        // On Success: Close dialog and reload
        if (saveConfigSuccess) {
          this.onSave.emit(this.tile);
          this.open = false;
          window.location.reload();
        }
      } else {
        // Log
        let entry = new LogEntry(`"${this.tileName}" form validation failed!`, LogLevel.Error, "Edit/Create Tile", `${this.alertText ?? ""};${this.alertText2 ?? ""};${this.alertText3 ?? ""}`);
        this.observableService.emit<LogEntry>(new EventData(ObservableEvents.LOG, entry));
      }
    }
  }

  private formDataIsInvalid(): boolean {
    // Tile
    let validTileName = this.tileNameIsValid();
      if (!validTileName) {
        this.alertText = `Tile with name ${this.tileName} is already in use - please use a different one!`;
      } else {
        this.alertText = null;
      }
    // Item Names
    let nameNotOk = this.tile.items?.some(e => e.name === "<New Item>" || e.displayName === "<New Item>");
    if (nameNotOk) {
      this.alertText2 = "Item Name / Item Display Name must be defined and valid!"
    } else {
      this.alertText2 = null;
    }
    // Category
    let categoryNotOk = this.tile.items?.some(e => e.category == null || e.category == "");
    if (categoryNotOk) {
      this.alertText3 = "Item Category must be defined and valid!"
    } else {
      this.alertText3 = null;
    }
    return nameNotOk || categoryNotOk || !validTileName;
  }
 
  private tileNameIsValid(): boolean {
    if (this.tileName == this.initialTileName) {
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
    this.configService.saveConfig(this.workingConfig)
      .subscribe(
        event => {
          console.log(`Saving the config. Status = ${event.statusText}; Body = ${JSON.stringify(event.body)}`);
          if (event.ok) {
            this.alertText = null;
            // Logging
            let entry = new LogEntry(`"${this.tileName}" saved successfully.`, LogLevel.Info, "Edit/Create Tile");
            this.observableService.emit<LogEntry>(new EventData(ObservableEvents.LOG, entry));
          }
          return event.ok
        },
        error => {
          if (error) {
            this.alertText = `Error: ${error}`;
            // Logging
            let entry = new LogEntry(`Unable to save configuration for Tile "${this.tileName}"!`, LogLevel.Error, "Edit/Create Tile");
            this.observableService.emit<LogEntry>(new EventData(ObservableEvents.LOG, entry));
          } else {
            this.alertText = null;
          }
        });
    return false;
  }
}
