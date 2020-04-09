
import { CategoryType } from 'src/app/models/config/category';
import { OpenhabItem } from '../model/openhabItem';

export class StateMapping {

    static TriggeredStateByCategory: Map<CategoryType, string> = new Map<CategoryType, string>([
        [CategoryType.presence, "ON"],
        [CategoryType.alert, "ON"],
        [CategoryType.motion, "ON"],
        [CategoryType.contact, "OPEN"],
        [CategoryType.switch, "ON"],
        [CategoryType.rollershutter, ""],
        [CategoryType.battery, ""] // Placeholder only (used for order in summary)
    ]);

    static CalculateGroupState = (group: OpenhabItem) => {
        // Set Triggered State
        if (StateMapping.TriggeredStateByCategory.has(group.category)) {
            var triggeredItems: OpenhabItem[];
            if (group.category == CategoryType.battery || group.category == CategoryType.alert) {
                triggeredItems = group.members.filter(item => item.hasWarning || item.isCritical);
            } else {
                let triggeredState = StateMapping.TriggeredStateByCategory.get(group.category);
                triggeredItems = group.members.filter(item => triggeredState == item.state);
            }
            var stateLabel = "triggered";

            switch (group.category) {
                case CategoryType.alert:
                    stateLabel = "alerted";
                    break;
                case CategoryType.contact:
                    stateLabel = "open";
                    break;
                case CategoryType.switch:
                    stateLabel = "on";
                    break;
                case CategoryType.battery:
                    stateLabel = "not in threshold";
                    break;                    
                case CategoryType.temperature:
                    stateLabel = "not in threshold";
                    break;    
                default:
                    break;
            }

            group.transformedState = `${triggeredItems?.length}/${group.members.length} ${stateLabel}`;
        }
    }

}