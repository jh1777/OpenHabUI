import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { OpenhabItem } from 'src/app/services/model/openhabItem';
import { OpenhabApiService } from 'src/app/services/openhab-api.service';
import { Dashboard } from 'src/app/config/model/dashboard';
import { OpenhabGroup } from 'src/app/services/model/openhabGroup';
import { AppComponent } from 'src/app/app.component';
import { DataType } from 'src/app/components/dashboard/roundedbox/datatype';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  title = environment.title;
  item: OpenhabItem;
  groups: string[];
  items: Map<string, OpenhabGroup> = new Map<string, OpenhabGroup>();
  showModal: boolean = false;

  constructor(private api: OpenhabApiService) { 
  }

  ngOnInit() {
    let configuration: Dashboard = AppComponent.configuration.dashboard;

    this.api.getItems(configuration.contactGroup.name).subscribe(res => {
      res.members.forEach(m => m.label = m.label.replace("Kontakt", "").replace("Contact", ""));
      res.displayName = configuration.contactGroup.displayName;
      res.dataType = DataType.Contact;
      this.items.set(configuration.contactGroup.name, res);
      this.groups = Array.from(this.items.keys()).sort();
    });

    this.api.getItems(configuration.temperatureGroup.name).subscribe(res => {
      res.displayName = configuration.temperatureGroup.displayName;
      res.members.forEach(m => m.label = m.label.replace("Temperatur", "").replace("Temperature", ""));
      res.members.forEach(m => m.state = m.state.concat(" ", AppComponent.configuration.units.temperature));
      res.dataType = DataType.Temperature;
      this.items.set(configuration.temperatureGroup.name, res);
      this.groups = Array.from(this.items.keys()).sort();
    });

    this.api.getItems(configuration.lightGroup.name).subscribe(res => {
      res.displayName = configuration.lightGroup.displayName;
      res.dataType = DataType.Light;
      res.members.forEach(m => m.label = m.label.replace("Helligkeit", ""));
      this.items.set(configuration.lightGroup.name, res);
      this.groups = Array.from(this.items.keys()).sort();
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