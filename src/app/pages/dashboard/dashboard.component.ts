import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { OpenhabItem } from 'src/app/services/model/openhabItem';
import { OpenhabApiService } from 'src/app/services/openhab-api.service';
import { Dashboard } from 'src/app/config/model/dashboard';
import { OpenhabGroup } from 'src/app/services/model/openhabGroup';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  title = environment.title;
  item: OpenhabItem;
  items: Map<string, OpenhabGroup> = new Map<string, OpenhabGroup>();
  showModal: boolean = false;

  constructor(private api: OpenhabApiService) { 
  }

  ngOnInit() {
    let configuration: Dashboard = AppComponent.configuration.dashboard;

    this.api.getItems(configuration.contactGroup.name).subscribe(res => {
      res.members.forEach(m => m.label = m.label.replace("Kontakt", "").replace("Contact", ""));
      res.displayName = configuration.contactGroup.displayName;
      this.items.set(configuration.contactGroup.name, res);
    });

    this.api.getItems(configuration.temperatureGroup.name).subscribe(res => {
      res.displayName = configuration.temperatureGroup.displayName;
      res.members.forEach(m => m.label = m.label.replace("Temperatur", "").replace("Temperature", ""));
      res.members.forEach(m => m.state = m.state.concat(" ", AppComponent.configuration.units.temperature));
      this.items.set(configuration.temperatureGroup.name, res);
    });

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