import { Component, OnInit, Output, EventEmitter, NgZone, ChangeDetectorRef, KeyValueDiffers } from '@angular/core';
import { environment } from '../../../environments/environment';
import { OpenhabItem } from 'src/app/services/model/openhabItem';
import { OpenhabApiService } from 'src/app/services/openhab-api.service';
import { OpenhabGroup } from 'src/app/services/model/openhabGroup';
import { AppComponent } from 'src/app/app.component';
import { ItemStateChangedEvent } from 'src/app/models/openhab-events/itemStateChangedEvent';
import { Room } from 'src/app/models/config/room';
import { ItemPostProcessor } from 'src/app/services/postprocessor/itemPostprocessor';
import { Group } from 'src/app/models/config/group';
import cloneDeep from 'lodash.clonedeep';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  title = environment.title;
  item: OpenhabItem;
  rooms: Room[] = AppComponent.configuration.rooms;
  groups: Group[] = AppComponent.configuration.groups;
  
  itemsByRoom: Map<string, OpenhabItem[]> = new Map<string, OpenhabItem[]>();
  categoriesByRoom: Map<string, string[]> = new Map<string, string[]>();
  
  items: string[];
  showModal: boolean = false;
  stateChanges: ItemStateChangedEvent[] = [];

  constructor(private api: OpenhabApiService, private zone: NgZone) {
  }

  ngOnInit() {
    // Call API for all cofigured Rooms
    this.api.getItemsFromRoomGroups(this.rooms.map(r => r.group)).subscribe(roomGroups => {
      this.itemsByRoom = this.mapModelToMap(roomGroups);
      // Key Value test:
      //roomGroups.map(value => this.itemsByRoom2.push({ [value.name]: value.members}));
      //-----
      this.categoriesByRoom = this.mapModelToCategories(this.itemsByRoom); 
      //----
      this.items = this.mapModelToItems(this.itemsByRoom);
    });

    this.registerEventSource(this.createItemState);
  }


  mapModelToItems(items: Map<string, OpenhabItem[]>): string[] {
    var result: OpenhabItem[] = [];
    items.forEach((value, _) =>  {
      Array.prototype.push.apply(result, value);
    });
    return result.map(i => i.name);
  }

  mapModelToCategories(items:  Map<string, OpenhabItem[]>): Map<string, string[]> {
    // only unique Categories for UI
    var result: Map<string, string[]> = new Map<string, string[]>();
    items.forEach((value: OpenhabItem[], key: string) => {
      let categories = [...new Set(value.map(d => d.category))].sort();
      result.set(value[0]?.room, categories);
    });
    return result;
  }

  mapModelToMap(model: OpenhabGroup[]): Map<string, OpenhabItem[]> {
    var result: Map<string, OpenhabItem[]> = new Map<string, OpenhabItem[]>();
    model.forEach(group => {
      if (result.has(group.name)) {
        var x = result.get(group.name);
        Array.prototype.push.apply(x, group.members);
      } else {
        var list: OpenhabItem[] = [];
        Array.prototype.push.apply(list, group.members);
        result.set(group.name, list);
      }
    });
    return result;
  }

  /**
   * Read event from OpenHab
   */
  registerEventSource = (callback: (string) => ItemStateChangedEvent) => {
    var source = new EventSource(AppComponent.configuration.openHabUrl + '/events?topics=smarthome/items/*/statechanged,smarthome/items/*/*/statechanged');
    source.onmessage = function (event) {
      try {
        let evtdata = JSON.parse(event.data);
        if (evtdata.type !== 'ItemStateChangedEvent') {
          console.error("Another EventType - not yet supported!");
        } else {
          let itemStateChangedEvent = callback(evtdata);
          if (itemStateChangedEvent) {
            console.log(itemStateChangedEvent.toString());
          }
        }
      }
      catch (e) {
        console.warn('SSE event issue: ' + e.message);
      }
    };
    source.onerror = (error) => console.error(error);
  }

  /**
   * Parse the OpenHab Event and create own ItemStateChangedEvent object
   */
  createItemState = (topicData: any): ItemStateChangedEvent => {
    var itemEvent = new ItemStateChangedEvent();
    let topicparts: string[] = topicData.topic.split('/');
    let itemName = topicparts.length > 2 ? topicparts[2] : "";
    itemEvent.Item = itemName;

    // Check if Item is persent
    if (!this.items.includes(itemName)) { 
      return null;
    }

    if (topicData.type === 'ItemStateEvent' || topicData.type === 'ItemStateChangedEvent' || topicData.type === 'GroupItemStateChangedEvent') {
      var payload = JSON.parse(topicData.payload);
      itemEvent.NewValue = payload.value;
      itemEvent.NewType = payload.type;
      itemEvent.OldValue = payload.oldValue;
      itemEvent.OldType = payload.oldType;
    }
    

    // Very important! run in zone to update live in web view!
    this.zone.run(() => {
      // Add to list of changes
      this.stateChanges?.push(itemEvent);

      // Update Items currently in use
      // Create temp Map as clone of existing one to ensure the event detection of Angular is working
      var itemsByRoomTemp = cloneDeep(this.itemsByRoom); // new Map<string, OpenhabItem[]>(JSON.parse(JSON.stringify(Array.from(this.itemsByRoom))));
      // Iterate through items
      itemsByRoomTemp.forEach((value, key) => {
        value.map((item, index, array) => {
          if (item.name === itemEvent.Item) {
            // set new value directly
            item.state = itemEvent.NewValue;
            // To get transformed data call API for this item
            this.api.getItem(item.name).subscribe(i => {
              console.log(`Update Item ${item.name} from OpenHab API. Result: ${i.status}`);
              // create temp item to copy the data
              var newItem = ItemPostProcessor.SetGroupProperties(i.body, this.groups);
              item.category = newItem.category;
              item.unit = newItem.unit;
              /// Update transformed State
              item.transformedState = ItemPostProcessor.SetTransformedState(i.body).transformedState;
              // Update UI model
              this.itemsByRoom = itemsByRoomTemp;
            });
          }
        });
      });
    });
    return itemEvent;
  }

  // For Details button
  openModal($event, item) {
    $event.preventDefault();
    this.item = item;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.item = null;
  }
}