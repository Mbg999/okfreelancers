import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

// SERVICES
import { ProjectService } from 'src/app/services/project.service';
import { ErrorService } from 'src/app/services/error.service';
import { MultilangService } from 'src/app/services/multilang.service';

// INTERFACES
import { Project } from 'src/app/interfaces/project';

@Component({
  selector: 'app-auth-all-company-projects',
  templateUrl: './auth-all-company-projects.component.html',
  styleUrls: ['./auth-all-company-projects.component.css']
})
export class AuthAllCompanyProjectsComponent implements OnInit, OnDestroy {

  public projects: Project[];
  private multilang: Subscription;

  constructor(private _projectsService: ProjectService,
    private _errorService: ErrorService,
    private _multilangService: MultilangService) { }

  ngOnInit(): void {
    this.getCompanyProjects();
    this.multilang = this._multilangService.onLangChangeEvent()
    .subscribe(()=>{
      this.getCompanyProjects();
    });
  }

  ngOnDestroy(): void {
    this.multilang.unsubscribe();
  }

  private getCompanyProjects(): void {
    this._projectsService.getAllMyCompanyProjects()
    .subscribe({
      next: (resp)=>{
        this.projects = resp.data;
      },
      error: (err)=>{
        this._errorService.handeError(err.error);
      }
    });
  }

}
