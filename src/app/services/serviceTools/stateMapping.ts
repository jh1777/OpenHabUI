
import { CategoryType } from 'src/app/models/config/category';

export class StateMapping {
    
    static TriggeredStateByCategory: Map<CategoryType, string> = new Map<CategoryType, string>([
        [CategoryType.presence, "ON" ],
        [CategoryType.alert, "ON"],
        [CategoryType.motion, "ON"],
        [CategoryType.contact, "OPEN"],
        [CategoryType.battery, ""] // Placeholder only (used for order in summary)
    ]);
    
}