import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

// SERVICE
import { CompanyService } from 'src/app/services/company.service';
import { ErrorService } from 'src/app/services/error.service';
import { DialogService } from 'src/app/services/dialog.service';
import { MultilangService } from 'src/app/services/multilang.service';
import { ProjectService } from 'src/app/services/project.service';
import { UserService } from 'src/app/services/user.service';

// INTERFACES
import { Company } from 'src/app/interfaces/company';
import { User } from 'src/app/interfaces/user';
import { Project } from 'src/app/interfaces/project';
import { Offer } from 'src/app/interfaces/offer';

@Component({
  selector: 'app-show-company',
  templateUrl: './show-company.component.html',
  styleUrls: ['./show-company.component.css']
})
export class ShowCompanyComponent implements OnInit, OnDestroy {

  @Input('company') public company: Company;
  @Input('user') public user: User;
  public itsMyProfile: boolean;
  public projects: Project[];
  private multilang: Subscription;
  public offers: Offer[];

  constructor(private route: ActivatedRoute,
    private _companyService: CompanyService,
    private _errorService: ErrorService,
    private _dialogService: DialogService,
    private _multilangService: MultilangService,
    private _projectService: ProjectService,
    private _userService: UserService,
    private router: Router) { }

  ngOnInit(): void {
    if(!this.company && !this.user){
      this.route.params.subscribe((params)=>{
        this.getCompany(params.name);
      });
    } else {
      if(this.company.user_id != this.user.id){
        this.getProjects();
      } else {
        this.itsMyProfile = true;
        this.getProjectsAsAuthUser();
      }
    }
    
    this.multilang = this._multilangService.onLangChangeEvent()
    .subscribe(()=>{
      this.getProjects();
    });
  }

  ngOnDestroy(): void {
    this.multilang.unsubscribe();
  }

  private getCompany(name): void {
    this._companyService.getACompany(name)
    .subscribe({
      next: (resp)=>{
        this.company = resp.data.company;
        this.user = resp.data.user;
        this.getProjects();
      },
      error: (err)=>{
        if(this._errorService.manipulableError(err.error)){
          this._dialogService.error(this._multilangService.translate('companies.not_found'))
          .then(()=>{
            this.router.navigate(['/']);
          });
        }
      }
    });
  }

  private getProjects(): void {
    this._projectService.getAllProjectsOfACompany(this.company.name)
    .subscribe({
      next: (resp)=>{
        this.projects = resp.data;
      },
      error: (err)=>{
        this._errorService.handeError(err.error);
      }
    });
  }

  private getProjectsAsAuthUser(): void {
    this._projectService.getAllMyCompanyProjects()
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
