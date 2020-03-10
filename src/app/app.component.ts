import { Component } from '@angular/core';
import configuration from 'config.json';
import iconMapping from 'icon-mapping.json';
import { Room } from './models/config//room';
import { Group } from './models/config/group';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent  {
  public static configuration: {openHabUrl:string, filterByGroups:boolean, groups:Group[], rooms:Room[]} = configuration;
  public static iconMapping: { rooms: {[key: string]: string} } = iconMapping;
}
