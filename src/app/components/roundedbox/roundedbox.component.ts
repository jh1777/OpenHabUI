import { Component, OnInit, Input } from '@angular/core';
import { DataType } from './datatype';

@Component({
  selector: 'app-roundedbox',
  templateUrl: './roundedbox.component.html',
  styleUrls: ['./roundedbox.component.css']
})
export class RoundedboxComponent implements OnInit {
  @Input() value: string;
  @Input() label: string;
  @Input() type: DataType;

  constructor() { 
  }

  ngOnInit(): void {

  }

}
