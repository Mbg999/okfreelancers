import { Injectable } from '@angular/core';

// SERVICES
import { UserService } from '../services/user.service';

// NG BOOTSTRAP
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

// COMPONENTS
import { UserAuthModalComponent } from '../components/user/user-auth-modal/user-auth-modal.component';
import { UserAuthSecurityLoginComponent } from '../components/user/user-auth-security-login/user-auth-security-login.component';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  constructor(private _userService: UserService,
    private modalService: NgbModal) { }
    
    public isUserLogged(): boolean {
      return (this._userService.user) ? true : false;
    }
    
    public isAdmin(): boolean {
      return this.isUserLogged() && this.checkRole(42);
    }

    public isCompany(): boolean {
      return this.isUserLogged() && this.checkRole(1);
    }

    public isFreelancer(): boolean {
      return this.isUserLogged() && this.checkRole(2);
    }
    
    private checkRole(id: number): boolean {
      for(let role of this._userService.user.roles){
        if(role.id === id){
          return true;
        }
      }
      return false;
    }
    
    /**
     * Open the default auth modal, login and register
     * receives a boolean to determinate the default view
     * login by default
     * 
     * @param itsLogin boolean
     */
    public openUserAuthModal(itsLogin: boolean=true): Promise<any> {
      const modalRef: NgbModalRef = this.modalService.open(UserAuthModalComponent,{
        // backdropClass: 'bg-primary',
        windowClass: 'animated fadeInDown faster'
        // windowClass: 'dark-modal'
      });
      
      modalRef.componentInstance.itsLogin = itsLogin;
      return modalRef.result;
    }
    
    /**
    * For security reasons, some options needs a fast authentication, i don't want trolls or hackers!
    * 
    * This method opens a fast login modal and retun the loginResult (it will return true only if the user logged correctly,
      * if the user closes the modal, it won't return a next method, so the user did not pass the login)
      */
      public securityAuth(): Promise<any> {
        const modalRef: NgbModalRef = this.modalService.open(UserAuthSecurityLoginComponent,{
          // backdropClass: 'bg-primary',
          windowClass: 'animated fadeInDown faster'
          // windowClass: 'dark-modal'
        });
        
        // this catch the modal Output emitters
        // return modalRef.componentInstance.loginResult;
        return modalRef.result;
      }
    }
    