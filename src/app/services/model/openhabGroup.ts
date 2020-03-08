import { OpenhabItem } from './openhabItem';

export interface OpenhabGroup {
    name: string;
    //displayName: string;
    //dataType: number;
    members: OpenhabItem[];
}