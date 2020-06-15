import { Tile } from 'src/app/models/config/tile';

export interface IConfiguration {
    openHabUrl: string;
    itemStateHistory: number;
    showOnlyActivityInSummary: boolean;
    dashboardTiles: Tile[];
}