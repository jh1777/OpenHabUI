import { Dashboard } from './dashboard';
import { Room } from './room';
import { Units } from './units';
import { Group } from './group';

export interface Config
{
    openHabUrl: string;
    groups: Group[];
    rooms: Room[]; 
}