import { OpenhabItem } from '../model/openhabItem';
import { Item } from 'src/app/models/config/item';
import { AppComponent } from 'src/app/app.component';
import { CategoryType } from 'src/app/models/config/category';

export class ItemPostProcessor {

   static ApplyConfigToItem = (item: OpenhabItem, itemConfig: Item = null): OpenhabItem => {
    if (itemConfig == null) {
      // Get config for Item
      let itemsFromTilesConfig = AppComponent.configuration.dashboardTiles.map(t => t.items);
      const flattenedArray: Item[] = [].concat(...itemsFromTilesConfig);
      itemConfig = flattenedArray.filter(i => i.name == item.name)[0];
    }
    if (itemConfig) {
      // set configured values in model
      item.category = CategoryType[itemConfig.category];
      item.label = itemConfig.displayName;
      
      
      if (itemConfig.unit) {
        item.unit = itemConfig.unit;
        item.transformedState = `${item.state} ${item.unit}`;
      }
      if (!item.transformedState) {
        item.transformedState = item.state;
      }
      if (itemConfig.warningThreshold) {
        if (!itemConfig.warningThresholdType || itemConfig.warningThresholdType == "lt") {
          item.hasWarning =  Number.isNaN(Number.parseFloat(item.state)) ? false : Number.parseFloat(item.state) <= itemConfig.warningThreshold;
        } else {
          item.hasWarning =  Number.isNaN(Number.parseFloat(item.state)) ? false : Number.parseFloat(item.state) >= itemConfig.warningThreshold;
        }
      }
      if(item.category == CategoryType.alert) {
        item.hasWarning = item.state == "ON";
      }
    }
    return item;
  }

}