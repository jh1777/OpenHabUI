import { Globals } from './global';
import { Room } from './room';

export interface Config
{
    openHabUrl: string;
    globals: Globals;
    rooms: Room[]; 
}