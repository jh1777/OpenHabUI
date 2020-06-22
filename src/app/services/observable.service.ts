import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { EventData } from './model/event.model';

@Injectable({
	providedIn: 'root'
})

// Sample: https://github.com/hoangtranson/sample-communication-subject
export class ObservableService {
	private subject$ = new Subject();
	constructor() {}
	
	emit<T>(event: EventData<T>) {
		this.subject$.next(event);
	}
	
	on<T>(eventName: string, action: (data: T) => void): Subscription {
		return this.subject$
			.pipe(
				filter((event: EventData<T>) => event.name === eventName),
				map((event: EventData<T>) => event.value)
			)
			.subscribe(action);
	}
}