import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'company-navbar',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.css']
})
export class CompanyComponent {
  @Output('collapsed') public collapsed = new EventEmitter<boolean>();

}
