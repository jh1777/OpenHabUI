import { OpenhabItem } from './openhabItem';

export interface OpenhabGroup {
    groupName: string;
    displayName: string;
    members: OpenhabItem[];
}