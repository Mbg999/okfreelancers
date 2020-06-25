import { Component, Input, Output, EventEmitter } from '@angular/core';

// SERVICES
import { MultilangService } from 'src/app/services/multilang.service';

// INTERFACES
import { Transaction } from 'src/app/interfaces/transaction';

@Component({
  selector: 'app-my-balance-table',
  templateUrl: './my-balance-table.component.html',
  styleUrls: ['./my-balance-table.component.css']
})
export class MyBalanceTableComponent {

  @Input('transactions') public transactions: Transaction[];
  @Output('generatePDF') public generatePDF = new EventEmitter<boolean>();

  constructor(public _multilangService: MultilangService) { }

  
}
