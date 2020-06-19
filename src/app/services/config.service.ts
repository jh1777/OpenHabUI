import { Injectable } from '@angular/core';
import { IConfiguration } from './model/configuration-model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { retry, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs/internal/observable/throwError';
import configuration from '../../../config.json';
import { Tile } from '../models/config/tile';

@Injectable({
  providedIn: 'root'
})

export class ConfigService {
  public static EventId = "Config";
  private configUrl = "http://localhost:4441/config";

  public static configuration: IConfiguration = configuration;

  constructor(private http: HttpClient) { 
  }

  private static httpHeaders = new HttpHeaders()
    .set("Content-Type", "application/json");
  
  saveConfig(config: IConfiguration) {
    return this.http.post<string>(this.configUrl, config, { headers: ConfigService.httpHeaders, observe: 'response' })
      .pipe(
        retry(1),
        catchError(this.errorHandler)
      );
  }

  public addTile(): Tile {
    var tiles = configuration as IConfiguration;
    var tile = new Tile();
    tile.title = "";
    tile.items = [];
    tiles.dashboardTiles.push(tile);
    return tile;
  }

  public hasTiles(): boolean {
    return configuration.dashboardTiles.length > 0;
  }

  public hasItems(tile: Tile): boolean {
    if (tile.items == null) {
      return false;
    }
    return tile.items.length > 0;
  }

  public getTileWithName(name: string): Tile {
    if (!name) {
      return null;
    }
    var tiles = configuration.dashboardTiles.filter(t => t.title == name);
    if (tiles.length == 1) {
      return tiles[0];
    }
    return null;
  }

  private errorHandler(error: any) {
    let errorMessage = '';
    if(error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  } 
}