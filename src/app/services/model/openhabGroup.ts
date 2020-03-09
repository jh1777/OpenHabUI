import { OpenhabItem } from './openhabItem';

export interface OpenhabGroup {
    name: string;
    displayName: string;
    members: OpenhabItem[];
}