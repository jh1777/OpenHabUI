import { Component, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-rooms',
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.css']
})
export class RoomsComponent implements OnInit {

  rooms: string[] = [];
  constructor() { }

  ngOnInit(): void {
    let rooms = AppComponent.configuration.rooms;
    this.rooms = rooms.map(r => r.displayName);
  }

}
