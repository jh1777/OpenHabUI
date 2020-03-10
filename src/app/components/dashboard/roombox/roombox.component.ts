import { Component, OnInit, Input } from '@angular/core';
import { OpenhabItem } from 'src/app/services/model/openhabItem';
import { Group } from 'src/app/models/config/group';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-roombox',
  templateUrl: './roombox.component.html',
  styleUrls: ['./roombox.component.css']
})
export class RoomboxComponent implements OnInit {
  @Input() shape: string;
  @Input() data: OpenhabItem[];
  @Input() groupName: string;
  dataTypes: Group[] = AppComponent.configuration.groups;
  categories: string[];
  batteryWarning: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges() {
    // check battery
    this.data.filter(i => i.category == "battery").forEach(item => {
      var threshold = this.dataTypes.filter(t => t.category == "battery" && item.groupNames.includes(t.name))[0].warningThreshold;
      if (!threshold) {
        threshold = 0;
      }
      if (Number.parseInt(item.state) < threshold) {
        this.batteryWarning = true;
      }
    });
    // refine item transformedState 
    this.data.forEach(item =>{
      if (!item.transformedState) {
        item.transformedState = item.state;
      }
      if (item.transformedState.length > 8) {
        item.transformedState = item.transformedState.substr(0, 6)+"...";
      }
      if (item.unit) {
        item.transformedState = `${item.transformedState} ${item.unit}`;
      }
    });
    // only unique Categories for UI
    this.categories = [...new Set(this.data.map(d => d.category))].sort();
    // replace item labels for UI (maybe wrong place here!?)
    this.dataTypes.forEach(dataType => {
      if (dataType.replaceInItemLabel) {
        dataType.replaceInItemLabel.forEach(label => this.data.forEach(item => item.label = item.label.replace(label, '')));
      }
    });
  }
}