import { Component, Input } from '@angular/core';
import { Transaction } from 'src/app/interfaces/transaction';

// NG BOOTSTRAP
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-admin-user-transactions-modal',
  templateUrl: './admin-user-transactions-modal.component.html',
  styleUrls: ['./admin-user-transactions-modal.component.css']
})
export class AdminUserTransactionsModalComponent {

  @Input('transactions') public transactions: Transaction[];

  constructor(public activeModal: NgbActiveModal){}

}
