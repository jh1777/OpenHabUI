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
            s.items.push(item);
            summaryItems.set(s.category, s);
        }
    }

    static CalculateSummaryContent = (summaryItems: Map<string, SummaryEntry>) => {
        let keys = Array.from(summaryItems.keys());
        keys.forEach(key => {
            let value = summaryItems.get(key);
            switch (key) {
                case CategoryType[CategoryType.presence]:
                    SummaryTools.calculateContent(value, "Keiner da", CategoryType.presence);
                    break;
                case CategoryType[CategoryType.contact]:
                    SummaryTools.calculateContent(value, "Nichts geöffnet", CategoryType.contact);
                    break;
                case CategoryType[CategoryType.motion]:
                    SummaryTools.calculateContent(value, "Keine Bewegung", CategoryType.motion);
                default:
                    break;
            }
        });
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
    
}