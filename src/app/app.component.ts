import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { TileConfigComponent } from './components/dashboard/tile-config/tile-config.component';
import { ItemDetailsComponent } from './components/dashboard/item-details/item-details.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements AfterViewInit  {
  @ViewChild(TileConfigComponent) tileConfigDialog: TileConfigComponent;
  @ViewChild(ItemDetailsComponent) itemDetailsDialog: ItemDetailsComponent;

  // public static configuration: {openHabUrl:string, itemStateHistory: number, showOnlyActivityInSummary: boolean, dashboardTiles:Tile[]} = configuration;
  //public static configuration: IConfiguration = configuration;

  ngAfterViewInit(): void {
    this.tileConfigDialog.onSave.subscribe(tile => {
        //do something with tile result!
        if (tile) {
          console.log("Tile creation: "+ JSON.stringify(tile));
        }
    });
  }
}
