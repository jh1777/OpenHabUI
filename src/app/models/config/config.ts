import { Room } from './room';
import { Group } from './group';

export interface Config
{
    openHabUrl: string;
    filterByGroups: boolean;
    groups: Group[];
    rooms: Room[]; 
}