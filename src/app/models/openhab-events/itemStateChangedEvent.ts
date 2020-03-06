export class ItemStateChangedEvent {
    Item: string;
    NewType: string;
    OldType: string;
    NewValue: string;
    OldValue: string;

    toString(): string 
    {
        return `ItemStateChangedEvent: Item=${this.Item}, Old State=${this.OldValue}, New State=${this.NewValue}`;
    }
}