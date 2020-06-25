import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'administrator-navbar',
  templateUrl: './administrator.component.html',
  styleUrls: ['./administrator.component.css']
})
export class AdministratorComponent {
  @Output('collapsed') public collapsed = new EventEmitter<boolean>();

}
