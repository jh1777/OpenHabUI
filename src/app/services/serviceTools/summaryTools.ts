
import { SummaryEntry } from 'src/app/components/dashboard/summary/summaryEntry';
import { CategoryType } from 'src/app/models/config/category';
import { OpenhabItem } from '../model/openhabItem';
import { StateMapping } from './stateMapping';

export class SummaryTools {

    categoryType: CategoryType;

    /**
     * Summary: Fill item into SummaryEntry
     */
    fillSummary = (summaryItems: Map<string, SummaryEntry>, item: OpenhabItem) => {
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

    calculateSummaryContent = (summaryItems: Map<string, SummaryEntry>) => {
        let keys = Array.from(summaryItems.keys());
        keys.forEach(key => {
            let value = summaryItems.get(key);
            switch (key) {
                case CategoryType[CategoryType.presence]:
                    this.calculateContent(value, "Keiner da", CategoryType.presence);
                    //this.presenceCalculation(value);
                    break;
                case CategoryType[CategoryType.contact]:
                    this.calculateContent(value, "Nichts geöffnet", CategoryType.contact);
                    //this.contactCalculation(value);
                    break;
                case CategoryType[CategoryType.motion]:
                    this.calculateContent(value, "Keine", CategoryType.motion);
                default:
                    break;
            }
        });
    }

    private presenceCalculation = (entry: SummaryEntry) => {
        var resultArray: string[] = [];
        entry.items.map(v => {
            if (v.state == StateMapping.TriggeredStateByCategory.get(CategoryType.presence)) { 
                resultArray.push(v.label);
            }
        });

        if (resultArray.length > 0) {
            entry.content = resultArray.join(', ');
            entry.disabledIcon = false;
        } else {
            entry.content = "Keiner Zuhause";
            entry.disabledIcon = true;
        }
    }

    private contactCalculation = (entry: SummaryEntry) => {
        var resultArray: string[] = [];
        entry.items.map(v => {
            if (v.state == StateMapping.TriggeredStateByCategory.get(CategoryType.contact)) { 
                resultArray.push(v.label);
            }
        });

        if (resultArray.length > 0) {
            entry.content = resultArray.join(', ');
            entry.disabledIcon = false;
        } else {
            entry.content = "Kein Fenster geöffnet";
            entry.disabledIcon = true;
        }
    }

    private calculateContent(entry: SummaryEntry, emptyContent: string, type: CategoryType) {
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