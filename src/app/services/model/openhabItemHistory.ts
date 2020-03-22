export class OpenhabItemHistory {
    name: string;
    data: OpenhabItemHistoryEntry[] = [];
}

export class OpenhabItemHistoryEntry {
    state: string;
    time: number;
    date: Date;
}