import { CategoryType } from 'src/app/models/config/category';

export class OpenhabItem {
    name: string;
    state: string;
    transformedState: string;
    type: string;
    label: string;
    groupNames: string[];
    // calculated
    room: string;  // from config
    category: CategoryType; //string; // from config
    unit: string;  // from config
    hasWarning: boolean = false; // from config derived e.g. for battery
    isCritical: boolean = false;
    // Summary
    showInSummary: boolean = false;
    showOnlyInSummary: boolean = false;
}