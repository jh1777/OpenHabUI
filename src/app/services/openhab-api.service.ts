import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, forkJoin } from 'rxjs';
import { catchError, map, tap, retry, observeOn } from 'rxjs/operators';
import { OpenhabGroup } from './model/openhabGroup';
import { OpenhabItem } from './model/openhabItem';
import { Room } from '../models/config/room';
import { AppComponent } from '../app.component';
import { ItemPostProcessor } from './serviceTools/itemPostprocessor';
import { OpenhabItemHistory } from './model/openhabItemHistory';

@Injectable({
  providedIn: 'root'
})
export class OpenhabApiService {
  private url = `${AppComponent.configuration.openHabUrl}`;
  rooms: Room[] = AppComponent.configuration.rooms;
  
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
      tap(g => {
        g = ItemPostProcessor.ApplyConfigToItem(g);
      }),
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

  getItemHistory(itemName: string): Observable<OpenhabItemHistory> {
    let uri = `${this.url}/persistence/items/${itemName}`;
    return this.http.get<OpenhabItemHistory>(uri) 
      .pipe(
        tap(g => {
          if (g.data.length > AppComponent.configuration.itemStateHistory) {
            g.data.splice(0, g.data.length - AppComponent.configuration.itemStateHistory);
          }
          // Convert unix time to Date
          g.data.forEach(s => {
            s.date = new Date(s.time);
          });
        }),
        retry(1),
        catchError(this.errorHandler)
    );
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
