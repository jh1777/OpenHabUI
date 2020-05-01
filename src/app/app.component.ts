import { Component } from '@angular/core';
import configuration from 'config.json';
import { Tile } from './models/config/tile';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent  {
  public static configuration: {openHabUrl:string, itemStateHistory: number, showOnlyActivityInSummary: boolean, dashboardTiles:Tile[]} = configuration;
}
