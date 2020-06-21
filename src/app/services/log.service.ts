import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { LogEntry, LogLevel } from './model/logEntry.model';
import { retry, catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import { ObservableService } from './observable.service';
import { ObservableEvents } from './model/observable.eventTypes';

@Injectable({
  providedIn: 'platform'
})

export class LoggingService {
  private loggingService = "http://localhost:4441/log";

  private static httpHeaders = new HttpHeaders()
    .set("Content-Type", "application/json");

  constructor(private http: HttpClient, private observableService: ObservableService) { 
    // Handle Log events from global events service
    this.observableService.on<LogEntry>(ObservableEvents.LOG, (data: LogEntry) => {
      this.logEntry(data).subscribe( 
        response => { if(!response.ok) console.log(response.body); },
        error => console.log("Logging Error occured: "+error)
      );
    });
  }

  private logEntry(entry: LogEntry): Observable<HttpResponse<string>> {
    return this.log(entry.message, entry.level, entry.context, entry.additionalData);
  }
  
  private log(message: string, level: LogLevel, context: string = null, additionalData: string = null): Observable<HttpResponse<string>> {
    let entry = new LogEntry(message, level, context, additionalData);
    return this.http.post<string>(this.loggingService, entry, { headers: LoggingService.httpHeaders, observe: 'response' })
      .pipe(
        retry(1),
        catchError(this.errorHandler)
      );
  }

  logInfo(message: string, context: string = null, additionalData: string = null): Observable<HttpResponse<string>> {
    return this.log(message, LogLevel.Info, context, additionalData);
  }

  logDebug(message: string, context: string = null, additionalData: string = null): Observable<HttpResponse<string>> {
    return this.log(message, LogLevel.Debug, context, additionalData);
  }

  logError(message: string, context: string = null, additionalData: string = null): Observable<HttpResponse<string>> {
    return this.log(message, LogLevel.Error, context, additionalData);
  }

  logWarning(message: string, context: string = null, additionalData: string = null): Observable<HttpResponse<string>> {
    return this.log(message, LogLevel.Warning, context, additionalData);
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
