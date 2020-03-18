import { Component, OnInit, Output, EventEmitter, NgZone, ChangeDetectorRef, KeyValueDiffers } from '@angular/core';
import { environment } from '../../../environments/environment';
import { OpenhabItem } from 'src/app/services/model/openhabItem';
import { OpenhabApiService } from 'src/app/services/openhab-api.service';
import { AppComponent } from 'src/app/app.component';
import { ItemStateChangedEvent } from 'src/app/services/model/itemStateChangedEvent';
import { ItemPostProcessor } from 'src/app/services/postprocessor/itemPostprocessor';
import cloneDeep from 'lodash.clonedeep';
import { EventbusService } from 'src/app/services/eventbus.service';
import { Tile } from 'src/app/models/config/tile';

// service worker 

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  title = environment.title;

  stateChanges: ItemStateChangedEvent[] = [];

  itemsByTile: Map<string, OpenhabItem[]> = new Map<string, OpenhabItem[]>();
  warningStateByTile: Map<string, boolean> = new Map<string, boolean>();
  tiles: Tile[] = AppComponent.configuration.dashboardTiles;
  items: string[] = [];

  constructor(
    private api: OpenhabApiService, 
    private zone: NgZone, 
    private eventService: EventbusService) 
    {}

  ngOnInit() {
    // Call API for all configured tiles
    AppComponent.configuration.dashboardTiles.forEach(tile => {
      let itemNames = tile.items.map(i => i.name);
      this.api.getItems(itemNames).subscribe(items => {
        this.itemsByTile.set(tile.title, items);

        items.forEach(item => {
          // add really queried items to local array for eventbus filter
          this.items.push(item.name);
          // Get config for Item
          let itemConfig = tile.items.filter(i => i.name == item.name)[0];
          ItemPostProcessor.ApplyConfigToItem(item, itemConfig);
          
        });
        // Warning state
        this.warningStateByTile.set(tile.title, items.map(i => i.hasWarning).some(i => i == true));
      });
    });
    // Subscribe to Events (new)
    this.eventService.subscribeToSubject(this.handleStateChange, this.items);
  }

  /**
   * Handle the event when an Item changed
   */
  handleStateChange = (itemStateChangedEvent: ItemStateChangedEvent): void => {
    // Check if Item is persent
    if (this.items.includes(itemStateChangedEvent.Item)) { 
      // Very important! run in zone to update live in web view!
      this.zone.run(() => {
        // Add to list of changes
        this.stateChanges?.push(itemStateChangedEvent);

        // Update Items currently in use
        // Create temp Map as clone of existing one to ensure the event detection of Angular is working
        var itemsByTileTemp = cloneDeep(this.itemsByTile);
        // Iterate through items
        itemsByTileTemp.forEach((value, key) => {
          value.map((item, index, array) => {
            if (item.name === itemStateChangedEvent.Item) {
              // set new value directly
              item.state = itemStateChangedEvent.NewValue;
              // To get transformed data call API for this item
              this.api.getItem(item.name).subscribe(i => {
                console.log(`Update Item ${item.name} from OpenHab API. Result: ${i.status}`);
                
                // Set TransformedState from GET call first
                item.transformedState = i.body.transformedState;
                
                // Apply Item config
                ItemPostProcessor.ApplyConfigToItem(item);

                // Update UI model
                this.itemsByTile = itemsByTileTemp;
              });
            }
          });
        });
      });
      console.log(itemStateChangedEvent.toString());
    }
  }
}