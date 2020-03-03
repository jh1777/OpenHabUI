import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap, retry } from 'rxjs/operators';
import * as config from '../../../config.json';
import { OpenhabGroup } from './model/openhabGroup';

@Injectable({
  providedIn: 'root'
})
export class OpenhabApiService {
  private url = `${config.openHabUrl}`;
  
  constructor(private http: HttpClient) { }

  static HttpOptions = new HttpHeaders({
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache'
//    'Access-Control-Allow-Origin': '*',
//    'Access-Control-Allow-Methods':'GET,POST,PATCH,DELETE,PUT,OPTIONS',
//    'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token, content-type'
  });

  getItems(itemName: string): Observable<OpenhabGroup> {
    let uri = `${this.url}/items/${itemName}`;
    return this.http.get<OpenhabGroup>(uri) //{headers: OpenhabApiService.HttpOptions })
      .pipe(
        tap(i => i.groupName = itemName),
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
