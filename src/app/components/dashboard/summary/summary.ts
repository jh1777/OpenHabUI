import { OpenhabItem } from 'src/app/services/model/openhabItem';

export interface SummaryItem {
    category: string;
    items: OpenhabItem[];
    content: string;
    disabledIcon: boolean;
}