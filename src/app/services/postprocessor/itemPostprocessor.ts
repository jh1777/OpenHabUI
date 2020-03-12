import { OpenhabItem } from '../model/openhabItem';
import { Group } from 'src/app/models/config/group';
import { Room } from 'src/app/models/config/room';

export class ItemPostProcessor {

    static ReplaceLabelsInGroup = (items: OpenhabItem[], groups: Group[]): OpenhabItem[]  => {
        // replace all labels acording to config
        groups.forEach(group => {
            if (group.replaceInItemLabel && group.replaceInItemLabel?.length > 0) {
                group.replaceInItemLabel.forEach(label => items.forEach(item => item.label = item.label.replace(label, '')));
            }
        });
        return items;
    }
    static SetTransformedState = (item: OpenhabItem): OpenhabItem => {
        // set transformedState
        if (!item.transformedState) {
            item.transformedState = item.state;
        }
        if (item.transformedState.length > 10) {
            item.transformedState = item.transformedState.substr(0, 8) + "...";
        }
        if (item.unit) {
            item.transformedState = `${item.transformedState} ${item.unit}`;
        }
        return item;
    }

    static SetGroupProperties = (item: OpenhabItem, groups: Group[]): OpenhabItem => {
        // set category, unit
        let groupsMatch = groups.filter(g => item.groupNames.includes(g.name));
        groupsMatch.forEach(gm => {
            item.category = gm.category;
            item.unit = gm.unit;
        });
        return item;
    }

    static EnrichItem = (item: OpenhabItem, groups: Group[], rooms: Room[], groupName: string): OpenhabItem => {
        // set room
        item.room = rooms.filter(r => r.group == groupName)[0]?.displayName; 
        // set category, unit
        item = ItemPostProcessor.SetGroupProperties(item, groups);
        // set transformedState
        item = ItemPostProcessor.SetTransformedState(item);
        return item;
    }
}