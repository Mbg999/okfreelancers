import { Component, OnInit } from '@angular/core';

// SERVICES
import { UserService } from 'src/app/services/user.service';
import { TransactionService } from 'src/app/services/transaction.service';
import { ErrorService } from 'src/app/services/error.service';
import { MultilangService } from 'src/app/services/multilang.service';

// NG BOOTSTRAP
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

// COMPONENTS
import { MyBalanceModalComponent } from '../../myBalance/my-balance-modal/my-balance-modal.component';

// INTERFACES
import { User } from 'src/app/interfaces/user';
import { Transaction } from 'src/app/interfaces/transaction';


@Component({
  selector: 'app-my-balance',
  templateUrl: './my-balance.component.html',
  styleUrls: ['./my-balance.component.css']
})
export class MyBalanceComponent implements OnInit {

  public transactions: Transaction[];

  constructor(private modalService: NgbModal,
    private _userService: UserService,
    private _transactionService: TransactionService,
    private _errorService: ErrorService,
    public _multilangService: MultilangService) { }

  ngOnInit(): void {
    this.getTransactions();
  }

  private getTransactions(): void {
    this._transactionService.getMyTransactions()
    .subscribe({
      next: (resp)=>{
        this.transactions = resp.data;
      },
      error: (err)=>{
        this._errorService.handeError(err.error);
      }
    });
  }

  /**
   * Open the MyBalance modal
   * 
   * @param id number
   */
  public openMyBalanceModal(itsWithdraw: boolean=false): void {
    const modalRef: NgbModalRef = this.modalService.open(MyBalanceModalComponent,{
      scrollable: true,
      windowClass: 'animated fadeInDown faster'
    });
    
    modalRef.componentInstance.user = this.user;
    modalRef.componentInstance.itsWithdraw = itsWithdraw;

    modalRef.result
    .then((result)=>{
      this.transactions.unshift(result);
    })
    .catch((err)=>{}); // ngBootstrap requirements
  }

  public generatePDF(download: boolean): void {
    this._transactionService.generatePDF()
    .subscribe({
      next: (resp)=>{
        let pdfURL = window.URL.createObjectURL(resp);
        if(download){
          let link = document.createElement('a');
          link.href = pdfURL;
          link.download = this._multilangService.translate('user.transactions')+'.pdf';
          link.click();
        } else {
          window.open(pdfURL, '_blank');
        }
        setTimeout(()=>{
          window.URL.revokeObjectURL(pdfURL);
        }, 5000);
      },
      error: (err)=>{
        this._errorService.handeError(err.error);
      }
    });
  }

  // GETTERS
  get user(): User {
    return this._userService.user;
  }
}
