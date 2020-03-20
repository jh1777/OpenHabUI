import { Component, OnInit, Output, EventEmitter, NgZone, ChangeDetectorRef, KeyValueDiffers } from '@angular/core';
import { environment } from '../../../environments/environment';
import { OpenhabItem } from 'src/app/services/model/openhabItem';
import { OpenhabApiService } from 'src/app/services/openhab-api.service';
import { AppComponent } from 'src/app/app.component';
import { ItemStateChangedEvent } from 'src/app/services/model/itemStateChangedEvent';
import { ItemPostProcessor } from 'src/app/services/serviceTools/itemPostprocessor';
import cloneDeep from 'lodash.clonedeep';
import { EventbusService } from 'src/app/services/eventbus.service';
import { Tile } from 'src/app/models/config/tile';
import { Tools } from 'src/app/services/serviceTools/tools';
import { CategoryType } from 'src/app/models/config/category';
import { SummaryEntry } from 'src/app/components/dashboard/summary/summaryEntry';
import { SummaryTools } from 'src/app/services/serviceTools/summaryTools';

// service worker 

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  title = environment.title;

  stateChanges: ItemStateChangedEvent[] = [];

  // Items by Tile Name
  itemsByTile: Map<string, OpenhabItem[]> = new Map<string, OpenhabItem[]>();
  // Warning state by Tile Name
  warningStateByTile: Map<string, boolean> = new Map<string, boolean>();
  // Summary Items by category name
  summaryItems: Map<string, SummaryEntry> = new Map<string, SummaryEntry>();
  summary: Map<string, string> = new Map<string, string>();

  tiles: Tile[] = AppComponent.configuration.dashboardTiles;
  items: string[] = [];
  summaryTools = new SummaryTools();

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
          // Add to summary items map
          if (itemConfig.includeInSummary) {
            // Addd to Summary
            this.summaryTools.fillSummary(this.summaryItems, item);
          }          
        });
        // Warning state
        this.warningStateByTile.set(tile.title, items.map(i => i.hasWarning).some(i => i == true));

        // Summary Calculation
        this.summaryTools.calculateSummaryContent(this.summaryItems);
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