import { Dashboard } from './dashboard';
import { Room } from './room';
import { Units } from './units';

export interface Config
{
    openHabUrl: string;
    units: Units;
    dashboard: Dashboard;
    rooms: Room[]; 
}