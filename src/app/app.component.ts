import { Component } from '@angular/core';
import configuration from 'config.json';
// import iconMapping from 'icon-mapping.json';
import { Room } from './models/config//room';
import { Tile } from './models/config/tile';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent  {
  public static configuration: {openHabUrl:string, itemStateHistory: number, showOnlyActivityInSummary: boolean, dashboardTiles:Tile[], rooms:Room[]} = configuration;
  // maybe later: public static iconMapping: { rooms: {[key: string]: string} } = iconMapping; -- removed 22.03.20
}
