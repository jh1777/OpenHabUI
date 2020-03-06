import { Component } from '@angular/core';
import configuration from 'config.json';
import { Dashboard } from './models/config/dashboard';
import { Room } from './models/config//room';
import { Units } from './models/config/units';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent  {
  public static configuration: {openHabUrl:string, units:Units, dashboard:Dashboard, rooms:Room[]} = configuration;
}
