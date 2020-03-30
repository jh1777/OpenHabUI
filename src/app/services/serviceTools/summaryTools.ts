import { SummaryEntry } from 'src/app/components/dashboard/summary/summaryEntry';
import { CategoryType } from 'src/app/models/config/category';
import { OpenhabItem } from '../model/openhabItem';
import { StateMapping } from './stateMapping';
import { Tools } from './tools';

export class SummaryTools {
    /**
     * Summary: Fill item into SummaryEntry
     */
    static FillSummary = (summaryItems: Map<string, SummaryEntry[]>, item: OpenhabItem) => {
        let category = CategoryType[item.category];

        // Create new SummaryEntry
        var s = new SummaryEntry();
        s.category = category;
        s.isGroup = item.members != null;
        s.order = Array.from(StateMapping.TriggeredStateByCategory.keys()).findIndex(cn => cn === item.category);
        s.items.push(item);

        if (summaryItems.has(category)) {
            var summaries = summaryItems.get(category);
            if (s.isGroup) {
                // if group create new summary entry
                summaries.push(s);
            } else {
                // if not append to first entry
                summaries[0].items.push(item);
            }
        } 
        else {
            var summaries: SummaryEntry[] = [];
            summaries.push(s);
            summaryItems.set(s.category, summaries);
        }
    }

    /**
     * Calculates the String Content of each Summary item based on the labels and states of the items
     * Returns the sorted array of categories (string) to ensure that they are displayed in order
     */
    static CalculateSummaryContent = (summaryItems: Map<string, SummaryEntry[]>, activityOnly: boolean): string[] => {
        let keys = Array.from(summaryItems.keys());
        keys.forEach(key => {
            var values = summaryItems.get(key);
            values.map(value => {
                if (!value.isGroup) {
                    // Set hasWarning if some of the items are in warning state
                    value.hasWarning = value.items.some(i => i.hasWarning);
                    // Set isCritical if some of the items are in critical state
                    value.isCritical = value.items.some(i => i.isCritical);

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
                } else {
                    // Group Calculation
                    value.content = value.items[0].transformedState;
                }
            });
        });

        // UI Categories to show: Summary Category Order according to state Mapping definition (only show non-Null content!) - distinct
        let flatSummaryList: SummaryEntry[] = [].concat(...summaryItems.values());
        let sortedSummaryList = flatSummaryList.filter(se => se.content != null).sort((a, b) => a.order - b.order);
        return Tools.DistinctValuesFromArray<SummaryEntry, string>(sortedSummaryList, s => s.category) 
    }

    
    private static calculateContent(entry: SummaryEntry, emptyContent: string, type: CategoryType) {
        var stateArray: string[] = [];
        entry.items.map(v => {
            if (v.state == StateMapping.TriggeredStateByCategory.get(type)) { 
                stateArray.push(v.label);
            }
        });

        if (stateArray.length > 0) {
            entry.content = stateArray.join(', ');
            entry.disabledIcon = false;
        } else {
            entry.content = emptyContent;
            entry.disabledIcon = true;
        }
    }

    private static calculateBatteryContent(entry: SummaryEntry, emptyContent: string) {
        var stateArray: string[] = [];
        entry.items.map(v => {
            if (v.isCritical || v.hasWarning) { 
                stateArray.push(`${v.label} (${v.transformedState})`);
            }
        });

        if (stateArray.length > 0) {
            entry.content = stateArray.join(', ');
            entry.disabledIcon = false;
        } else {
            entry.content = emptyContent;
            entry.disabledIcon = true;
        }
    }
    
}