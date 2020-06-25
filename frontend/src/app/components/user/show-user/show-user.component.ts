import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

// SERVICES
import { ErrorService } from 'src/app/services/error.service';
import { UserService } from 'src/app/services/user.service';
import { MultilangService } from 'src/app/services/multilang.service';
import { DialogService } from 'src/app/services/dialog.service';
import { CompanyService } from 'src/app/services/company.service';
import { FreelancerService } from 'src/app/services/freelancer.service';

// INTERFACES
import { User } from 'src/app/interfaces/user';
import { Company } from 'src/app/interfaces/company';
import { Freelancer } from 'src/app/interfaces/freelancer';

@Component({
  selector: 'app-show-user',
  templateUrl: './show-user.component.html',
  styleUrls: ['./show-user.component.css']
})
export class ShowUserComponent implements OnInit, OnDestroy {

  @Input('user') public user: User;
  @Input('itsMyProfile') public itsMyProfile: boolean;
  public company: Company;
  public freelancers: Freelancer[];
  private multilang: Subscription;

  constructor(private _userService: UserService,
    private _errorService: ErrorService,
    private _dialogService: DialogService,
    public _multilangService: MultilangService,
    private _companyService: CompanyService,
    private _freelancerService: FreelancerService,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit(): void {
    if(this.user){
      this.getCompanyFromUser(this.user.email);
      this.getFreelancersFromUser(this.user.email);
    } else {
      this.route.params.subscribe((params)=>{
        this.getUser(params.email);
      });
    }
    this.multilang = this._multilangService.onLangChangeEvent()
    .subscribe(()=>{
      this.getFreelancersFromUser(this.user.email);
    });
  }

  ngOnDestroy(): void {
    this.multilang.unsubscribe();
  }

  private getUser(email: string): void {
    this._userService.getUserByEmail(email)
    .subscribe({
      next: (resp)=>{
        this.user = resp.data;
        this.getCompanyFromUser(this.user.email);
        this.getFreelancersFromUser(this.user.email);
      },
      error: (err)=>{
        if(this._errorService.manipulableError(err.error) && err.status == 404){
          this._dialogService.error(this._multilangService.translate('user.not_found'));
          this.router.navigate(['/']);
        }
      }
    });
  }

  private getCompanyFromUser(email: string): void {
    this._companyService.getAUserCompany(email)
    .subscribe({
      next: (resp)=>{
        this.company = resp.data;
      },
      error: (err)=>{
        // it can be a 404 if the user has no company
        if(err.status != 404) this._errorService.handeError(err.error);
      }
    });
  }

  private getFreelancersFromUser(email: string): void {
    this._freelancerService.getAllFreelancersFromAUser(email)
    .subscribe({
      next: (resp)=>{
        this.freelancers = resp.data;
      },
      error: (err)=>{
        this._errorService.manipulableError(err.error);
      }
    });
  }

  // GETTERS
  get auth_user(): User {
    return this._userService.user;
  }

}
