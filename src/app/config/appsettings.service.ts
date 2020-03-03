import { Injectable } from '@angular/core';
import * as config from '../../../config.json';
import { Config } from './model/config';
import { Room } from './model/room';
import { Globals } from './model/global';

@Injectable({
  providedIn: 'root'
})
export class AppsettingsService {

  // TODO: do in a proper way!!

  constructor() { }
/*
  readConfig(): Config {
    var c: Config;
    c.openHabUrl = config.openHabUrl;
    config.rooms.forEach(room =>  {
      let r: Room = {
        Name: room.name,
        ContactItems: room.contactItems,
        LightItems: room.lightItems,
        MotionItems: room.motionItems,
        TemperatureItems: room.temperatureItems
      };
      c.Rooms.push(r);
    });

    let g: Globals = {
      ContactGroups: config.globals.contactGroups,
      LightGroups: config.globals.lightGroups,
      TemperatureGroups: config.globals.temperatureGroups,
    } 
    c.Globals = g;
    return c; 
  }
  */
}
