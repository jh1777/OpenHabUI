import { Injectable } from '@angular/core';
import { IConfiguration } from './model/configuration-model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { retry, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs/internal/observable/throwError';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  private configUrl = "http://localhost:4441/config";

  constructor(private http: HttpClient) { }

  private static httpHeaders = new HttpHeaders()
    .set("Content-Type", "application/json");
  
  saveConfig(config: IConfiguration) {
    return this.http.post<string>(this.configUrl, config, { headers: ConfigService.httpHeaders, observe: 'response' })
      .pipe(
        retry(1),
        catchError(this.errorHandler)
      );
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