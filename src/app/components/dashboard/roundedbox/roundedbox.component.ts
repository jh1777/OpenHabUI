import { Component, OnInit, Input } from '@angular/core';
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
  @Input() type: DataType;
  sliderValue: number;

  constructor() { 
  }

  ngOnInit(): void {
    if (this.type == DataType.Light) {
      this.sliderValue =  Number.parseInt(this.value);
    }
  }

}
