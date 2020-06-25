import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

// SERVICES
import { UserService } from 'src/app/services/user.service';
import { MultilangService } from 'src/app/services/multilang.service';
import { DialogService } from 'src/app/services/dialog.service';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';

// INTERFACES
import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-auth-user',
  templateUrl: './auth-user.component.html',
  styleUrls: ['./auth-user.component.css']
})
export class AuthUserComponent implements OnInit {

  public action: string;
  public itsReady: boolean;
  // feedback
  public takenEmail: string;
  public uploadingPicture: boolean;

  constructor(private _userService: UserService,
    private _dialogService: DialogService,
    private _multilangService: MultilangService,
    private _authService: AuthService,
    private _errorService: ErrorService,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.params.subscribe((params)=>{
      this.action = params.action;
      this.itsReady = true;
    });
  }

  /**
  * sends the updated data to the server
  * 
  * Saves the posible taken email error into takenEmail variable
  * 
  *  @param data User
  */
  public updateUser(data: User): void {
    this.takenEmail = undefined;
    this._dialogService.loading();
    this._userService.update(data)
    .subscribe({
      next: (resp:any)=>{
        this._dialogService.close();
        if(resp.need_reauth) {
          this._userService.removeAuthData();
          this._dialogService.success(this._multilangService.translate('user.important_changes'));
          this.router.navigate(['/'])
        };
      },
      error: (err:any)=>{
        this._dialogService.close();
        if(this._errorService.manipulableError(err.error)){
          this.takenEmail = err.error.errors?.email;
          setTimeout(()=>{window.scrollTo(0,0)},300); // timeout for firefox issues
        }
      }
    });
  }

  /**
   * it sends the new password to the server, and,
   * if the change went ok, the user gets deauth and redirected to home
   * 
   * @param data User
   */
  public changePassword(data:User): void {
    this._dialogService.loading();
    this._userService.update(data)
    .subscribe({
      next: (resp:any)=>{// this will always return data.reauth: true
        this._userService.removeAuthData();
        this._dialogService.close();
        this._dialogService.success(this._multilangService.translate('user.important_changes'));
        this.router.navigate(['/']);
      },
      error: (err:any)=>{
        this._dialogService.close();
        this._errorService.handeError(err.error);
      }
    });
  }

  /**
  * Uploads the edited picture from the update user form
  * uses the uploadingPicture flag to show an animation and disable
  * the add picture button
  * 
  * @param picture File
  */
  public changePicture(picture:File): void {
    this.uploadingPicture = true;
    this._userService.uploadPicture(picture)
    .subscribe({
      next: (resp)=>{
        this.uploadingPicture = false;
      },
      error: (err)=>{
        this._errorService.handeError(err.error);
      }
    });
  }

  public deactivate(): void {
    this._authService.securityAuth()
    .then((result) => {
      this._dialogService.danger(
        this._multilangService.translate('user.deactivate_account'),
        this._multilangService.translate('user.deactivate_account_msg'),
        this._multilangService.translate('user.deactivate_account_confirm')
        ).then((result)=>{
          if(result.value){
            this._dialogService.loading();
            this._userService.deactivateAsAuth()
            .subscribe({
              next: (resp)=>{
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
      }).catch(err=>{});
  }

  public delete(): void {
    this._authService.securityAuth()
    .then((result) => {
      this._dialogService.danger(
        this._multilangService.translate('user.delete_account'),
        this._multilangService.translate('user.delete_account_msg'),
        this._multilangService.translate('user.delete_account_confirm')
      )
      .then((result)=>{
        if(result.value){
          if(this._userService.user.balance > 0){
            this._dialogService.inputEmail()
            .then((result)=>{
              if(result.value) this.sendDelete(result.value);
            });
          } else {
            this.sendDelete();
          }
        }
      });
    }).catch(err=>{});
  }

  private sendDelete(emailForPaypalPayment?: string): void {
    this._dialogService.loading();
    this._userService.deleteAsAuth(emailForPaypalPayment)
    .subscribe({
      next: (resp)=>{
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

  public takeAction(action: string): void {
    this.router.navigate([`/MyProfile/${action}`]);
  }

  get user(): User {
    return this._userService.user;
  }

}
