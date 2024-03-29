export class EventData<T> {
	name: string;
	value: T;
	constructor(name: string, value: T) {
		this.name = name;
		this.value = value;
	}
}