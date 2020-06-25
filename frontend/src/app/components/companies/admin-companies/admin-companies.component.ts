import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// SERVICES
import { CompanyService } from 'src/app/services/company.service';
import { DialogService } from 'src/app/services/dialog.service';
import { MultilangService } from 'src/app/services/multilang.service';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { BanService } from 'src/app/services/ban.service';
import { UserService } from 'src/app/services/user.service';

// INTERFACES
import { Company } from 'src/app/interfaces/company';

// NG BOOTSTRAP
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

// COMPONENTS
import { AdminCompaniesModalComponent } from '../admin-companies-modal/admin-companies-modal.component';

@Component({
  selector: 'app-admin-companies',
  templateUrl: './admin-companies.component.html',
  styleUrls: ['./admin-companies.component.css']
})
export class AdminCompaniesComponent implements OnInit {

  public originalCompanies: Company[];
  public companies: Company[];

  constructor(private _multilangService: MultilangService,
    private _companyService: CompanyService,
    private _dialogService: DialogService,
    private _authService: AuthService,
    private modalService: NgbModal,
    private _errorService: ErrorService,
    private route: ActivatedRoute,
    private router: Router,
    private _banService: BanService,
    private _userService: UserService) { }

  /**
   * Looks if the user want all the companies or only the one of a selected user
   */
  ngOnInit(): void {
    this.route.params.subscribe((params)=>{
      if(params.userId != 'all'){
        this.getCompanyOfAUser(params.userId);
      } else {
        this.getCompanies();
      }
    });
  }

  /**
   * retrieve all the companies, if this app grows up, this should change to a paginated
   * retrieving system
   */
  private getCompanies(): void {
    this._companyService.getCompaniesAsAdmin()
    .subscribe({
      next: (resp)=>{
        this.originalCompanies = resp.data;
        this.companies = JSON.parse(JSON.stringify(this.originalCompanies)); // deep clone
      },
      error: (err)=>{
        this._errorService.handeError(err.error);
      }
    });
  }

  /**
   * Gets the company associated to an user id
   * 
   * @param userId number
   */
  private getCompanyOfAUser(userId: number): void {
    this._companyService.getCompanyOfAUserAsAdmin(userId)
    .subscribe({
      next: (resp)=>{
        this.originalCompanies = resp.data;
        this.companies = JSON.parse(JSON.stringify(this.originalCompanies)); // deep clone
      },
      error: (err)=>{
        if(this._errorService.manipulableError(err.error) && err.status == 404){
          this.router.navigate(['/admin/users']);
        }
      }
    });
  }

  /**
   * Open the modal for create or update a company
   * 
   * @param id number
   */
  private openCompanymodal(id: number=null): Promise<any> {
    const modalRef: NgbModalRef = this.modalService.open(AdminCompaniesModalComponent,{
      scrollable: true,
      windowClass: 'animated fadeInDown faster'
    });
    
    modalRef.componentInstance.id = id;
    
    return modalRef.result;
  }

  /**
   * create a new company
   */
  public create(): void {
    this.openCompanymodal()
    .then((result)=>{
      if(result.user_id == this._userService.user.id){
        this._userService.addRole({id: 1, name: 'company'});
      }
      this.originalCompanies.push(result);
      this.companies.push(result);
      this.originalCompanies.sort((a,b)=>a.id-b.id);
      this.companies.sort((a,b)=>a.id-b.id);
    })
    .catch((err)=>{}); // nbBootstrap modal requirements
  }

  /**
   * Update a company from the table
   * the modal returns the updated company data
   * 
   * @param i number
   */
  public update(i:number): void {
    this.openCompanymodal(this.companies[i].id)
    .then((result)=>{
      this.originalCompanies.map((company, idx)=>{
        if(company.id = this.companies[i].id){
          this.originalCompanies[idx] = result;
        }
      });
      this.companies[i] = result;
    })
    .catch((err)=>{}); // nbBootstrap modal requirements
  }

  /**
   * ban or rehabilitate a company from the table,
   * by toggling the SoftDeleted field deleted_at
   * 
   * @param i number
   */
  public toggleDeleted_at(i: number): void {
    this._dialogService.danger( // dialog messages
      this._multilangService.translate('miscellaneous.sure_from_this_action'),
      this._multilangService.translate('miscellaneous.action_msg'),
      (this.companies[i].deleted_at) ? 
      this._multilangService.translate("miscellaneous.enable") :
      this._multilangService.translate("miscellaneous.ban") 
    )
    .then((result)=>{
      if(result.value){
        if(this.companies[i].deleted_at){ // its deactivated, lets activate it
          this._dialogService.loading();
          this._companyService.activateAsAdmin(this.companies[i].id)
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
            this._companyService.ban(this.companies[i].id, ban_reason)
            .subscribe({
              next: (resp)=>{
                this.saveToggleDeleted_at(i, ban_reason);
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
    this.companies[i].deleted_at = (ban_reason) ? 'deleted' : null; // just significant for know when is activated or not;
    this.companies[i].ban_reason = ban_reason;
    this.originalCompanies.map((company, idx)=>{
       if(company.id === this.companies[i].id){
        this.originalCompanies[idx].deleted_at = (ban_reason) ? 'deleted' : null; // just significant for know when is activated or not;
        this.originalCompanies[idx].ban_reason = ban_reason;
       }
    });
  }

  /**
   * Opens the ban reason modal, to show the reason of the ban
   * 
   * @param i number
   */
  public readBan_reason(i: number): void {
    this._banService.openBanReasonModal(this.companies[i].ban_reason);
  }

  /**
   * Permanent delete a company from the table
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
          this._dialogService.loading();
          this._companyService.deleteAsAdmin(this.companies[i].id)
            .subscribe({
              next: (resp)=>{
                if(this.companies[i].user_id == this._userService.user.id){
                  this._userService.removeRole(1);
                }
                this.originalCompanies.map((company, idx)=>{
                  if(company.id === this.companies[i].id){
                    this.originalCompanies.splice(idx, 1); // delete from our list
                  }
                });
                this.companies.splice(i,1);
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
      });
    }).catch((err)=>{}); // ngBootstrap modal requirements
  }

  /**
    * case insensitive search by email || name
    * 
    * @param search string
    */
   public search(search:string): void {
    if(!search){
      this.companies = JSON.parse(JSON.stringify(this.originalCompanies));
    } else {
      this.companies =  this.originalCompanies.filter(company => { // came cloned
        return company.email.toLowerCase().indexOf(search.toLowerCase()) > -1 ||
        company.name.toLowerCase().indexOf(search.toLowerCase()) > -1
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
