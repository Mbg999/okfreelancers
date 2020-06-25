import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

// SERVICES
import { ProjectService } from 'src/app/services/project.service';
import { MultilangService } from 'src/app/services/multilang.service';
import { ErrorService } from 'src/app/services/error.service';
import { Freelancer } from 'src/app/interfaces/freelancer';

@Component({
  selector: 'app-freelancer-projects',
  templateUrl: './freelancer-projects.component.html',
  styleUrls: ['./freelancer-projects.component.css']
})
export class FreelancerProjectsComponent implements OnInit, OnDestroy {

  public freelancers: Freelancer[];
  public activeTabs: number[] = [];
  // multilang
  private multilang: Subscription;

  constructor(private _projectService: ProjectService,
    private _multilangService: MultilangService,
    private _errorService: ErrorService) { }

  ngOnInit(): void {
    this.getAllMyFreelancersAndInProgressProjects();

    this.multilang = this._multilangService.onLangChangeEvent()
    .subscribe(()=>{
      this.getAllMyFreelancersAndInProgressProjects();
    });
  }


  ngOnDestroy(): void {
    if(this.multilang) this.multilang.unsubscribe();
  }

  private getAllMyFreelancersAndInProgressProjects(): void {
    this._projectService.getAllMyFreelancersAndInProgressProjects()
    .subscribe({
      next: (resp)=>{
        this.activeTabs.fill(1, 0, resp.data.length);
        this.freelancers = resp.data;
      },
      error: (err)=>{
        this._errorService.handeError(err.error);
      }
    });
  }

}
