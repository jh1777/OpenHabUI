import { SummaryEntry } from 'src/app/components/dashboard/summary/summaryEntry';
import { CategoryType } from 'src/app/models/config/category';
import { OpenhabItem } from '../model/openhabItem';
import { StateMapping } from './stateMapping';

export class SummaryTools {
    /**
     * Summary: Fill item into SummaryEntry
     */
    static FillSummary = (summaryItems: Map<string, SummaryEntry>, item: OpenhabItem) => {
        let category = CategoryType[item.category];
        if (summaryItems.has(category)) {
            summaryItems.get(category).items.push(item);
        } 
        else {
            var s = new SummaryEntry();
            s.category = CategoryType[item.category];
            s.order = Array.from(StateMapping.TriggeredStateByCategory.keys()).findIndex(cn => cn === item.category);
            s.items.push(item);
            summaryItems.set(s.category, s);
        }
    }

    static CalculateSummaryContent = (summaryItems: Map<string, SummaryEntry>, activityOnly: boolean): string[] => {
        let keys = Array.from(summaryItems.keys());
        keys.forEach(key => {
            let value = summaryItems.get(key);
            switch (key) {
                case CategoryType[CategoryType.presence]:
                    SummaryTools.calculateContent(value, activityOnly ? null : "Keiner da", CategoryType.presence);
                    break;
                case CategoryType[CategoryType.contact]:
                    SummaryTools.calculateContent(value, activityOnly ? null : "Alles geschlossen", CategoryType.contact);
                    break;
                case CategoryType[CategoryType.motion]:
                    SummaryTools.calculateContent(value, activityOnly ? null : "Keine Bewegung", CategoryType.motion);
                    break;
                case CategoryType[CategoryType.battery]:
                    SummaryTools.calculateBatteryContent(value, null);
                    break;
                default:
                    break;
            }
        });

        // UI Categories to show: Summary Category Order according to state Mapping definition (only show non-Null content!)
        return Array.from(summaryItems.values()).filter(se => se.content != null).sort((a, b) => a.order - b.order).map(se => se.category);

    }

    private static calculateContent(entry: SummaryEntry, emptyContent: string, type: CategoryType) {
        var resultArray: string[] = [];
        entry.items.map(v => {
            if (v.state == StateMapping.TriggeredStateByCategory.get(type)) { 
                resultArray.push(v.label);
            }
        });

        if (resultArray.length > 0) {
            entry.content = resultArray.join(', ');
            entry.disabledIcon = false;
        } else {
            entry.content = emptyContent;
            entry.disabledIcon = true;
        }
    }

    private static calculateBatteryContent(entry: SummaryEntry, emptyContent: string) {
        var resultArray: string[] = [];
        entry.items.map(v => {
            if (v.isCritical || v.hasWarning) { 
                resultArray.push(`${v.label} (${v.transformedState})`);
            }
        });

        if (resultArray.length > 0) {
            entry.content = resultArray.join(', ');
            entry.disabledIcon = false;
        } else {
            entry.content = emptyContent;
            entry.disabledIcon = true;
        }
    }
    
}