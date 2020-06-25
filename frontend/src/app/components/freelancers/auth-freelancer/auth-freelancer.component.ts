import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

// SERVICES
import { FreelancerService } from 'src/app/services/freelancer.service';
import { ErrorService } from 'src/app/services/error.service';
import { DialogService } from 'src/app/services/dialog.service';
import { MultilangService } from 'src/app/services/multilang.service';
import { UserService } from 'src/app/services/user.service';

// INTERFACES
import { Freelancer } from 'src/app/interfaces/freelancer';
import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-auth-freelancer',
  templateUrl: './auth-freelancer.component.html',
  styleUrls: ['./auth-freelancer.component.css']
})
export class AuthFreelancerComponent implements OnInit, OnDestroy {

  public freelancer: Freelancer;
  public action: string;
  public itsReady: boolean;
  public stage: number;
  public repeated: string;
  public fileError: any[] = [];
  private multilang: Subscription;

  constructor(private _freelancerService: FreelancerService,
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
        this.getFreelancerProfile(params.id);
      } else {
        if(this.action != 'create'){ // invalid action
          this.router.navigate(['/MyFreelancerProfiles']);
        } else { // its create
          this.stage = 1;
          this.itsReady = true;
        }
      }
    });

    this.multilang = this._multilangService.onLangChangeEvent()
    .subscribe(()=>{
      this.getFreelancerProfile(this.freelancer.id);
    });
  }

  ngOnDestroy(): void {
    this.multilang.unsubscribe();
  }

  private getFreelancerProfile(id: number): void {
    this._freelancerService.getOneOfMyFreelancers(id)
    .subscribe({
      next: (resp)=>{
        this.freelancer = resp.data;
        this.itsReady = true;
      },
      error: (err)=>{
        if(this.action != 'create') {
          if(this._errorService.manipulableError(err.error) && err.status == 404){
            this._dialogService.error(this._multilangService.translate('freelancers.not_found'));
            this.router.navigate(['/MyFreelancerProfiles']);
          }
        }
        this.itsReady = true;
      }
    });
  }

  /**
   * Sends the data for create a new freelancer profile
   * it controls the posible errors with user_id error
   * 
   * @param freelancer FormData
   */
  public create(freelancer: FormData): void {
    this._freelancerService.createAsAuth(freelancer)
      .subscribe({
        next: (resp)=>{
          this.freelancer = resp.data;
          if(this.freelancer.portfolio_type){
            this.stage = 2;
          } else {
            this.router.navigate([`/MyFreelancerProfiles/${this.freelancer.id}/show`]);
          }
        },
        error: (err)=>{
          if(this._errorService.manipulableError(err.error) && err.error.errors?.category_id){
            this.repeated = err.error.errors.category_id;
            window.scrollTo(0,0);
          }
        }
      });
  }

  /**
   * Sends the data for update a freelancer profile
   * it controls the posible errors with user_id error
   * 
   * @param freelancer FormData
   */
  public update(freelancer: FormData): void {
    this._freelancerService.updateAsAuth(this.freelancer.id, freelancer)
      .subscribe({
        next: (resp)=>{
          this.freelancer = resp.data;
          this.router.navigate([`/MyFreelancerProfiles/${this.freelancer.id}/show`]);
          this._dialogService.success(
            this._multilangService.translate('freelancers.updated')
          )
        },
        error: (err)=>{
          if(this._errorService.manipulableError(err.error) && err.error.errors?.category_id){
            this.repeated = err.error.errors.category_id;
            window.scrollTo(0,0);
          }
        }
      });
  }

  public updatePortfolio(portfolio: FormData[]): void {
    this._dialogService.loading();
    this._freelancerService.updatePortfolioAsAuth(this.freelancer.id, portfolio)
    .subscribe({
      next: (resp)=>{
        this.stage = undefined;
        this.freelancer.portfolio = resp.data;
        this._dialogService.close();
      },
      error: (err)=>{
        this._dialogService.close();
        if(this._errorService.manipulableError(err)){
          // error comes in a string format like 'portfolio.0.file', 'portfolio.1.file'..., lets make it a more friendly message
          Object.keys(err.error.errors).forEach((error)=>{
            if(error.endsWith('.file')){
              let aux = error.split('.');
              this.fileError[parseInt(aux[1])] = {err:'miscellaneous.required_file'};
            }
          });
        }
      }
    });

  }

  public deactivate(): void {
    this._dialogService.danger(
      this._multilangService.translate('miscellaneous.deactivate_profile'),
      this._multilangService.translate('freelancers.deactivate'),
      this._multilangService.translate('miscellaneous.deactivate')
    )
    .then((result)=>{
      if(result.value){
        this._freelancerService.deactivateAsAuth(this.freelancer.id)
        .subscribe({
          next: ()=>{
            this.freelancer.deleted_at = "deleted";
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
    this._freelancerService.activateAsAuth(this.freelancer.id)
    .subscribe({
      next: ()=>{
        this.freelancer.deleted_at = null;
      },
      error: (err)=>{
        this._errorService.handeError(err.error);
      }
    });
  }

  public delete(): void {
    this._dialogService.danger(
      this._multilangService.translate('miscellaneous.delete_profile'),
      this._multilangService.translate('freelancers.delete'),
      this._multilangService.translate('miscellaneous.delete')
    )
    .then((result)=>{
      if(result.value){
        this._dialogService.loading();
        this._freelancerService.deleteAsAuth(this.freelancer.id)
        .subscribe({
          next: (resp)=>{
            if(resp.removeRole){
              this.router.navigate(['/']);
            } else {
              this.router.navigate(['/MyFreelancerProfiles']);
            }
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

  public takeAction(action: string): void {
    this.router.navigate([`/MyFreelancerProfiles/${this.freelancer.id}/${action}`]);
  }

  get user(): User {
    return this._userService.user;
  }

}
