import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// SERVICES
import { UserService } from 'src/app/services/user.service';
import { DialogService } from 'src/app/services/dialog.service';
import { MultilangService } from 'src/app/services/multilang.service';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { BanService } from 'src/app/services/ban.service';
import { TransactionService } from 'src/app/services/transaction.service';

// INTERFACES
import { User } from 'src/app/interfaces/user';

// NG BOOTSTRAP
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

// COMPONENTS
import { AdminUserModalComponent } from '../admin-user-modal/admin-user-modal.component';
import { AdminUserTransactionsModalComponent } from '../admin-user-transactions-modal/admin-user-transactions-modal.component';

@Component({
  selector: 'app-admin-user',
  templateUrl: './admin-user.component.html',
  styleUrls: ['./admin-user.component.css']
})
export class AdminUserComponent implements OnInit {

  public originalUsers: User[];
  public users: User[];

  constructor(private _multilangService: MultilangService,
    private _userService: UserService,
    private _dialogService: DialogService,
    private _authService: AuthService,
    private modalService: NgbModal,
    private _errorService: ErrorService,
    private _banService: BanService,
    private _transactionService: TransactionService,
    private router: Router) { }

  ngOnInit(): void {
    this.getUsers();
  }

  /**
   * retrieve all the users, if this app grows up, this should change to a paginated
   * retrieving system
   */
  private getUsers(): void {
    this._userService.getAllUsers()
    .subscribe({
      next: (resp)=>{
        this.originalUsers = resp.data;
        this.users = JSON.parse(JSON.stringify(this.originalUsers)); // deep clone
      },
      error: (err)=>{
        this._errorService.handeError(err.error);
      }
    });
  }

    /**
     * Open the modal for register or update an user
     * 
     * @param id number
     */
    private openUsermodal(id: number=null): NgbModalRef {
      const modalRef: NgbModalRef = this.modalService.open(AdminUserModalComponent,{
        scrollable: true,
        size: "xl",
        windowClass: 'animated fadeInDown faster'
      });
      
      modalRef.componentInstance.id = id;
      
      return modalRef
    }

    /**
     * Open the modal for register or update an user
     * 
     * @param id number
     */
    public openTransactionsModal(i: number): NgbModalRef {
      const modalRef: NgbModalRef = this.modalService.open(AdminUserTransactionsModalComponent,{
        scrollable: true,
        size: "xl",
        windowClass: 'animated fadeInDown faster'
      });

      this._transactionService.getTransactionsAsAdmin(this.users[i].id)
      .subscribe({
        next: (resp)=>{
          modalRef.componentInstance.transactions = resp.data;
        },
        error: (err)=>{
          this._errorService.handeError(err.error);
        }
      });
      
      return modalRef
    }

    /**
     * register a new user
     */
    public registerNewUser(): void {
      this.openUsermodal().result
      .then((result)=>{
        this.getUsers();
        /* cant return the new user data for a push because
        the register system is the same for all*/
      })
      .catch((err)=>{}); // nbBootstrap modal requirements
    }

    /**
     * Update an user from the table
     * the modal returns the updated user data
     * 
     * @param i number
     */
    public update(i:number): void {
      this.openUsermodal(this.users[i].id).componentInstance.updated
      .subscribe({
        next: (resp)=>{
           this.originalUsers.map((user, idx)=>{
            if(user.id = this.users[i].id){
              this.originalUsers[idx] = resp;
            }
          });
          this.users[i] = resp;
        },
        error: (err)=>{} // ngBootstrap requirements
      });
    }

