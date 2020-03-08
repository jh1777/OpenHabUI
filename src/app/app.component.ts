import { Component } from '@angular/core';
import configuration from 'config-v2.json';
import { Dashboard } from './models/config/dashboard';
import { Room } from './models/config//room';
import { Units } from './models/config/units';
import { Group } from './models/config/group';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent  {
  public static configuration: {openHabUrl:string, groups:Group[], rooms:Room[]} = configuration;
}
