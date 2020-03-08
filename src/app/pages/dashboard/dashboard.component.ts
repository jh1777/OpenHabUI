import { Component, OnInit, Output, EventEmitter, NgZone } from '@angular/core';
import { environment } from '../../../environments/environment';
import { OpenhabItem } from 'src/app/services/model/openhabItem';
import { OpenhabApiService } from 'src/app/services/openhab-api.service';
import { OpenhabGroup } from 'src/app/services/model/openhabGroup';
import { AppComponent } from 'src/app/app.component';
import { DataType } from 'src/app/components/dashboard/roundedbox/datatype';
import { ItemStateChangedEvent } from 'src/app/models/openhab-events/itemStateChangedEvent';
import { Group } from 'src/app/models/config/group';
import { Room } from 'src/app/models/config/room';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  title = environment.title;
  item: OpenhabItem;
  groups: string[];
  roomNames: string[];
  rooms: Room[] = AppComponent.configuration.rooms;
  
  // OLD:
  //items: Map<string, OpenhabGroup> = new Map<string, OpenhabGroup>();
  // NEW
  itemsByRoom: Map<string, OpenhabItem[]> = new Map<string, OpenhabItem[]>();
  showModal: boolean = false;
  
  stateChanges: ItemStateChangedEvent[] = [];

  constructor(private api: OpenhabApiService, private zone: NgZone) { 
  }


  ngOnInit() {

    
    console.log("Getting data from rest API");
    /*
    // TODO: refactor: a lot of same calls!

    this.api.getItems(configuration.contactGroup.name).subscribe(res => {
      res.members.forEach(m => m.label = m.label.replace("Kontakt", "").replace("Contact", ""));
      res.displayName = configuration.contactGroup.displayName;
      res.dataType = DataType.Contact;
      this.items.set(configuration.contactGroup.name, res);
      this.groups = Array.from(this.items.keys()).sort();
    });

    this.api.getItems(configuration.temperatureGroup.name).subscribe(res => {
      res.displayName = configuration.temperatureGroup.displayName;
      res.members.forEach(m => m.label = m.label.replace("Temperatur", "").replace("Temperature", ""));
      res.members.forEach(m => m.state = m.state.concat(" ", AppComponent.configuration.units.temperature));
      res.dataType = DataType.Temperature;
      this.items.set(configuration.temperatureGroup.name, res);
      this.groups = Array.from(this.items.keys()).sort();
    });

    this.api.getItems(configuration.lightGroup.name).subscribe(res => {
      res.displayName = configuration.lightGroup.displayName;
      res.dataType = DataType.Light;
      res.members.forEach(m => m.label = m.label.replace("Helligkeit", ""));
      this.items.set(configuration.lightGroup.name, res);
      this.groups = Array.from(this.items.keys()).sort();
    });

    this.api.getItems(configuration.motionGroup.name).subscribe(res => {
      res.displayName = configuration.motionGroup.displayName;
      res.dataType = DataType.Motion;
      res.members.forEach(m => m.label = m.label.replace("Bewegung", ""));
      this.items.set(configuration.motionGroup.name, res);
      this.groups = Array.from(this.items.keys()).sort();
    });
*/
    // NEW
    this.getGroupItems();
    
    this.registerEventSource(this.createItemState);
    
  }

  getGroupItems() {
    let groups: Group[] = AppComponent.configuration.groups;
    //let rooms: Room[] = AppComponent.configuration.rooms;
    var ohItems: OpenhabItem[] = [];
    var itemsByRoom: Map<string, OpenhabItem[]> = new Map<string, OpenhabItem[]>();
    this.roomNames = this.rooms.map(r => r.group);
    // Call API
    this.api.getItemsFromGroups(groups.map(e => e.name)).subscribe(groupEntries => { 
      // TODO: replace der Lables gemäß config!!
        // add all items of ths group to array of all items
        groupEntries.forEach(group =>  { 
          let currGroup = groups.filter(g => g.name == group.name)[0];
          if (currGroup != null) {
            group.members.forEach(i => {
              // set category
              i.category = currGroup.category;
              // replace strings
              currGroup.removeFromName.forEach(str => i.label = i.label.replace(str, ''));
            });
           
          }
          
          Array.prototype.push.apply(ohItems, group.members);
        }); 
    
        // TODO: Fix Chrome debugger errors!!
        // TODO: Flur Temp wird ncht angezeigt!

        // Set room based on configured rooms
        ohItems.forEach(item => { 
          this.rooms.forEach(room => { if (item.groupNames.includes(room.group)) item.room = room.displayName });
        });
        // Groupy be Rooms
        ohItems.forEach(item => {
          if (itemsByRoom.has(item.room)) {
            var i = itemsByRoom.get(item.room);
            i.push(item);
          } else {
            var list: OpenhabItem[] = [];
            itemsByRoom.set(item.room, list);
          }
        });
        this.itemsByRoom = itemsByRoom;
    });
  }

  /**
   * Read event from OpenHab
   */
  registerEventSource = (callback: (string) => ItemStateChangedEvent) => {
    var source = new EventSource(AppComponent.configuration.openHabUrl+'/events?topics=smarthome/items/*/statechanged,smarthome/items/*/*/statechanged');
    source.onmessage = function (event) {
      try {
        let evtdata = JSON.parse(event.data);
        if (evtdata.type !== 'ItemStateChangedEvent')
        {
          console.error("Onother type not yet supported!");
        } else 
        {
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
      /*
      var itemGroupArray = Array.from(this.items.values());
      itemGroupArray.forEach(group => {
        let itemsinGroup = group.members;
        itemsinGroup.forEach(item => {
          if (item.name === itemEvent.Item) {
            item.state = itemEvent.NewValue;
            // TODO: update also transformed state 
            // TODO: refactor daat model to easier find affected items in current view!
            // TODO: add item update maybe directly to the class or at least a call to update only this item 
          };
        });
      });
      */
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