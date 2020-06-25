import { Component, OnInit, Output, EventEmitter } from '@angular/core';

// FORMS
import { FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { CustomValidators } from 'src/app/classes/custom-validators';

// SERVICES
import { UserService } from 'src/app/services/user.service';
import { DialogService } from 'src/app/services/dialog.service';
import { ErrorService } from 'src/app/services/error.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  @Output() public logged = new EventEmitter<boolean>(); // this one is used for know when to close the modal
  public loginForm: FormGroup;
  public loginError: any;
  public forgottenPassword: boolean;

  constructor(private fb: FormBuilder,
    private _userService: UserService,
    private _dialogService: DialogService,
    private _errorService: ErrorService ) {

    this.loginForm = fb.group({
      'lemail': ['', [CustomValidators.required, CustomValidators.email]],
      'lpassword': ['', [CustomValidators.required]],
      'remember': [true,[]]
    });
   }
   
  
  ngOnInit(): void {
    this.loginForm.markAsUntouched();
    this.loginForm.markAsPristine();
  }

  /**
   * Shows a Swal loading dialog and calls _userService login
   * if login success -> close Swal dialog -> navigate to home
   * if login error -> close Swal dialog -> save the backend error message into
   *   loginError and show it
   * 
   * currently, only not a correct email and/or password or a not verified email can fail
   */
  public login(): void {
    this._dialogService.loading();
    this._userService.login(this.lemail.value, this.lpassword.value, this.remember.value)
    .subscribe({
      next: (resp:any)=>{
        this._dialogService.close();
        this.logged.emit(true);
      },
      error: (err:any)=>{
        this._dialogService.close();
        if(this._errorService.manipulableError(err.error)){
          this.loginError = err.error.errors;
        }
      }
    });
  }

  /**
   * an user needs to be verified for login, if the user
   * gets the non-verified error, the user will have the
   * option of get another email with a verify token,
   * this function sends the request for that email
   */
  public resendVerifyEmail(): void {
    this._dialogService.loading();
    this._userService.resendVerifyEmail(this.lemail.value)
    .subscribe({
      next: (resp)=>{
        this._dialogService.close();
        this._dialogService.success(resp.message);
      },
      error: (err)=>{
        this._dialogService.close();
        this._errorService.handeError(err.error);
      }
    });
  }

  // GETTERS
  get lemail(): AbstractControl{
    return this.loginForm.get('lemail');
  }

  get lpassword(): AbstractControl{
    return this.loginForm.get('lpassword');
  }

  get remember(): AbstractControl{
    return this.loginForm.get('remember');
  }

}
