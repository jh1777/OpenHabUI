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
import { SummaryEntry } from 'src/app/components/dashboard/summary/summaryEntry';
import { SummaryTools } from 'src/app/services/serviceTools/summaryTools';
import { CategoryType } from 'src/app/models/config/category';
import { StateMapping } from 'src/app/services/serviceTools/stateMapping';
import { Tools } from 'src/app/services/serviceTools/tools';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  title = environment.title;

  // List of changes states for further use - currently not in use! TODO: Make use or remove
  stateChanges: ItemStateChangedEvent[] = [];

  // Items by Tile Name: Main collection for Tile data
  itemsByTile: Map<string, OpenhabItem[]> = new Map<string, OpenhabItem[]>();
  // Warning state by Tile Name: Warning state by Tile name
  warningStateByTile: Map<string, boolean> = new Map<string, boolean>();
  // Critial state by Tile Name: Critical state by Tile name
  criticalStateByTile: Map<string, boolean> = new Map<string, boolean>();
  // Summary Items by category name
  summaryItems: Map<string, SummaryEntry> = new Map<string, SummaryEntry>();
  // Summary Categories array (to preserve defined order)
  summaryCategories: string[] = [];
  // Show only activity in Summary (if false also none-triggered states will be shown)
  activityOnlyInSummary = AppComponent.configuration.showOnlyActivityInSummary;
  // Config: Tiles 
  tiles: Tile[] = AppComponent.configuration.dashboardTiles;
  // Tiles used to show in UI - some may not be shown based on certain item config
  tilesToShow: Tile[];
  // Item ames overall on Dashboard as string array to filter EventBus messages, included in state change detection!
  items: string[] = [];

  constructor(
    private api: OpenhabApiService, 
    private zone: NgZone, 
    private eventService: EventbusService) 
    {}

  ngOnInit() {
    this.tilesToShow = cloneDeep(this.tiles);
    // Call API for all configured tiles
    AppComponent.configuration.dashboardTiles.forEach(tile => {
      
      // Get all item names from the current tile config that are NOT groups
      let itemNames = tile.items.filter(i => !i.isGroup).map(i => i.name);

      
      // Call API: Get all items from OpenHab and start Tile and Summary processing
      this.api.getItems(itemNames).subscribe(items => {

        // Do post processing: REmove tile items only shown in summary or remove tile
        // if there is no item anymore in the tile and add items to string array (for order)
        this.tilesPostProcessing(items, tile);

        // Fill the summary items with item content
        items.filter(i => i.showInSummary || i.showOnlyInSummary).map(item => SummaryTools.FillSummary(this.summaryItems, item));

        // Summary Calculation
        this.summaryCategories = SummaryTools.CalculateSummaryContent(this.summaryItems, this.activityOnlyInSummary);
      });

      // Handle Group Items 
      this.handleGroupItems(tile);

    });

    // Subscribe to Events (new)
    this.eventService.subscribeToSubject(this.handleStateChange, this.items);
  }

  /**
   *  Do post processing: REmove tile items only shown in summary or remove tile
   *  if there is no item anymore in the tile and add items to string array (for order)
   */
  private tilesPostProcessing = (items: OpenhabItem[], tile: Tile) => {
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
    // Add really queried items to local array for eventbus filter
    Array.prototype.push.apply(this.items, items.map(i => i.name));

    // Warning state
    this.warningStateByTile.set(tile.title, items.map(i => i.hasWarning).some(i => i == true));
    // Critical state
    this.criticalStateByTile.set(tile.title, items.map(i => i.isCritical).some(i => i == true));
  }

   /**
   * Handle group OpenhabItem (as Group) item processing
   * Filter groups, Call API, Apply Config to Group and Child Items and add to Tile Items Map
   */
  private handleGroupItems(tile: Tile) {
    let itemDefinitions = tile.items.filter(i => i.isGroup);
    if (itemDefinitions.length == 0) {
      return;
    }
    let groupNames = itemDefinitions.map(i => i.name);
    
    // Call API
    this.api.getItemsFromGroups(groupNames).subscribe(groups => {
      // Apply config to items
      groups.map(g => g.members.map(item => { 
        if (!this.items.includes(item.name)) {
          this.items.push(item.name);
        }
      }));

      // Update content of group OpenhabItem
      groups.map(g => this.updateGroupItemState(g));

      // Add Group to itemsByTile
      groups.map(g => Tools.AddEntryToMapArray<string, OpenhabItem>(this.itemsByTile, tile.title, g)); 

      // Update Summary: TODO: Summary not working because one category has only one Summar Entry in Map!!
      // maybe need to change: summaryItems: Map<string, SummaryEntry> to summaryItems: Map<string, SummaryEntry[]>
      groups.filter(i => i.showInSummary || i.showOnlyInSummary).map(item => SummaryTools.FillSummary(this.summaryItems, item));
      // ---

      // Warning state
      this.warningStateByTile.set(tile.title, groups.some(g => g.hasWarning == true));
      // Critical state
      this.criticalStateByTile.set(tile.title, groups.some(g => g.isCritical == true));
    });
  }

  /**
   * Update content of group OpenhabItem (as Group) when state reported a change
   * Apply Config to Group and Child Items and calculate label of the group entry
   */
  private updateGroupItemState = (group: OpenhabItem) => {
    // Apply config
    ItemPostProcessor.ApplyConfigToItem(group);
    group.members.map(item => ItemPostProcessor.ApplyConfigToItem(item));
    // project item data to group
    group.hasWarning = group.members.some(i => i.hasWarning);
    group.isCritical = group.members.some(i => i.isCritical);
    // Set Triggered State
    StateMapping.CalculateGroupState(group);
  }

  /**
   * Update content of one OpenhabItem when Eventbus state reported a change
   * Sets new vale and gets new TransformedState from API and applies config again
   */
  private updateItemOnStateChange = (item: OpenhabItem, itemStateChangedEvent: ItemStateChangedEvent) => {
    // set new value directly
    item.state = itemStateChangedEvent.NewValue;
    // To get transformed data call API for this item
    this.api.getItem(item.name).subscribe(i => {
      console.log(`Update Item ${item.name} from OpenHab API. Result: ${i.status}`);
      
      // Normal (single) Item
      // Set TransformedState from GET call first
      item.transformedState = i.body.transformedState;
      // Apply Item config
      ItemPostProcessor.ApplyConfigToItem(item);
    });
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
            // Single item objects
            if (item.name === itemStateChangedEvent.Item && item.members == null) {
              this.updateItemOnStateChange(item, itemStateChangedEvent);
            }
            // Group entry
            if (item.members != null && item.members.findIndex(i => i.name == itemStateChangedEvent.Item) != -1) {
                var subItem = item.members.filter(item => item.name == itemStateChangedEvent.Item);
                subItem.map(i => this.updateItemOnStateChange(i, itemStateChangedEvent));
                // Update Groups
                this.updateGroupItemState(item);
            }

            // Update UI model
            this.itemsByTile = itemsByTileTemp;
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
                let summaryCategoriesTemp = SummaryTools.CalculateSummaryContent(summaryItemsTemp, this.activityOnlyInSummary);
                this.summaryItems = summaryItemsTemp;
                this.summaryCategories = cloneDeep(summaryCategoriesTemp);
              });
            }
          });
        });
      });
      console.log(itemStateChangedEvent.toString());
    }
  }
}