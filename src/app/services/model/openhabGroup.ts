import { OpenhabItem } from './openhabItem';

export interface OpenhabGroup {
    groupName: string;
    displayName: string;
    dataType: number;
    members: OpenhabItem[];
}