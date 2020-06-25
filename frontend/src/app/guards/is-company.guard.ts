import { Injectable } from '@angular/core';

import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

// SERVICES
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class IsCompanyGuard implements CanActivate {

  constructor(private _authService: AuthService,
    private router: Router){ }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if(next.params.action != "create" && !this._authService.isCompany()){
      this.router.navigate(['/']);
    }
   
      
    return true;
  }
  
}
