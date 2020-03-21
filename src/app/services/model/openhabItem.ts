import { CategoryType } from 'src/app/models/config/category';

export interface OpenhabItem {
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
    hasWarning: boolean; // from config derived e.g. for battery
    isCritical: boolean;
}