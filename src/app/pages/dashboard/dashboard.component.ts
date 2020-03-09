import { Component, OnInit, Output, EventEmitter, NgZone } from '@angular/core';
import { environment } from '../../../environments/environment';
import { OpenhabItem } from 'src/app/services/model/openhabItem';
import { OpenhabApiService } from 'src/app/services/openhab-api.service';
import { OpenhabGroup } from 'src/app/services/model/openhabGroup';
import { AppComponent } from 'src/app/app.component';
import { DataType } from 'src/app/components/dashboard/roundedbox/datatype';
import { ItemStateChangedEvent } from 'src/app/models/openhab-events/itemStateChangedEvent';
import { Room } from 'src/app/models/config/room';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  title = environment.title;
  item: OpenhabItem;

  rooms: Room[] = AppComponent.configuration.rooms;
  itemsByRoom: Map<string, OpenhabItem[]> = new Map<string, OpenhabItem[]>();
  showModal: boolean = false;

  stateChanges: ItemStateChangedEvent[] = [];

  constructor(private api: OpenhabApiService, private zone: NgZone) {
  }

  ngOnInit() {
    console.log("Getting data from rest API");

    // Call API for all cofigured Rooms
    this.api.getItemsFromRoomGroups(this.rooms.map(r => r.group)).subscribe(roomGroups => {
      this.itemsByRoom = this.mapModelToMap(roomGroups);
    });

    this.registerEventSource(this.createItemState);
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
          console.error("Onother type not yet supported!");
        } else {
          let itemStateChangedEvent = callback(evtdata);
          console.log(itemStateChangedEvent.toString());
        }

      }
      catch (e) {
        console.warn('SSE event issue: ' + e.message);
      }
    }
  }

  /**
   * Parse the OpenHab Event and create own ItemStateChangedEvent object
   */
  createItemState = (topicData: any): ItemStateChangedEvent => {
    var itemEvent = new ItemStateChangedEvent();
    let topicparts: string[] = topicData.topic.split('/');
    let itemName = topicparts.length > 2 ? topicparts[2] : "";
    itemEvent.Item = itemName;

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
      // Update used items in this view (poc; needs refactoring!)

      this.itemsByRoom.forEach((value, key) => {
        value.forEach(item => {
          if (item.name === itemEvent.Item) {
            item.state = itemEvent.NewValue;

            // TODO: update also transformed state 
            // TODO: refactor daat model to easier find affected items in current view!
            // TODO: add item update maybe directly to the class or at least a call to update only this item 
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