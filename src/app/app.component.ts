import { Component } from '@angular/core';
import configuration from 'config.json';
import iconMapping from 'icon-mapping.json';
import { Room } from './models/config//room';
import { Tile } from './models/config/tile';
import { Category } from './models/config/category';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent  {
  public static configuration: {openHabUrl:string, itemStateHistory: number, dashboardTiles:Tile[], rooms:Room[], categories:Category[]} = configuration;
  public static iconMapping: { rooms: {[key: string]: string} } = iconMapping;
}
