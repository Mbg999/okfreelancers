import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// SERVICES
import { FreelancerService } from 'src/app/services/freelancer.service';
import { DialogService } from 'src/app/services/dialog.service';
import { MultilangService } from 'src/app/services/multilang.service';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { BanService } from 'src/app/services/ban.service';
import { UserService } from 'src/app/services/user.service';

// INTERFACES
import { Freelancer } from 'src/app/interfaces/freelancer';

// NG BOOTSTRAP
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

// COMPONENTS
import { AdminFreelancersModalComponent } from '../admin-freelancers-modal/admin-freelancers-modal.component';
import { AdminPortfolioModalComponent } from '../portfolio/admin-portfolio-modal/admin-portfolio-modal.component';

@Component({
  selector: 'app-admin-freelancers',
  templateUrl: './admin-freelancers.component.html',
  styleUrls: ['./admin-freelancers.component.css']
})
export class AdminFreelancersComponent implements OnInit {

  public originalFreelancers: Freelancer[];
  public freelancers: Freelancer[];

  constructor(private _multilangService: MultilangService,
    private _freelancerService: FreelancerService,
    private _dialogService: DialogService,
    private _authService: AuthService,
    private modalService: NgbModal,
    private _errorService: ErrorService,
    private route: ActivatedRoute,
    private router: Router,
    private _banService: BanService,
    private _userService: UserService) { }

  /**
   * Looks if the user want all the freelaner profiles or only the ones of a selected user
   */
  ngOnInit(): void {
    this.route.params.subscribe((params)=>{
      if(params.userId != 'all'){
        this.getFreelancersOfAUser(params.userId);
      } else {
        this.getFreelancers();
      }
    });
  }

  /**
   * get all the freelancers, if this app grows up, this should change to a paginated
   * retrieving system
   */
  private getFreelancers(): void {
    this._freelancerService.getFreelancersAsAdmin()
    .subscribe({
      next: (resp)=>{
        this.originalFreelancers = resp.data;
        this.freelancers = JSON.parse(JSON.stringify(this.originalFreelancers)); // deep clone
      },
      error: (err)=>{
        this._errorService.handeError(err.error);
      }
    });
  }

  /**
     * Gets all the freelancer profiles associated to an user id
     * 
     * @param userId number
     */
  private getFreelancersOfAUser(userId: number): void {
    this._freelancerService.getFreelancersOfAUserAsAdmin(userId)
    .subscribe({
      next: (resp)=>{
        this.originalFreelancers = resp.data;
        this.freelancers = JSON.parse(JSON.stringify(this.originalFreelancers)); // deep clone
      },
      error: (err)=>{
        if(this._errorService.manipulableError(err.error) && err.status == 404){
          this.router.navigate(['/admin/users']);
        }
      }
    });
  }

    /**
     * Open the modal for create or update a freelancer
     * 
     * @param id number
     */
    private openFreelancermodal(id: number=null): Promise<any> {
      const modalRef: NgbModalRef = this.modalService.open(AdminFreelancersModalComponent,{
        scrollable: true,
        windowClass: 'animated fadeInDown faster'
      });
      
      modalRef.componentInstance.id = id;
      
      return modalRef.result;
    }

    /**
     * create a new freelancer
     */
    public create(): void {
      this.openFreelancermodal()
      .then((result)=>{
        if(result.data.user_id == this._userService.user.id && result.addRole){
          this._userService.addRole({id: 2, name: 'freelancer'});
        }
        this.originalFreelancers.push(result.data);
        this.freelancers.push(result.data);
        this.originalFreelancers.sort((a,b)=>a.id-b.id);
        this.freelancers.sort((a,b)=>a.id-b.id);
      })
      .catch((err)=>{}); // nbBootstrap modal requirements
    }

    /**
     * Update a freelancer profile from the table
     * the modal returns the updated freelancer data
     * 
     * @param i number
     */
    public update(i:number): void {
      this.openFreelancermodal(this.freelancers[i].id)
      .then((result)=>{
        this.originalFreelancers.map((freelancer, idx)=>{
          if(freelancer.id = this.freelancers[i].id){
            this.originalFreelancers[idx] = result;
          }
        });
        this.freelancers[i] = result;
      })
      .catch((err)=>{}); // nbBootstrap modal requirements
    }

    /**
     *  ban or rehabilitate a freelancer from the table,
     * by toggling the SoftDeleted field deleted_at
     * 
     * @param i number
     */
    public toggleDeleted_at(i: number): void {
      this._dialogService.danger( // dialog messages
        this._multilangService.translate('miscellaneous.sure_from_this_action'),
        this._multilangService.translate('miscellaneous.action_msg'),
        (this.freelancers[i].deleted_at) ? 
        this._multilangService.translate("miscellaneous.enable") :
        this._multilangService.translate("miscellaneous.ban") 
      )
      .then((result)=>{
        if(result.value){
          if(this.freelancers[i].deleted_at){ // its deactivated, lets activate it
            this._dialogService.loading();
            this._freelancerService.activateAsAdmin(this.freelancers[i].id)
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
              this._freelancerService.ban(this.freelancers[i].id, ban_reason)
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
      this.freelancers[i].deleted_at = (ban_reason) ? 'deleted' : null; // just significant for know when is activated or not
      this.freelancers[i].ban_reason = ban_reason;
      this.originalFreelancers.map((freelancer, idx)=>{
         if(freelancer.id === this.freelancers[i].id){
          this.originalFreelancers[idx].deleted_at = (ban_reason) ? 'deleted' : null; // just significant for know when is activated or not
          this.originalFreelancers[idx].ban_reason = ban_reason;
         }
      });
    }

    /**
     * Opens the ban reason modal, to show the reason of the ban
     * 
     * @param i number
     */
    public readBan_reason(i: number): void {
      this._banService.openBanReasonModal(this.freelancers[i].ban_reason);
    }

    /**
     * Permanent delete a freelancer profile from the table
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
            this._freelancerService.deleteAsAdmin(this.freelancers[i].id)
              .subscribe({
                next: (resp)=>{
                  if(this.freelancers[i].user_id == this._userService.user.id && resp.removeRole){
                    this._userService.removeRole(2);
                  }
                  this.originalFreelancers.map((freelancer, idx)=>{
                    if(freelancer.id === this.freelancers[i].id){
                      this.originalFreelancers.splice(idx, 1); // delete from our list
                    }
                  });
                  this.freelancers.splice(i,1);
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
   * Opens the portfolio modal
   * @param i number
   */
  public viewPortfolio(i: number): void {
    const modalRef: NgbModalRef = this.modalService.open(AdminPortfolioModalComponent,{
      scrollable: true,
      size: 'xl',
      windowClass: 'animated fadeInDown faster'
    });
    
    modalRef.componentInstance.freelancer_id = this.freelancers[i].id;
    modalRef.componentInstance.portfolio_type = this.freelancers[i].portfolio_type;
    modalRef.componentInstance.freelancer_picture = this.freelancers[i].picture;
  }

  /**
    * case insensitive search by email || category_name
    * 
    * @param search string
    */
   public search(search:string): void {
    if(!search){
      this.freelancers = JSON.parse(JSON.stringify(this.originalFreelancers));
    } else {
      this.freelancers =  this.originalFreelancers.filter(freelancer => { // came cloned
        return freelancer.email.toLowerCase().indexOf(search.toLowerCase()) > -1 ||
        freelancer.category_name.toLowerCase().indexOf(search.toLowerCase()) > -1
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
