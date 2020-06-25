import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

// SERVICES
import { UserService } from './user.service';
import { DialogService } from './dialog.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor(private _userService: UserService,
    private _dialogService: DialogService,
    private router: Router) { }

  /**
   * Handles the connection, token auth or other errors with a dialog
   * 
   * @param error any
   */
  public handeError(error: any): void {
    console.error(error);
    if(error.status){
      this._dialogService.error(error.message || error.exception, error.status)
      .then(()=>{
        if(error.auth){
          this._userService.removeAuthData();
          this.router.navigate(['/']);
        }
      });
    } else {
      this._dialogService.connectionError();
    }
  }

  /**
   * Handles the connection and token auth errors with a dialog and
   * return false, if other, return true for handle it on the caller side
   * 
   * @param error any
   */
  public manipulableError(error: any): boolean {
    console.error(error);
    if(error.status){
      if(error.auth){
        this._dialogService.error(error.message, error.status)
        .then(()=>{
          this._userService.removeAuthData();
          this.router.navigate(['/']);
        });
      } else {
        return true;
      }
      
    } else {
      this._dialogService.connectionError();
    }

    return false;
  }
}
