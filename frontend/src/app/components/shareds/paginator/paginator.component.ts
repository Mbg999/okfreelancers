import { Component, Input, Output, EventEmitter } from '@angular/core';

// INTERFACES
import { Paginator } from 'src/app/interfaces/paginator';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.css']
})
export class PaginatorComponent {

  @Input('paginator') public paginator: Paginator;
  @Output('changePage') public changePage = new EventEmitter<number>();
  
}
