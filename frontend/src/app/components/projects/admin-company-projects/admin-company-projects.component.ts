import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// SERVICES
import { ProjectService } from 'src/app/services/project.service';
import { DialogService } from 'src/app/services/dialog.service';
import { MultilangService } from 'src/app/services/multilang.service';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { BanService } from 'src/app/services/ban.service';
import { UserService } from 'src/app/services/user.service';

// INTERFACES
import { Project } from 'src/app/interfaces/project';

// NG BOOTSTRAP
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

// COMPONENTS
import { AdminCompanyProjectsModalComponent } from '../admin-company-projects-modal/admin-company-projects-modal.component';

@Component({
  selector: 'app-admin-company-projects',
  templateUrl: './admin-company-projects.component.html',
  styleUrls: ['./admin-company-projects.component.css']
})
export class AdminCompanyProjectsComponent implements OnInit {

  public originalProjects: Project[];
  public projects: Project[];
  private companyId: number;

  constructor(public _multilangService: MultilangService,
    private _projectService: ProjectService,
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
      this.companyId = params.companyId;
      this.getProjectsOfACompany();
    });
  }

  /**
   * Gets the projects associated to a company
   * 
   * @param companyId number
   */
  private getProjectsOfACompany(): void {
    this._projectService.getProjectsOfACompanyAsAdmin(this.companyId)
    .subscribe({
      next: (resp)=>{
        this.originalProjects = resp.data;
        this.projects = JSON.parse(JSON.stringify(this.originalProjects)); // deep clone
      },
      error: (err)=>{
        if(this._errorService.manipulableError(err.error) && err.status == 404){
          this.router.navigate(['/admin/companies/all']);
        }
      }
    });
  }

  /**
   * Open the modal for create or update a project
   * 
   * @param id number
   */
  private openProjectmodal(id: number=null): Promise<any> {
    const modalRef: NgbModalRef = this.modalService.open(AdminCompanyProjectsModalComponent,{
      scrollable: true,
      windowClass: 'animated fadeInDown faster'
    });
    
    modalRef.componentInstance.id = id;
    modalRef.componentInstance.companyId = this.companyId;
    
    return modalRef.result;
  }

  /**
   * create a new project
   */
  public create(): void {
    this.openProjectmodal()
    .then((result)=>{
      this.originalProjects.push(result);
      this.projects.push(result);
      this.originalProjects.sort((a,b)=>a.id-b.id);
      this.projects.sort((a,b)=>a.id-b.id);
    })
    .catch((err)=>{}); // nbBootstrap modal requirements
  }

  /**
   * Update a project from the table
   * the modal returns the updated project data
   * 
   * @param i number
   */
  public update(i:number): void {
    this.openProjectmodal(this.projects[i].id)
    .then((result)=>{
      this.originalProjects.map((project, idx)=>{
        if(project.id = this.projects[i].id){
          this.originalProjects[idx] = result;
        }
      });
      this.projects[i] = result;
    })
    .catch((err)=>{}); // nbBootstrap modal requirements
  }

  /**
   * ban or rehabilitate a project from the table,
   * by toggling the SoftDeleted field deleted_at
   * 
   * @param i number
   */
  public toggleDeleted_at(i: number): void {
    this._dialogService.danger( // dialog messages
      this._multilangService.translate('miscellaneous.sure_from_this_action'),
      this._multilangService.translate('miscellaneous.action_msg'),
      (this.projects[i].deleted_at) ? 
      this._multilangService.translate("miscellaneous.enable") :
      this._multilangService.translate("miscellaneous.ban") 
    )
    .then((result)=>{
      if(result.value){
        if(this.projects[i].deleted_at){ // its deactivated, lets activate it
          this._dialogService.loading();
          this._projectService.activateAsAdmin(this.projects[i].id)
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
            this._projectService.ban(this.projects[i].id, ban_reason)
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
    this.projects[i].deleted_at = (ban_reason) ? 'deleted' : null; // just significant for know when is activated or not;
    this.projects[i].ban_reason = ban_reason;
    this.originalProjects.map((project, idx)=>{
       if(project.id === this.projects[i].id){
        this.originalProjects[idx].deleted_at = (ban_reason) ? 'deleted' : null; // just significant for know when is activated or not;
        this.originalProjects[idx].ban_reason = ban_reason;
       }
    });
  }

  /**
   * Opens the ban reason modal, to show the reason of the ban
   * 
   * @param i number
   */
  public readBan_reason(i: number): void {
    this._banService.openBanReasonModal(this.projects[i].ban_reason);
  }

  /**
   * Permanent delete a project from the table
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
          this._projectService.deleteAsAdmin(this.projects[i].id)
            .subscribe({
              next: (resp)=>{
                if(this.projects[i].user_id == this._userService.user.id){
                  this._userService.removeRole(1);
                }
                this.originalProjects.map((project, idx)=>{
                  if(project.id === this.projects[i].id){
                    this.originalProjects.splice(idx, 1); // delete from our list
                  }
                });
                this.projects.splice(i,1);
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
    * case insensitive search by title
    * 
    * @param search string
    */
   public search(search:string): void {
    if(!search){
      this.projects = JSON.parse(JSON.stringify(this.originalProjects));
    } else {
      this.projects =  this.originalProjects.filter(project => { // came cloned
        return project.title.toLowerCase().indexOf(search.toLowerCase()) > -1
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
