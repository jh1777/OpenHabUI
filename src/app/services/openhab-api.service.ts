import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, forkJoin } from 'rxjs';
import { catchError, map, tap, retry } from 'rxjs/operators';
import * as config from '../../../config.json';
import { OpenhabGroup } from './model/openhabGroup';
import { OpenhabItem } from './model/openhabItem';
import { Room } from '../models/config/room';
import { AppComponent } from '../app.component';
import { Group } from '../models/config/group';

@Injectable({
  providedIn: 'root'
})
export class OpenhabApiService {
  private url = `${config.openHabUrl}`;
  rooms: Room[] = AppComponent.configuration.rooms;
  groups: Group[] = AppComponent.configuration.groups;
  
  constructor(private http: HttpClient) { }


  static httpHeaders = new HttpHeaders()
    .set("Content-Type", "application/json")
    .set("Cache-Control", "no-cache");

  getRoomGroup(roomGroupName: string): Observable<OpenhabGroup> {
    let uri = `${this.url}/items/${roomGroupName}`;
    const intersection = (a, b) => { const s = new Set(b); return a.filter(x => s.has(x)); };
    return this.http.get<OpenhabGroup>(uri) //, { headers: OpenhabApiService.httpHeaders })
      .pipe(
        tap(g => {
          let groups = this.groups.map(g => g.name);
          g.displayName = this.rooms.filter(r => r.group == g.name)[0]?.displayName;
          g.members.forEach(item => { 
            // set item.room
            item.room = this.rooms.filter(r => r.group == g.name)[0]?.displayName; 
            // set item.category, item.unit
            let groupsMatch = this.groups.filter(g => item.groupNames.includes(g.name));
            groupsMatch.forEach(gm => {
              item.category = gm.category;
              item.unit = gm.unit;
            });
          });
          // only part of specified groups?
          if (AppComponent.configuration.filterByGroups) {
            g.members = g.members.filter(item => intersection(item.groupNames, groups).length > 0);
          }
          
        }),
        retry(1),
        catchError(this.errorHandler)
      );
  }

  getItemsFromRoomGroups(groupNames: string[]): Observable<OpenhabGroup[]> {
    var result: OpenhabItem[] = [];
    var calls: Observable<OpenhabGroup>[] = [];
    // Collect all gorup calls
    groupNames.forEach( group => {
      let call = this.getRoomGroup(group);
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
