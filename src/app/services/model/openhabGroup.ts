import { OpenhabItem } from './openhabItem';

export interface OpenhabGroup {
    groupName: string;
    members: OpenhabItem[];
}