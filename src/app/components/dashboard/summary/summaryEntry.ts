import { OpenhabItem } from 'src/app/services/model/openhabItem';

export class SummaryEntry {
    category: string;
    items: OpenhabItem[] = [];
    content: string;
    disabledIcon: boolean = false;
    order: number;
    hasWarning: boolean = false;
    isCritical: boolean = false;
    isGroup: boolean = false;
}