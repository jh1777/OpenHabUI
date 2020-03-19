export interface Item {  // V3
    name: string;
    displayName: string;
    category: string;
    unit?: string;
    warningThreshold?: number;
    warningThresholdType?: string;
    includeInSummary?: boolean;
}