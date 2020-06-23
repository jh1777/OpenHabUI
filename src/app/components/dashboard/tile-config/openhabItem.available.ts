export class AvailableOpenhabItem {
    name: string;
    isGroup: boolean;

    constructor(name: string, isGroup: boolean) {
        this.name = name;
        this.isGroup = isGroup;
    }

    getDisplayName(): string {
        return `${this.name}${this.isGroup ? " (Group)":""}`;
    }
}