import { OpenhabItem } from '../model/openhabItem';
import { Item } from 'src/app/models/config/item';
import { CategoryType } from 'src/app/models/config/category';
import { StateMapping } from './stateMapping';
import { ConfigService } from '../config.service';

export class ItemPostProcessor {

   static ApplyConfigToItem = (item: OpenhabItem, itemConfig: Item = null): OpenhabItem => {
    if (itemConfig == null) {
      // Get config for Item
      let itemsFromTilesConfig = ConfigService.configuration.dashboardTiles.map(t => t.items);
      const flattenedArray: Item[] = [].concat(...itemsFromTilesConfig);
      itemConfig = flattenedArray.filter(i => i.name == item.name)[0];
    }
    if (itemConfig) {
      // set configured values in model
      item.category = CategoryType[itemConfig.category];
      item.label = itemConfig.displayName;

      item.showInSummary = itemConfig.showInSummary;
      item.showOnlyInSummary = itemConfig.showOnlyInSummary;
      
      // States and Thesholf calculation
      ItemPostProcessor.ApplyStateAndThresholdsToItem(itemConfig, item);

      // Children if this is a group
      if (itemConfig.isGroup) {
        // Apply 
        item.members.map(i => {
          ItemPostProcessor.ApplyStateAndThresholdsToItem(itemConfig, i);
        });
        item.hasWarning = item.members.some(i => i.hasWarning);
        item.isCritical = item.members.some(i => i.isCritical);
        // Set Triggered State
        StateMapping.CalculateGroupState(item);
      }
    }
    return item;
  }

  private static ApplyStateAndThresholdsToItem(itemConfig: Item, item: OpenhabItem) {
    
    if (itemConfig.unit) {
      item.unit = itemConfig.unit;
      item.transformedState = `${item.state} ${item.unit}`;
    }
    if (!item.transformedState) {
      item.transformedState = item.state;
    }

    if (itemConfig.warningThreshold) {
      let stateAsNumber: number = Number.parseFloat(item.state);
      if (!itemConfig.warningThresholdType || itemConfig.warningThresholdType == "lt") {
        item.hasWarning =  Number.isNaN(stateAsNumber) ? false : stateAsNumber <= itemConfig.warningThreshold;
        item.isCritical = Number.isNaN(stateAsNumber) ? false : stateAsNumber == 0;
      } else {
        item.hasWarning =  Number.isNaN(stateAsNumber) ? false : stateAsNumber >= itemConfig.warningThreshold;
        item.isCritical = Number.isNaN(stateAsNumber) ? false : stateAsNumber == 100;
      }
    }
    if(item.category == CategoryType.alert) {
      item.isCritical = item.state == "ON";
    }
  }
}