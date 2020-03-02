import { Globals } from './global';
import { Room } from './room';

export class Config
{
    openHabUrl: string;
    Globals: Globals;
    Rooms: Room[]; 
}