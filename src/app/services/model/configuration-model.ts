import { Tile } from 'src/app/models/config/tile';

export class Configuration {
    openHabUrl: string;
    itemStateHistory: number;
    showOnlyActivityInSummary: boolean;
    dashboardTiles: Tile[];
}