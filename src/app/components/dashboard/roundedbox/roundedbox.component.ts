import { Component, OnInit, Input, NgZone } from '@angular/core';
import { DataType } from './datatype';
import { NgModel } from '@angular/forms';

@Component({
  selector: 'app-roundedbox',
  templateUrl: './roundedbox.component.html',
  styleUrls: ['./roundedbox.component.css']
})
export class RoundedboxComponent implements OnInit {
  @Input() value: string;
  @Input() label: string;
  @Input() type: string;
  @Input() unit: string;
  sliderValue: number;

  constructor(private zone: NgZone) { 
  }

  ngOnInit(): void {
    if (this.type == "light") {
      this.zone.run(() => {
        this.sliderValue =  Number.parseInt(this.value);
      });
    }
  }

  sliderChanged(event)
  {
    // TODO: Light slider was chnaged!
    
  }

}
