export class Item { 
    // Name of the OpenHab Item or Group
    name: string;
    // Visual representation in UI
    displayName: string;
    // UI Category - see Readme
    category: string;
    // Optional: Unit to display (e.g. "%", "°C", etc.)
    unit?: string;
    // Optional: Is this item a group in OpenHab?
    isGroup?: boolean;
    // Warning threshold value until it gets in Status hasWarning
    warningThreshold?: number;
    // Threshold typ ("lt", "gt" supported)
    warningThresholdType?: string;
    // Show this Item in Summary Bar (don't use if you use showOnlyInSummary)
    showInSummary?: boolean = false;
    // Show this Item in Summary Bar ONLY, not in any Tiles (don't use if you use showInSummary)
    showOnlyInSummary?: boolean = false;
}