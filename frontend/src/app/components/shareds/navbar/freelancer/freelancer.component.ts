import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'freelancer-navbar',
  templateUrl: './freelancer.component.html',
  styleUrls: ['./freelancer.component.css']
})
export class FreelancerComponent {
  @Output('collapsed') public collapsed = new EventEmitter<boolean>();

}
