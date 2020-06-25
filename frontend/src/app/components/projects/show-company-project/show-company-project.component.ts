import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
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
import { Freelancer } from 'src/app/interfaces/freelancer';
import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-show-company-project',
  templateUrl: './show-company-project.component.html',
  styleUrls: ['./show-company-project.component.css']
})
export class ShowCompanyProjectComponent implements OnInit, OnDestroy {

  @Input('project') public project: Project;
  @Output('toggleProjectFinished') public toggleProjectFinished = new EventEmitter<boolean>();
  public freelancers: Freelancer[];
  // multilang
  private multilang: Subscription;

  constructor(private route: ActivatedRoute,
    private _projectService: ProjectService,
    private _errorService: ErrorService,
    private _dialogService: DialogService,
    public _multilangService: MultilangService,
    private _userService: UserService,
    private router: Router) { }

  ngOnInit(): void {
    if(!this.project){
      this.route.params.subscribe((params)=>{
        this.getProject(params.id);
      });

      this.multilang = this._multilangService.onLangChangeEvent()
      .subscribe(()=>{
        this.getProject(this.project.id);
      });
    }
  }

  ngOnDestroy(): void {
    if(this.multilang) this.multilang.unsubscribe();
  }

  private getProject(id): void {
    this._projectService.getAProject(id)
    .subscribe({
      next: (resp)=>{
        this.project = resp.data;
      },
      error: (err)=>{
        if(this._errorService.manipulableError(err.error)){
          this._dialogService.error(this._multilangService.translate('projects.not_found'))
          .then(()=>{
            this.router.navigate(['/']);
          });
        }
      }
    });
  }

  // GETTERS
  get user(): User {
    return this._userService.user;
  }

}
