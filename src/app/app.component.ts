import { Component } from '@angular/core';
//import configuration from 'config.json';
import { IConfiguration } from './services/model/configuration-model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent  {
  // public static configuration: {openHabUrl:string, itemStateHistory: number, showOnlyActivityInSummary: boolean, dashboardTiles:Tile[]} = configuration;
  //public static configuration: IConfiguration = configuration;
}
