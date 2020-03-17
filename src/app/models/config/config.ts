import { Room } from './room';
import { Tile } from './tile';

export interface Config
{
    openHabUrl: string;
    dashboardTiles: Tile[];
    rooms: Room[]; 
}