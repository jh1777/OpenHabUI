import { Component, OnInit, Input } from '@angular/core';
import { OpenhabItem } from 'src/app/services/model/openhabItem';

@Component({
  selector: 'app-categorybox',
  templateUrl: './categorybox.component.html',
  styleUrls: ['./categorybox.component.css']
})
export class CategoryboxComponent implements OnInit {

  @Input() data: OpenhabItem[];
  @Input() categoryName: string;
  @Input() itemsByCategory: Map<string, OpenhabItem[]>;
  
  constructor() { }

  ngOnInit(): void {
  }

}
