import { Component } from '@angular/core';
import configuration from 'config.json';
import { Dashboard } from './config/model/dashboard';
import { Room } from './config/model/room';
import { Units } from './config/model/units';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent  {
  public static configuration: {openHabUrl:string, units:Units, dashboard:Dashboard, rooms:Room[]} = configuration;
}
