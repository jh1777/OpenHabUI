import { Component } from '@angular/core';
import { environment } from '../environments/environment';
import * as config from '../../config.json';
import { Config } from './config/model/config';
import { Room } from './config/model/room';
import { Globals } from './config/model/global';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  config = config.openHabUrl; //ConfigParser.ReadConfiguration().OpenHabUrl;
  title = environment.title;
  configuration: Config;

  constructor() {
  }

  ngOnInit() {
    this.configuration = this.ReadConfig();
  }

  ReadConfig(): Config {
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
}
