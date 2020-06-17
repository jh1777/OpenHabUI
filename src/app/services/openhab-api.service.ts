import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, forkJoin } from 'rxjs';
import { catchError, map, tap, retry, switchMap } from 'rxjs/operators';
import { OpenhabItem } from './model/openhabItem';
import { ItemPostProcessor } from './serviceTools/itemPostprocessor';
import { OpenhabItemHistory, OpenhabItemHistoryEntry } from './model/openhabItemHistory';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class OpenhabApiService {
  private url = `${ConfigService.configuration.openHabUrl}`;
  
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
      tap(g => g = ItemPostProcessor.ApplyConfigToItem(g)),
      retry(1),
      catchError(this.errorHandler)
    );
  }

  getGroup(groupName: string): Observable<OpenhabItem> {
    let uri = `${this.url}/items/${groupName}`;
    // for reference only: const intersection = (a, b) => { const s = new Set(b); return a.filter(x => s.has(x)); };
    return this.http.get<OpenhabItem>(uri) //, { headers: OpenhabApiService.httpHeaders })
      .pipe(
        tap(g => g = ItemPostProcessor.ApplyConfigToItem(g)),
        retry(1),
        catchError(this.errorHandler)
      );
  }

  getItemsFromGroups(groupNames: string[]): Observable<OpenhabItem[]> {
    var calls: Observable<OpenhabItem>[] = [];
    // Collect all gorup calls
    groupNames.forEach( group => {
      let call = this.getGroup(group);
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

  private postProcessItemHistoryData = (entries: OpenhabItemHistoryEntry[], historyValueCount: number) => {
    if (entries.length > historyValueCount) {
      entries.splice(0, entries.length - historyValueCount);
    }
    // Convert unix time to Date
    entries.forEach(s => {
      s.date = new Date(s.time);
    });
  }
  
  getItemHistory1h(itemName: string, historyValueCount: number): Observable<OpenhabItemHistory> {
    let startTime = new Date();
    startTime.setHours(startTime.getHours() - 1);
    var formattedStartTime = `${startTime.getFullYear()}-${this.pad(startTime.getMonth()+1)}-${this.pad(startTime.getDate())}T${this.pad(startTime.getHours())}:${this.pad(startTime.getMinutes())}:${this.pad(startTime.getSeconds())}`;
    let uri = `${this.url}/persistence/items/${itemName}?starttime=${formattedStartTime}`;
    return this.http.get<OpenhabItemHistory>(uri) 
      .pipe(
        tap(g => this.postProcessItemHistoryData(g.data, historyValueCount)),
        retry(1),
        catchError(this.errorHandler)
    );
  }

  getItemHistory1d(itemName: string, historyValueCount: number): Observable<OpenhabItemHistory> {
    let uri = `${this.url}/persistence/items/${itemName}`;
    return this.http.get<OpenhabItemHistory>(uri) 
      .pipe(
        tap(g => this.postProcessItemHistoryData(g.data, historyValueCount)),
        retry(1),
        catchError(this.errorHandler)
    );
  }

  /**
   * Get Item History - first try 1 hr and if neccessary, query 1 day 
   * @param itemName 
   * @param historyValueCount 
   */
  getItemHistory(itemName: string, historyValueCount: number): Observable<OpenhabItemHistory> {
    return this.getItemHistory1h(itemName, historyValueCount)
    .pipe(
      switchMap( r => r.data.length >= historyValueCount ? this.getItemHistory1h(itemName, historyValueCount) : this.getItemHistory1d(itemName, historyValueCount)),
      retry(1),
      catchError(this.errorHandler)
    );
  }

  private pad = function(n: number): string {
    if (n < 10) {
      return `0${n}`;
    } else {
      return `${n}`;
    }
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