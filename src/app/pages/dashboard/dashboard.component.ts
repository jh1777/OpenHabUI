import { Component, OnInit, NgZone, ViewChild, AfterViewInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { OpenhabItem } from 'src/app/services/model/openhabItem';
import { OpenhabApiService } from 'src/app/services/openhab-api.service';
import { ItemStateChangedEvent } from 'src/app/services/model/itemStateChangedEvent';
import { ItemPostProcessor } from 'src/app/services/serviceTools/itemPostprocessor';
import cloneDeep from 'lodash.clonedeep';
import { EventbusService } from 'src/app/services/eventbus.service';
import { Tile } from 'src/app/models/config/tile';
import { SummaryEntry } from 'src/app/components/dashboard/summary/summaryEntry';
import { SummaryTools } from 'src/app/services/serviceTools/summaryTools';
import { StateMapping } from 'src/app/services/serviceTools/stateMapping';
import { Tools } from 'src/app/services/serviceTools/tools';
import { BehaviorSubject } from 'rxjs';
import { ConfigService } from 'src/app/services/config.service';
import { TileConfigComponent } from 'src/app/components/dashboard/tile-config/tile-config.component';
import { ObservableService } from 'src/app/services/observable.service';
import { LogEntry, LogLevel } from 'src/app/services/model/logEntry.model';
import { EventData } from 'src/app/services/model/event.model';
import { ObservableEvents } from 'src/app/services/model/observable.eventTypes';
import { LoggingService } from 'src/app/services/log.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit, AfterViewInit {
  title = environment.title;
  @ViewChild(TileConfigComponent) tileConfigDialog: TileConfigComponent; // Declare modal tile config dialog

  // List of changes states for history (limit to 50)
  stateChanges: ItemStateChangedEvent[] = [];

  // Items by Tile Name: Main collection for Tile data
  itemsByTile: Map<string, OpenhabItem[]> = new Map<string, OpenhabItem[]>();
  // Warning state by Tile Name: Warning state by Tile name
  warningStateByTile: Map<string, boolean> = new Map<string, boolean>();
  // Critial state by Tile Name: Critical state by Tile name
  criticalStateByTile: Map<string, boolean> = new Map<string, boolean>();
  // Summary Items by category name
  summaryItems: Map<string, SummaryEntry[]> = new Map<string, SummaryEntry[]>();
  // Summary Categories array (to preserve defined order)
  summaryCategories: string[] = [];
  // Show only activity in Summary (if false also none-triggered states will be shown)
  activityOnlyInSummary = ConfigService.configuration.showOnlyActivityInSummary;
  // Config: Tiles 
  tiles: Tile[] = ConfigService.configuration.dashboardTiles;
  // Tiles used to show in UI - some may not be shown based on certain item config
  tilesToShow: Tile[];
  // Item ames overall on Dashboard as string array to filter EventBus messages, included in state change detection!
  items: string[] = [];
  
  updateSubject = new BehaviorSubject(this.itemsByTile);
  showHistoryModal = false;

  constructor(
    private api: OpenhabApiService, 
    private zone: NgZone, 
    private eventService: EventbusService,
    private configService: ConfigService,
    private observableService: ObservableService,
    private logger: LoggingService) 
    {}

  ngAfterViewInit(): void {
    this.tileConfigDialog.onSave.subscribe(tile => {
        //do something with tile result!
        if (tile) {
          console.log("Tile creation: "+ JSON.stringify(tile));
        }
    });
  }

  ngOnInit() {
    
    this.logger.logInfo("OpenHab UI started.", "Startup").subscribe(e => e.body);
    
    this.updateSubject.subscribe(data => {
      this.itemsByTile = data;
    });

    this.tilesToShow = cloneDeep(this.tiles);
    // Call API for all configured tiles
    ConfigService.configuration.dashboardTiles.forEach(tile => {
      
      if (this.configService.hasItems(tile)) {
        // Get all item names from the current tile config that are NOT groups
        let itemNames = tile.items?.filter(i => !i.isGroup).map(i => i.name);

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
      }
    });

    // Subscribe to Events (new)
    this.eventService.subscribeToSubject(this.handleStateChange, this.items);
  }

  private updateWarningStateForAllTiles(tileItems: Map<string, OpenhabItem[]>) {
    let tiles = ConfigService.configuration.dashboardTiles;
    tileItems.forEach((value, key) => {
      this.updateWarningStateByTile(value, tiles.filter(t => t.title == key)[0]);
    });
  }

  private updateWarningStateByTile(items: OpenhabItem[], tile: Tile) {
    // Warning state  
    this.warningStateByTile.set(tile.title, items.some(i => i.hasWarning == true));
    // Critical state
    this.criticalStateByTile.set(tile.title, items.some(i => i.isCritical == true));
  }

  /**
   *  Do post processing: Remove tile items only shown in summary or remove tile
   *  if there is no item anymore in the tile and add items to string array (for order)
   */
  private tilesPostProcessing = (items: OpenhabItem[], tile: Tile) => {
    // Filter out items that are only shown in summary
    let itemsForTile = tile.items?.filter(i => !i.showOnlyInSummary);
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

    // Warning and Critical calculation gets updated
    this.updateWarningStateByTile(items, tile);
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

      // Update content of group OpenhabItem -> now done in service!
      //groups.map(g => this.updateGroupItemState(g));

      // Add Group to itemsByTile
      groups.filter(g => !g.showOnlyInSummary).map(g => Tools.AddEntryToMapArray<string, OpenhabItem>(this.itemsByTile, tile.title, g)); 
      let dontShowTile = tile.items.every(i => i.showOnlyInSummary);
      if (dontShowTile) {
        let index = this.tilesToShow.findIndex(t => t.title == tile.title);
        if (index > -1) {
          this.tilesToShow.splice(index, 1);
        }
      }

      // Update Summary
      groups.filter(i => i.showInSummary || i.showOnlyInSummary).map(item => SummaryTools.FillSummary(this.summaryItems, item));
      // Summary Calculation
      this.summaryCategories = SummaryTools.CalculateSummaryContent(this.summaryItems, this.activityOnlyInSummary);
      // ---

      // Warning and Critical calculation gets updated
      this.updateWarningStateByTile(groups.filter(g => !g.showOnlyInSummary), tile);
    });
  }

  /**
   * Update content of group OpenhabItem (as Group) when state reported a change
   * Apply Config to Group and Child Items and calculate label of the group entry
   */
  private updateGroupItemState = (group: OpenhabItem, extention: () => void = null) => {
    
    // Apply config
    ItemPostProcessor.ApplyConfigToItem(group);

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
  private updateItemOnStateChange = (item: OpenhabItem, itemStateChangedEvent: ItemStateChangedEvent, extention: () => void = null) => {
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

        // Execute optional extension
        if (extention != null) {
          extention();
        }
    });
  }

  private updateSummaryItemOnStateChange = (item: OpenhabItem, itemStateChangedEvent: ItemStateChangedEvent, summaryItemsTemp: Map<string, SummaryEntry[]>) => {
    this.updateItemOnStateChange(item, itemStateChangedEvent, () => {
      // Update summary
      let summaryCategoriesTemp = SummaryTools.CalculateSummaryContent(summaryItemsTemp, this.activityOnlyInSummary);
      this.summaryItems = summaryItemsTemp;
      this.summaryCategories = cloneDeep(summaryCategoriesTemp);
    });

  }

  /**
   * Handle the event when an Item changed
   */

  handleStateChange = (itemStateChangedEvent: ItemStateChangedEvent): void => {
    let itemName = itemStateChangedEvent.Item;
    // Check if Item is persent
    if (this.items.includes(itemName)) { 
      // Very important! run in zone to update live in web view!
      this.zone.run(() => {
        // Add to list of changes
        this.stateChanges.push(itemStateChangedEvent);
        // Limit History to 50
        if (this.stateChanges.length > 50) {
          this.stateChanges.splice(0, this.stateChanges.length - 51);
        }

        // Update Items currently in use
        // Create temp Map as clone of existing one to ensure the event detection of Angular is working
        var itemsByTileTemp = cloneDeep(this.itemsByTile);
        var summaryItemsTemp = cloneDeep(this.summaryItems);

        // Iterate through items
        itemsByTileTemp.forEach((value, key) => {
          value.map((item, index, array) => {
            // Single item objects
            if (item.name === itemName && item.members == null) {
              this.updateItemOnStateChange(item, itemStateChangedEvent, () => {
                // Update UI model
                this.updateWarningStateForAllTiles(itemsByTileTemp);

                this.updateSubject.next(this.updateValueInNewMap(itemsByTileTemp, item));
              });
            }

            // Group entry
            if (item.members != null && item.members.findIndex(i => i.name == itemName) != -1) {
                this.api.getGroup(item.name).subscribe(g => item.state = g.state);
                var subItem = item.members.filter(item => item.name == itemName);
                subItem.map(i => this.updateItemOnStateChange(i, itemStateChangedEvent, () => { 
                  // Update Groups
                  this.updateGroupItemState(item); 
                  // Update UI model
                  this.updateWarningStateForAllTiles(itemsByTileTemp);

                  this.updateSubject.next(this.updateValueInNewMap(itemsByTileTemp, i));
                }));

                this.updateSubject.next(this.updateValueInNewMap(itemsByTileTemp, item));
            }
          });
        });

        summaryItemsTemp.forEach((value, key) => {
          value.map(summaryEntry => { 
            summaryEntry.items.map(item => {
              if (item.name === itemName && item.members == null) {
                this.updateSummaryItemOnStateChange(item, itemStateChangedEvent, summaryItemsTemp);
              }
              if (item.members != null && item.members.findIndex(i => i.name == itemName) != -1) {
                var subItem = item.members.filter(item => item.name == itemName);
                subItem.map(i => this.updateSummaryItemOnStateChange(i, itemStateChangedEvent, summaryItemsTemp));
                // Update Groups
                this.updateGroupItemState(item);
              }
            });
          });
        });
      });
      
      if (environment.logLevel == "debug") {
        console.log(itemStateChangedEvent.toString());
        let entry = new LogEntry(itemStateChangedEvent.toString(), LogLevel.Debug, "OpenHab EventBus");
        this.observableService.emit<LogEntry>(new EventData(ObservableEvents.LOG, entry));
      }
    }
  }

  // Item Update Helper
  private updateValueInNewMap(map: Map<string, OpenhabItem[]>, item: OpenhabItem): Map<string, OpenhabItem[]> {
    map.forEach((items, key) => {
      items.filter(i => i.name == item.name).map(i => i = item);
    });
    return cloneDeep(map);
  }

  //##### Button Actions

  // History
  showHistory($event: MouseEvent) {
    $event.preventDefault();
    this.showHistoryModal = true;
  }

  closeHistoryModal() {
    this.showHistoryModal = false;
  }

  // Create new Tile
  createNewTile() {
    this.tileConfigDialog.openDialog();
  }

}