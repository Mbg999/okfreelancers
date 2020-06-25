import { Component, Output, EventEmitter } from '@angular/core';

// FORMS
import { FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { CustomValidators } from 'src/app/classes/custom-validators';

// NG BOOTSTRAP
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

// SERVICES
import { UserService } from 'src/app/services/user.service';
import { DialogService } from 'src/app/services/dialog.service';
import { ErrorService } from 'src/app/services/error.service';

// INTERFACES
import { User } from 'src/app/interfaces/user';


@Component({
  selector: 'app-user-auth-fast-login',
  templateUrl: './user-auth-security-login.component.html',
  styleUrls: ['./user-auth-security-login.component.css']
})
export class UserAuthSecurityLoginComponent {
  // @Output('loginResult') public loginResult = new EventEmitter<boolean>();
  public loginForm: FormGroup;
  public loginError: string;
  
  constructor(public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private _userService: UserService,
    private _dialogService: DialogService,
    private _errorService: ErrorService ) { 
      
      this.loginForm = fb.group({
        'lpassword': ['', [CustomValidators.required]]
      });
    }
    
  /**
    * Shows a Swal loading dialog and calls _userService login
    * if login success -> close Swal dialog -> navigate to home
    * if login error -> close Swal dialog -> save the backend error message into
    *   loginError and show it
    * when the modal is closed, it sends a boolean flag for know when the user is logged,
    * that flag is required for ng-bootstrap usage reasons, for know when the user
    * did a correct loggin and when user just close the modal with any of the options
    * 
    */
  public login(): void {
    this._dialogService.loading();
    this._userService.login(this.user.email, this.lpassword.value)
    .subscribe({
      next: (resp:any)=>{
        this._dialogService.close();
        // this.loginResult.emit(true);
        this.activeModal.close({logged: true});
      },
      error: (err:any)=>{
        this._dialogService.close();
        if(this._errorService.manipulableError(err.error)){
          this.loginError = err.error.errors;
        }
      }
    });
  }
  
  // GETTERS
  get user(): User {
    return this._userService.user;
  }
    
  get lpassword(): AbstractControl {
    return this.loginForm.get('lpassword');
  }
    
}
  