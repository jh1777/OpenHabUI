import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { AppComponent } from '../app.component';
import { ItemStateChangedEvent } from '../models/openhab-events/itemStateChangedEvent';

@Injectable({
  providedIn: 'root'
})
export class EventbusService {
  itemchanged = new Subject<ItemStateChangedEvent>();

  constructor() {
    this.createSubjectOnEventBus(this.itemchanged);
  }

  /**
   * Subcribe to the EventBus subject and passing a callback function
   */
  subscribeToSubject = (callback: (event: ItemStateChangedEvent) => void) => {
    this.itemchanged.subscribe({
      next: callback
    });
  }

  private createSubjectOnEventBus = (subj: Subject<ItemStateChangedEvent>) => {
    var source = new EventSource(AppComponent.configuration.openHabUrl + '/events?topics=smarthome/items/*/statechanged,smarthome/items/*/*/statechanged');
    source.onmessage = function (event) {
      try {
        let evtdata = JSON.parse(event.data);
        var itemEvent = new ItemStateChangedEvent();
        let topicparts: string[] = evtdata.topic.split('/');
        let itemName = topicparts.length > 2 ? topicparts[2] : "";
        itemEvent.Item = itemName;
        if (evtdata.type === 'ItemStateEvent' || evtdata.type === 'ItemStateChangedEvent' || evtdata.type === 'GroupItemStateChangedEvent') {
          var payload = JSON.parse(evtdata.payload);
          itemEvent.NewValue = payload.value;
          itemEvent.NewType = payload.type;
          itemEvent.OldValue = payload.oldValue;
          itemEvent.OldType = payload.oldType;
        }

        subj.next(itemEvent);
      }
      catch (e) {
        console.warn('SSE event issue: ' + e.message);
      }
      source.onerror = (error) => console.error(error);
    };
  }
}
