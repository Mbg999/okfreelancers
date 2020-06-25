import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'starter-navbar',
  templateUrl: './starter.component.html',
  styleUrls: ['./starter.component.css']
})
export class StarterComponent {
  @Output('collapsed') public collapsed = new EventEmitter<boolean>();

}
