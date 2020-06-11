import { Component } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'] 
})
export class ConfirmationModalComponent {
  destroy$: Subject<boolean> = new Subject();

  open = true;
  title = 'I have a nice title';
  text = 'But not much to say...';

  constructor() {}

  Clicked(result) {
    this.open = false;
    this.destroy$.next(result);
  }
}
