import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import * as config from 'config.json';
import { OpenhabItem } from 'src/app/services/model/openhabItem';
import { OpenhabApiService } from 'src/app/services/openhab-api.service';
import { Globals } from 'src/app/config/model/global';
import { OpenhabGroup } from 'src/app/services/model/openhabGroup';
import { Config } from 'src/app/config/model/config';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  title = environment.title;
  group: OpenhabGroup;
  item: OpenhabItem;
  showModal: boolean = false;

  constructor(private api: OpenhabApiService) { 
    
  }

  ngOnInit() {
    let configuration: Globals = config.globals;
    this.api.getItems(configuration.contactGroups[0]).subscribe(res => this.group = res);
  }

  openModal($event, item) {
    $event.preventDefault();
    this.item = item;
    this.showModal = true;
  }
  closeModal() {
    this.showModal = false;
    this.item = null;
  }

}
