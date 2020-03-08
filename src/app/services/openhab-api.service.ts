import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, forkJoin } from 'rxjs';
import { catchError, map, tap, retry } from 'rxjs/operators';
import * as config from '../../../config.json';
import { OpenhabGroup } from './model/openhabGroup';
import { OpenhabItem } from './model/openhabItem.js';

@Injectable({
  providedIn: 'root'
})
export class OpenhabApiService {
  private url = `${config.openHabUrl}`;
  
  constructor(private http: HttpClient) { }


  static httpHeaders = new HttpHeaders()
    .set("Content-Type", "application/json")
    .set("Cache-Control", "no-cache");

  getGroup(groupName: string): Observable<OpenhabGroup> {
    let uri = `${this.url}/items/${groupName}`;
    return this.http.get<OpenhabGroup>(uri) //, { headers: OpenhabApiService.httpHeaders })
      .pipe(
        retry(1),
        catchError(this.errorHandler)
      );
  }

  getItemsFromGroups(groupNames: string[]): Observable<OpenhabGroup[]> {
    var result: OpenhabItem[] = [];
    var calls: Observable<OpenhabGroup>[] = [];
    // Collect all gorup calls
    groupNames.forEach( group => {
      let call = this.getGroup(group);
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
