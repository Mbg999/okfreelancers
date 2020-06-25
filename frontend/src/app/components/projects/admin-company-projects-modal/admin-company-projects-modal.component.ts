import { Component, OnInit, Input } from '@angular/core';

// SERVICES
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ProjectService } from 'src/app/services/project.service';
import { ErrorService } from 'src/app/services/error.service';

// INTERFACES
import { Project } from 'src/app/interfaces/project';

// NG BOOTSTRAP

@Component({
  selector: 'app-admin-company-projects-modal',
  templateUrl: './admin-company-projects-modal.component.html',
  styleUrls: ['./admin-company-projects-modal.component.css']
})
export class AdminCompanyProjectsModalComponent implements OnInit {

  // inputs
  @Input('id') public id: number;
  @Input('companyId') public companyId: number;
  public project: Project;
  public showForm: boolean;
  public user: string[]; // 0 -> id, 1 -> email
  public user_idError: string;

  constructor(public activeModal: NgbActiveModal,
    private _projectService: ProjectService,
    private _errorService: ErrorService) { }

  ngOnInit(): void {
    if(this.id){ // update
      this.getProject();
    } else { // create
      this.showForm = true;
    }
  }

  /**
   * Get the project to update data
   */
  private getProject(): void {
    this._projectService.getAProjectAsAdmin(this.id)
    .subscribe({
      next: (resp)=>{
        this.project = resp.data;
        this.showForm = true;
      },
      error: (err)=>{
        this._errorService.handeError(err.error);
      }
    });
  }

  /**
   * Sends the data, it determines if its a new project or an update
   * 
   * @param project Project
   */
  public send(project: Project): void {
    if(this.id){ // its update
      this.update(project);
    } else { // its create
      this.create(project);
    }
  }

  /**
   * Sends the data for create a new project
   * it controls the posible errors with user_id error
   * 
   * @param project FormData
   */
  private create(project: Project): void {
    this._projectService.createAsAdmin(this.companyId, project)
      .subscribe({
        next: (resp)=>{
          this.close(resp.data);
        },
        error: (err)=>{
          this._errorService.handeError(err.error);
        }
      });
  }

  /**
   * Sends the data for update a project
   * it controls the posible errors with user_id error
   * 
   * @param project: Project
   */
  private update(company: Project): void {
    this._projectService.updateAsAdmin(this.id, company)
      .subscribe({
        next: (resp)=>{
          this.close(resp.data);
        },
        error: (err)=>{
          this._errorService.handeError(err.error);
        }
      });
  }

  /**
   * Closes the modal, it returns the created/updated project data
   * 
   * @param project: Project
   */
  public close(project: Project): void {
    this.activeModal.close(project);
  }


}
