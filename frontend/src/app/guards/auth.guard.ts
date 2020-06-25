import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

// SERVICES
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router,
    private _authService: AuthService){

  }

  /**
   * This guard check if the user is verified or not
   * in case hes not verified, an auth modal will open,
   * in case the user closes the modal with a success login, 
   * he will be redirected to the same route, and he will pass this guard
   * if the user did a success registration, he will be redirected to the same
   * route and he will need to login, if the user closes the modal, he will be
   * redirected to root path
   */
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
      if(!this._authService.isUserLogged()){
        this._authService.openUserAuthModal()
        .then((resp)=>{
          if(resp.type == 'logged' && resp.result) {
            this.goTo(state.url);
          } else {
            this.goTo("/");
          }
        })
        .catch((err)=>{
          this.goTo("/");
        });
      } else {
        return true;
      }
  }

  /**
   * Simple angular navigation
   * 
   * @param direction string
   */
  private goTo(direction: string): void {
    this.router.navigate([direction]);
  }
  
  
}
