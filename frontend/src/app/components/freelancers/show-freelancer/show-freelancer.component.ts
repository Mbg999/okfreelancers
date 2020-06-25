import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

// SERVICES
import { FreelancerService } from 'src/app/services/freelancer.service';
import { MultilangService } from 'src/app/services/multilang.service';
import { ErrorService } from 'src/app/services/error.service';
import { DialogService } from 'src/app/services/dialog.service';
import { ProjectService } from 'src/app/services/project.service';
import { UserService } from 'src/app/services/user.service';

// INTERFACES
import { Freelancer } from 'src/app/interfaces/freelancer';
import { User } from 'src/app/interfaces/user';
import { ProjectStatusFreelancer } from 'src/app/interfaces/project-status-freelancer';

@Component({
  selector: 'app-show-freelancer',
  templateUrl: './show-freelancer.component.html',
  styleUrls: ['./show-freelancer.component.css']
})
export class ShowFreelancerComponent implements OnInit {

  @Input('freelancer') public freelancer: Freelancer;
  @Input('user') public user: User;
  private multilang: Subscription;
  public projects: ProjectStatusFreelancer;
  public activeTab: number = 1;

  constructor(private _freelancerService: FreelancerService,
    public _multilangService: MultilangService,
    private _projectService: ProjectService,
    private _errorService: ErrorService,
    private _dialogService: DialogService,
    private _userService: UserService,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    if(!this.freelancer && !this.user){
      this.route.params.subscribe((params)=>{
        this.getFreelancer(params.id);
      });
    } else {
      this.getMyFreelancerAcceptedProjects(this.freelancer.id);
    }
    this.multilang = this._multilangService.onLangChangeEvent()
    .subscribe(()=>{
      this.getFreelancer(this.freelancer.id);
      this.getMyFreelancerAcceptedProjects(this.freelancer.id);
    });
  }

  ngOnDestroy(): void {
    this.multilang.unsubscribe();
  }

  private getFreelancer(id: number): void {
    this._freelancerService.getAFreelancer(id)
    .subscribe({
      next: (resp)=>{
        this.freelancer = resp.data.freelancer;
        this.user = resp.data.user;
        this.getMyFreelancerAcceptedProjects(this.freelancer.id);
      },
      error: (err)=>{
        if(this._errorService.manipulableError(err.error) && err.status == 404){
          this._dialogService.error(this._multilangService.translate('freelancers.not_found'));
          this.router.navigate(['/']);
        }
      }
    });
  }

  private getMyFreelancerAcceptedProjects(id: number): void {
    this._projectService.getAFreelancerAcceptedProjects(id)
    .subscribe({
      next: (resp)=>{
        this.projects = resp.data;
      },
      error: (err)=>{
        this._errorService.handeError(err.error);
      }
    });
  }

  // GETTERS
  get auth_user(): User {
    return this._userService.user;
  }

}
