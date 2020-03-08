export interface OpenhabItem {
    name: string;
    state: string;
    transformedState: string;
    type: string;
    label: string;
    groupNames: string[];
    // calculated
    room: string;  // from config
    category: string; // from config
}