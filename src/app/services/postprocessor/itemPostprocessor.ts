import { OpenhabItem } from '../model/openhabItem';
import { Group } from 'src/app/models/config/group';
import { Room } from 'src/app/models/config/room';
import { Category } from 'src/app/models/config/category';
import { Item } from 'src/app/models/config/item';
import { AppComponent } from 'src/app/app.component';

export class ItemPostProcessor {

    /* old:
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

    static EnrichItem = (item: OpenhabItem, groups: Group[], rooms: Room[], groupName: string): OpenhabItem => {
        // set room
        item.room = rooms.filter(r => r.groupName == groupName)[0]?.displayName; 
        // set category, unit
        //item = ItemPostProcessor.SetGroupProperties(item, groups);
        // set transformedState
        item = ItemPostProcessor.SetTransformedState(item);
        return item;
    }
    */

   static ApplyConfigToItem = (item: OpenhabItem, itemConfig: Item = null): OpenhabItem => {
    if (itemConfig == null) {
      // Get config for Item
      let itemsFromTilesConfig = AppComponent.configuration.dashboardTiles.map(t => t.items);
      const flattenedArray: Item[] = [].concat(...itemsFromTilesConfig);
      itemConfig = flattenedArray.filter(i => i.name == item.name)[0];
    }
    if (itemConfig) {
      // set configured values in model
      item.category = itemConfig.category;
      item.label = itemConfig.displayName;
      if (itemConfig.unit) {
        item.unit = itemConfig.unit;
        item.transformedState = `${item.state} ${item.unit}`;
      }
      if (itemConfig.warningThreshold) {
        if (!itemConfig.warningThresholdType || itemConfig.warningThresholdType == "lt") {
          item.hasWarning =  Number.isNaN(Number.parseFloat(item.state)) ? false : Number.parseFloat(item.state) <= itemConfig.warningThreshold;
        } else {
          item.hasWarning =  Number.isNaN(Number.parseFloat(item.state)) ? false : Number.parseFloat(item.state) >= itemConfig.warningThreshold;
        }
      }
      if(item.category == "alert") {
        item.hasWarning = item.state == "ON";
      }
    }
    return item;
  }
}