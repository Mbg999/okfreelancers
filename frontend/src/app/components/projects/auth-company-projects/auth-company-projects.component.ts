import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

// SERVICES
import { ProjectService } from 'src/app/services/project.service';
import { ErrorService } from 'src/app/services/error.service';
import { DialogService } from 'src/app/services/dialog.service';
import { MultilangService } from 'src/app/services/multilang.service';
import { UserService } from 'src/app/services/user.service';

// INTERFACES
import { Project } from 'src/app/interfaces/project';

@Component({
  selector: 'app-auth-company-projects',
  templateUrl: './auth-company-projects.component.html',
  styleUrls: ['./auth-company-projects.component.css']
})
export class AuthCompanyProjectsComponent implements OnInit, OnDestroy {

  public project: Project;
  public action: string;
  public itsReady: boolean;
  private multilang: Subscription;

  constructor(private _projectService: ProjectService,
    private _errorService: ErrorService,
    private _dialogService: DialogService,
    private _multilangService: MultilangService,
    private _userService: UserService,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit(): void {
    this.route.params.subscribe((params)=>{
      this.action = params.action;
      if(params.id){ // its show/edit
        this.getProject(params.id);
      } else {
        if(this.action != 'create'){ // invalid action
          this.router.navigate(['/MyCompany/projects']);
        } else { // its create
          this.itsReady = true;
        }
      }
    });

    this.multilang = this._multilangService.onLangChangeEvent()
    .subscribe(()=>{
      this.getProject(this.project.id);
    });
  }

  ngOnDestroy(): void {
    this.multilang.unsubscribe();
  }

  private getProject(id: number): void {
    this._projectService.getOneOfMyCompanyProjects(id)
    .subscribe({
      next: (resp)=>{
        this.project = resp.data;
        this.itsReady = true;
      },
      error: (err)=>{
        if(this.action != 'create') {
          if(this._errorService.manipulableError(err.error) && err.status == 404){
            this._dialogService.error(this._multilangService.translate('projects.not_found'));
            this.router.navigate(['/MyCompany/projects']);
          }
        }
        this.itsReady = true;
      }
    });
  }

  /**
   * Sends the data, it determines if its a new project or an update
   * 
   * @param project Project
   */
  public send(project: Project): void {
    if(this.action == 'create'){ // its create
      this.create(project);
    } else { // its update
      this.update(project);
    }
  }

  /**
   * Sends the data for create a new project
   * 
   * @param project Project
   */
  private create(project: Project): void {
    this._projectService.createAsCompany(project)
      .subscribe({
        next: (resp)=>{
          this.project = resp.data;
          this.router.navigate([`/MyCompany/projects/${this.project.id}/show`]);
        },
        error: (err)=>{
          this._errorService.handeError(err.error);
        }
      });
  }

  /**
   * Sends the data for update a project
   * 
   * @param project Project
   */
  private update(project: Project): void {
    this._projectService.updateAsCompany(this.project.id, project)
      .subscribe({
        next: (resp)=>{
          this.project = resp.data;
          this.router.navigate([`/MyCompany/projects/${this.project.id}/show`]);
          this._dialogService.success(
            this._multilangService.translate('freelancers.updated')
          )
        },
        error: (err)=>{
          this._errorService.handeError(err.error);
        }
      });
  }

  public deactivate(): void {
    this._dialogService.danger(
      this._multilangService.translate('projects.deactivate'),
      this._multilangService.translate('projects.deactivate_msg'),
      this._multilangService.translate('miscellaneous.deactivate')
    )
    .then((result)=>{
      if(result.value){
        this._projectService.deactivateAsCompany(this.project.id)
        .subscribe({
          next: (resp)=>{
            this.project.deleted_at = "deleted";
          },
          error: (err)=>{
            if(this._errorService.manipulableError(err.error)){
              if(err.error.errors.pending){
                this._dialogService.error(err.error.errors.pending);
              }
            }
          }
        });
      }
    });
  }

  public activate(): void {
    this._projectService.activateAsCompany(this.project.id)
    .subscribe({
      next: (resp)=>{
        this.project.deleted_at = null;
      },
      error: (err)=>{
        this._errorService.handeError(err.error);
      }
    });
  }

  public delete(): void {
    this._dialogService.danger(
      this._multilangService.translate('projects.delete'),
      this._multilangService.translate('projects.delete_msg'),
      this._multilangService.translate('miscellaneous.delete')
    )
    .then((result)=>{
      if(result.value){
        this._dialogService.loading();
        this._projectService.deleteAsCompany(this.project.id)
        .subscribe({
          next: (resp)=>{
            this.router.navigate(['/MyCompany/projects']);
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
  }

  public toggleProjectFinished(): void {
    this._dialogService.iconless(
      // TEXT
      this._multilangService.translate('projects.toggle_finish.'+((this.project.finished) ? 'unmark' : 'mark')+'.text'),
      // TITLE
      this._multilangService.translate('projects.toggle_finish.'+((this.project.finished) ? 'unmark' : 'mark')+'.question'),
      // CONFIRM BUTTON TEXT
      this._multilangService.translate('projects.toggle_finish.'+((this.project.finished) ? 'unmark' : 'mark')+'.confirm'),
      // SHOW CANCEL BUTTON
      true,
      // CANCEL BUTTON TEXT
      this._multilangService.translate('miscellaneous.cancel')
    )
    .then((result)=>{
      if(result.value){
        this._projectService.toggleProjectFinished(this.project.id, this.project.finished)
        .subscribe({
          next: (resp)=>{
            this.project = resp.data;
            this._dialogService.success(this._multilangService.translate('projects.toggle_finish.'+((this.project.finished) ? 'mark' : 'unmark')+'.success'));
          },
          error: (err)=>{
            if(this._errorService.manipulableError(err.error)){
              if(err.error.errors.pending){
                this._dialogService.error(err.error.errors.pending);
              }
              if(err.error.errors.concurrence){
                this._dialogService.error(err.error.errors.concurrence)
                .then(()=>{
                  window.location.reload();
                });
              }
            }
          }
        });
      }
    });
  }

  public takeAction(action: string): void {
    this.router.navigate([`/MyCompany/projects/${this.project.id}/${action}`]);
  }

}
