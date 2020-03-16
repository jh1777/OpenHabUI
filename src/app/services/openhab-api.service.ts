import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, forkJoin } from 'rxjs';
import { catchError, map, tap, retry, observeOn } from 'rxjs/operators';
import * as config from '../../../config.json';
import { OpenhabGroup } from './model/openhabGroup';
import { OpenhabItem } from './model/openhabItem';
import { Room } from '../models/config/room';
import { AppComponent } from '../app.component';
import { Group } from '../models/config/group';
import { ItemPostProcessor } from './postprocessor/itemPostprocessor';

@Injectable({
  providedIn: 'root'
})
export class OpenhabApiService {
  private url = `${config.openHabUrl}`;
  rooms: Room[] = AppComponent.configuration.rooms;
  //groups: Group[] = AppComponent.configuration.groups;
  
  constructor(private http: HttpClient) { }

  static httpHeaders = new HttpHeaders()
    .set("Content-Type", "text/plain");

  setItemState(item: OpenhabItem, state: string): Observable<HttpResponse<string>>
  {
    let uri = `${this.url}/items/${item.name}`;
    
    return this.http.post<string>(uri, state, { headers: OpenhabApiService.httpHeaders, observe: 'response' })
      .pipe(
        retry(1),
        catchError(this.errorHandler)
      );
  }

  getItem(itemName: string): Observable<HttpResponse<OpenhabItem>> {
    let uri = `${this.url}/items/${itemName}`;
    return this.http.get<OpenhabItem>(uri, { observe: 'response' })
    .pipe(
      retry(1),
      catchError(this.errorHandler)
    );
  }

  getItemSimple(itemName: string): Observable<OpenhabItem> {
    let uri = `${this.url}/items/${itemName}`;
    return this.http.get<OpenhabItem>(uri)
    .pipe(
      retry(1),
      catchError(this.errorHandler)
    );
  }

  getRoomGroup(roomGroupName: string): Observable<OpenhabGroup> {
    let uri = `${this.url}/items/${roomGroupName}`;
    const intersection = (a, b) => { const s = new Set(b); return a.filter(x => s.has(x)); };
    return this.http.get<OpenhabGroup>(uri) //, { headers: OpenhabApiService.httpHeaders })
      .pipe(
        tap(g => {
          //let groups = this.groups.map(g => g.name);
          g.displayName = this.rooms.filter(r => r.groupName == g.name)[0]?.displayName;
          g.members.forEach(item => { 
            // set transformed state, item.category, item.unit, item.room
            // --> fix: item = ItemPostProcessor.EnrichItem(item, this.rooms, g.name);
          });
          // show only room items that are part of specified 'groups'?
          //if (AppComponent.configuration.filterByGroups) {
          //  g.members = g.members.filter(item => intersection(item.groupNames, groups).length > 0);
          //}
          
          // replace all labels acording to config
          //g.members = ItemPostProcessor.ReplaceLabelsInGroup(g.members, this.groups);

        }),
        retry(1),
        catchError(this.errorHandler)
      );
  }

  getItemsFromRoomGroups(groupNames: string[]): Observable<OpenhabGroup[]> {
    var calls: Observable<OpenhabGroup>[] = [];
    // Collect all gorup calls
    groupNames.forEach( group => {
      let call = this.getRoomGroup(group);
      calls.push(call);
    });
    // Execute all
    return forkJoin(calls);
  }

  getItems(itemNames: string[]): Observable<OpenhabItem[]> {
    var calls: Observable<OpenhabItem>[] = [];
    // Collect all gorup calls
    itemNames.forEach(item => {
      let call = this.getItemSimple(item);
      calls.push(call);
    });
    // Execute all
    return forkJoin(calls);
  }


  errorHandler(error: any) {
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
