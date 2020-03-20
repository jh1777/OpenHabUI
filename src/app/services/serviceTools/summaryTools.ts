
import { SummaryEntry } from 'src/app/components/dashboard/summary/summaryEntry';
import { CategoryType } from 'src/app/models/config/category';
import { OpenhabItem } from '../model/openhabItem';
import { ChangeDetectorRef } from '@angular/core';

export class SummaryTools {

    categoryType: CategoryType;
    stateMapping: Map<CategoryType, string> = new Map<CategoryType, string>();

    constructor() {
        this.stateMapping.set(CategoryType.presence, "ON");
    }

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
                     this.presenceCalculation(value);
                    break;
            
                default:
                    break;
            }
        });
    }

    private presenceCalculation = (entry: SummaryEntry) => {
        var resultArray: string[] = [];
        entry.items.map(v => {
            if (v.state == this.stateMapping.get(CategoryType.presence)) { 
                resultArray.push(v.label);
            }
        });
        entry.content = resultArray.join(', ');
    }

    
}