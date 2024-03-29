// Version 2
export interface Group {
    name: string; 
    displayName: string;
    unit: string;
    category: string;
    warningThreshold?: number | string;
    replaceInItemLabel?: string[];
}