    /**
     * ban or rehabilitate a user from the table,
     * by toggling the SoftDeleted field deleted_at
     * 
     * @param i number
     */
    public toggleDeleted_at(i: number): void {
      this._dialogService.danger( // dialog messages
        this._multilangService.translate('miscellaneous.sure_from_this_action'),
        this._multilangService.translate('miscellaneous.action_msg'),
        (this.users[i].deleted_at) ? 
        this._multilangService.translate("miscellaneous.enable") :
        this._multilangService.translate("miscellaneous.ban") 
      )
      .then((result)=>{
        if(result.value){
          if(this.users[i].deleted_at){ // its deactivated, lets activate it
            this._dialogService.loading();
            this._userService.activateAsAdmin(this.users[i].id)
            .subscribe({
              next: (resp)=>{
                this.saveToggleDeleted_at(i);
                this._dialogService.close();
              },
              error: (err)=>{
                this._dialogService.close();
                this._errorService.handeError(err.error);
              }
            });
          } else { // its activated, lets deactivate it
            this._banService.openBanReasonModal()
            .then((ban_reason)=>{
              this._dialogService.loading();
              this._userService.ban(this.users[i].id, ban_reason)
              .subscribe({
                next: (resp)=>{
                  if(this.users[i].id == this._userService.user.id){
                    this._dialogService.close();
                    this._userService.logout() // testing that its banned
                    .subscribe({
                      error: (err)=>{
                        this._errorService.handeError(err.error);
                      }
                    });
                  } else {
                    this.saveToggleDeleted_at(i, ban_reason);
                    this._dialogService.close();
                  }
                  
                },
                error: (err)=>{
                  this._dialogService.close();
                  if(this._errorService.manipulableError(err.error)){
                    if(err.error.errors.pending){
                      this._dialogService.error(err.error.errors.pending);
                    }
                  }
                }
              });
            }).catch((err)=>{}); // nbBootstrap modal requirements
          }
        }
      });
    }

    /**
     * stores the toggle changes instead or make another http request
     * 
     * @param i number
     * @param ban_reason string
     */
    private saveToggleDeleted_at(i:number, ban_reason:string=null): void {
      this.users[i].deleted_at = (ban_reason) ? 'deleted' : null; // just significant for know when is activated or not
      this.users[i].ban_reason = ban_reason;
      this.originalUsers.map((user, idx)=>{
         if(user.id === this.users[i].id){
          this.originalUsers[idx].deleted_at = (ban_reason) ? 'deleted' : null; // just significant for know when is activated or not
          this.originalUsers[idx].ban_reason = ban_reason;
         }
      });
    }

    /**
     * Opens the ban reason modal, to show the reason of the ban
     * 
     * @param i number
     */
    public readBan_reason(i: number): void {
      this._banService.openBanReasonModal(this.users[i].ban_reason);
    }

    /**
     * Permanent delete an user from the table
     * ask for security auth
     * ask for if you are sure of this action
     * 
     * @param i number
     */
    public delete(i:number): void {
      this._authService.securityAuth()
      .then((result)=>{
        this._dialogService.danger( // dialog messages
          this._multilangService.translate('miscellaneous.delete'),
          this._multilangService.translate('miscellaneous.delete_msg'),
          this._multilangService.translate("miscellaneous.delete")
        )
        .then((result)=>{
          if(result.value){
            if(this.users[i].balance > 0){
              this._dialogService.inputEmail()
              .then((result)=>{
                if(result.value) this.sendDelete(i, result.value);
              });
            } else {
              this.sendDelete(i);
            }
          }
        });
      }).catch((err)=>{}); // ngBootstrap modal requirements
    }

    private sendDelete(i: number, emailForPaypalPayment: string=""): void {
      this._dialogService.loading();
      this._userService.deleteAsAdmin(this.users[i].id, emailForPaypalPayment)
      .subscribe({
        next: (resp)=>{
          if(this.users[i].id == this._userService.user.id){
            this._userService.removeAuthData();
            this.router.navigate(['/']);
          } else {
            this.originalUsers.map((user, idx)=>{
              if(user.id === this.users[i].id){
                this.originalUsers.splice(idx, 1); // delete from our list
              }
            });
            this.users.splice(i,1);
          }
          this._dialogService.close();
          
        },
        error: (err)=>{
          this._dialogService.close();
          if(this._errorService.manipulableError(err.error)){
            if(err.error.errors.pending){
              this._dialogService.error(err.error.errors.pending);
            }
          }
        }
      });
    }

  /**
    * case insensitive search by name_en || name_es
    * 
    * @param search string
    */
   public search(search:string): void {
    if(!search){
      this.users = JSON.parse(JSON.stringify(this.originalUsers));
    } else {
      this.users =  this.originalUsers.filter(user => { // came cloned
        return user.email.toLowerCase().indexOf(search.toLowerCase()) > -1 ||
        user.name.toLowerCase().indexOf(search.toLowerCase()) > -1 ||
        user.surnames.toLowerCase().indexOf(search.toLowerCase()) > -1
      });
    }
  }
  
  /**
  * clears the search bar by clicking the cross on it
  * 
  * @param field input
  */
  public clearSearchBar(field:any): void {
    field.value = "";
    this.search("");
  }
}
