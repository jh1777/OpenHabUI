import { Injectable } from '@angular/core';
import { Subject, ReplaySubject } from 'rxjs';
import { AppComponent } from '../app.component';
import { ItemStateChangedEvent } from './model/itemStateChangedEvent';

@Injectable({
  providedIn: 'root'
})
export class EventbusService {
  // General Change Events
  itemchanged = new Subject<ItemStateChangedEvent>();
  // Map of ReplaySubjects by ItemName to keep track of each item change history in a separate Subject
  // no longer in use: itemchangedHistory: Map<string, ReplaySubject<ItemStateChangedEvent>> = new Map<string, ReplaySubject<ItemStateChangedEvent>>();
  
  constructor() {
  }

  /**
   * Create and subscribe to the EventBus subject and passing a callback function
   * 
   */
  subscribeToSubject = (callback: (event: ItemStateChangedEvent) => void, filter: string[] = null) => {
    this.createSubjectOnEventBus(this.itemchanged, filter);
    this.itemchanged.subscribe({
      next: callback
    });
  }

  /**
   * Subscribe to EventBus of OpenHab and notifiy Subjects on each value change
   * Pass optional filter parameter (string[]) to not pollute the subjects with unneccessary events
   */
  private createSubjectOnEventBus = (subj: Subject<ItemStateChangedEvent>, filter: string[] = null) => { 
    var source = new EventSource(AppComponent.configuration.openHabUrl + '/events?topics=smarthome/items/*/statechanged,smarthome/items/*/*/statechanged');
    source.onmessage = function (event) {
      try {
        let evtdata = JSON.parse(event.data);
        var itemEvent = new ItemStateChangedEvent();
        let topicparts: string[] = evtdata.topic.split('/');
        let itemName = topicparts.length > 2 ? topicparts[2] : "";
        itemEvent.Item = itemName;
        itemEvent.DateTime = new Date();
        if (evtdata.type === 'ItemStateEvent' || evtdata.type === 'ItemStateChangedEvent' || evtdata.type === 'GroupItemStateChangedEvent') {
          var payload = JSON.parse(evtdata.payload);
          itemEvent.NewValue = payload.value;
          itemEvent.NewType = payload.type;
          itemEvent.OldValue = payload.oldValue;
          itemEvent.OldType = payload.oldType;
        }
        
        if (filter == null || (filter != null && filter.includes(itemName))) {
          subj.next(itemEvent);
          /* no longer use replay subject
          if (replaySubject.has(itemName)) {
            replaySubject.get(itemName).next(itemEvent);
          } else {
            replaySubject.set(itemName, new ReplaySubject<ItemStateChangedEvent>(itemStateHistory));
            replaySubject.get(itemName).next(itemEvent);
          }
          */
        } 
      }
      catch (e) {
        console.warn('SSE event issue: ' + e.message);
      }
      source.onerror = (error) => console.error(error);
    };
  }
}
