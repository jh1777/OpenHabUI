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
  // Critial state by Tile Name
  criticalStateByTile: Map<string, boolean> = new Map<string, boolean>();
  // Summary Items by category name
  summaryItems: Map<string, SummaryEntry> = new Map<string, SummaryEntry>();
  summary: Map<string, string> = new Map<string, string>();

  tiles: Tile[] = AppComponent.configuration.dashboardTiles;
  // Used for the UI:
  tilesToShow: Tile[];
  items: string[] = [];
//  summaryTools = new SummaryTools();

  constructor(
    private api: OpenhabApiService, 
    private zone: NgZone, 
    private eventService: EventbusService) 
    {}

  ngOnInit() {
    this.tilesToShow = cloneDeep(this.tiles);
    // Call API for all configured tiles
    AppComponent.configuration.dashboardTiles.forEach(tile => {
      let itemNames = tile.items.map(i => i.name);
      this.api.getItems(itemNames).subscribe(items => {
        // Filter out items that are only shown in summary
        let itemsForTile = tile.items.filter(i => !i.showOnlyInSummary);
        if (itemsForTile.length > 0) {
          let itemNamesForTile = itemsForTile.map(t => t.name);
          this.itemsByTile.set(tile.title, items.filter(i => itemNamesForTile.includes(i.name)));
        } else {
          // Remove from UI Tiles
          const index = this.tilesToShow.findIndex(i => i.title == tile.title);
          if (index > -1) {
            this.tilesToShow.splice(index, 1);
          }
        }

        items.forEach(item => {
          // add really queried items to local array for eventbus filter
          this.items.push(item.name);
          if (item.showInSummary || item.showOnlyInSummary) {
            // Addd to Summary
            SummaryTools.FillSummary(this.summaryItems, item);
          }          
        });
        // Warning state
        this.warningStateByTile.set(tile.title, items.map(i => i.hasWarning).some(i => i == true));
        // Warning state
        this.criticalStateByTile.set(tile.title, items.map(i => i.isCritical).some(i => i == true));

        // Summary Calculation
        SummaryTools.CalculateSummaryContent(this.summaryItems);
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
        var summaryItemsTemp = cloneDeep(this.summaryItems);
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

        summaryItemsTemp.forEach((value, key) => {
          value.items.map((item, index, array) => {
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

                // Update summary
                SummaryTools.CalculateSummaryContent(summaryItemsTemp);
                this.summaryItems = summaryItemsTemp;
              });
            }
          });
        });
      });
      console.log(itemStateChangedEvent.toString());
    }
  }
}