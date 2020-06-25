import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// SERVICES
import { CompanyService } from 'src/app/services/company.service';
import { ErrorService } from 'src/app/services/error.service';
import { DialogService } from 'src/app/services/dialog.service';
import { MultilangService } from 'src/app/services/multilang.service';
import { UserService } from 'src/app/services/user.service';

// INTERFACES
import { Company } from 'src/app/interfaces/company';
import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-auth-company',
  templateUrl: './auth-company.component.html',
  styleUrls: ['./auth-company.component.css']
})
export class AuthCompanyComponent implements OnInit {

  public company: Company;
  public action: string;
  public itsReady: boolean;
  public takenName: string;

  constructor(private _companyService: CompanyService,
    private _errorService: ErrorService,
    private _dialogService: DialogService,
    private _multilangService: MultilangService,
    private _userService: UserService,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit(): void {
    this.getCompany();
    this.route.params.subscribe((params)=>{
      this.action = params.action;
    });
  }

  private getCompany(): void {
    this._companyService.getMyCompany()
    .subscribe({
      next: (resp)=>{
        this.company = resp.data;
        if(this.action == 'create'){
          this.router.navigate(['/MyCompany/show']);
          this._dialogService.error(
            this.company.name,
            this._multilangService.translate('companies.already_created')
          );
        }
        this.itsReady = true;
      },
      error: (err)=>{
        if(this.action != 'create') {
          if(this._errorService.manipulableError(err.error) && err.status == 404){
            this.router.navigate(['/MyCompany/create']);
          }
        }
        this.itsReady = true;
      }
    });
  }

  /**
   * Sends the data, it determines if its a new company or an update
   * 
   * @param company FormData
   */
  public send(company: FormData): void {
    this.takenName = undefined;
    if(this.action == 'create'){ // its create
      this.create(company);
    } else { // its update
      this.update(company);
    }
  }

  /**
   * Sends the data for create a new company
   * it controls the posible errors with user_id error
   * 
   * @param company FormData
   */
  private create(company: FormData): void {
    this._companyService.createAsAuth(company)
      .subscribe({
        next: (resp)=>{
          this.company = resp.data;
          this.router.navigate(['/MyCompany/show']);
          this._dialogService.success(
            this._multilangService.translate('companies.created', {name: this.company.name})
          )
        },
        error: (err)=>{
          if(this._errorService.manipulableError(err.error) && err.error.errors.name){
            this.takenName = err.error.errors.name;
            window.scrollTo(0,0);
          }
        }
      });
  }

  /**
   * Sends the data for update a company
   * it controls the posible errors with user_id error
   * 
   * @param company FormData
   */
  private update(company: FormData): void {
    this._companyService.updateAsAuth(company)
      .subscribe({
        next: (resp)=>{
          this.company = resp.data;
          this.router.navigate(['/MyCompany/show']);
          this._dialogService.success(
            this._multilangService.translate('companies.updated', {name: this.company.name})
          )
        },
        error: (err)=>{
          if(this._errorService.manipulableError(err.error) && err.error.errors.name){
            this.takenName = err.error.errors.name;
            window.scrollTo(0,0);
          }
        }
      });
  }

  public deactivate(): void {
    this._dialogService.danger(
      this._multilangService.translate('miscellaneous.deactivate_profile'),
      this._multilangService.translate('companies.deactivate'),
      this._multilangService.translate('miscellaneous.deactivate')
    )
    .then((result)=>{
      if(result.value){
        this._companyService.deactivateAsAuth()
        .subscribe({
          next: ()=>{
            this.company.deleted_at = "deleted";
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
    this._companyService.activateAsAuth()
    .subscribe({
      next: ()=>{
        this.company.deleted_at = null;
      },
      error: (err)=>{
        this._errorService.handeError(err.error);
      }
    });
  }

  public delete(): void {
    this._dialogService.danger(
      this._multilangService.translate('miscellaneous.delete_profile'),
      this._multilangService.translate('companies.delete'),
      this._multilangService.translate('miscellaneous.delete')
    )
    .then((result)=>{
      if(result.value){
        this._dialogService.loading();
        this._companyService.deleteAsAuth()
        .subscribe({
          next: ()=>{
            this.router.navigate(['/']);
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
    this.router.navigate([`/MyCompany/${action}`]);
  }

  // GETTERS
  get user(): User {
    return this._userService.user;
  }
}
