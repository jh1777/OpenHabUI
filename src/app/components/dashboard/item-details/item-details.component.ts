import { Component } from '@angular/core';
import { OpenhabItem } from 'src/app/services/model/openhabItem';
import { ConfigService } from 'src/app/services/config.service';
import { OpenhabApiService } from 'src/app/services/openhab-api.service';
import { OpenhabItemHistory } from 'src/app/services/model/openhabItemHistory';

@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.component.html',
  styleUrls: ['./item-details.component.css']
})
export class ItemDetailsComponent  {
  open = false;
  item: OpenhabItem;
  stateHistory: OpenhabItemHistory;

  constructor(private service: OpenhabApiService) { }

  openDialog(item: OpenhabItem) {
    this.open = true;
    this.item = item;

    // Getting History from Openhab API
    this.service.getItemHistory(item.name, ConfigService.configuration.itemStateHistory).subscribe(history => {
      this.stateHistory = history;
    });
  }

  closeModal() {
    this.open = false;
    this.item = null;
    this.stateHistory = null;
  }
}
