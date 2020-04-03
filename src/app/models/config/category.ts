export interface Category {
    displayName: string;
    unit: string;
    category: string;
    replaceInItemLabel: string[];
}

export enum CategoryType {
    temperature,
    contact,
    motion,
    alert,
    battery,
    dimmer,
    switch,
    sun,
    presence,
    heating,
    rollershutter
}