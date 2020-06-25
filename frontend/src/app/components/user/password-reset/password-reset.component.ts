import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// FORMS
import { FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { CustomValidators } from 'src/app/classes/custom-validators';

// SERVICES
import { DialogService } from 'src/app/services/dialog.service';
import { UserService } from 'src/app/services/user.service';
import { ErrorService } from 'src/app/services/error.service';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.css']
})
export class PasswordResetComponent implements OnInit {

  // from parameters
  private email: string;
  private token: string;
  // form
  public resetPasswordForm: FormGroup;
  public showPassSecurity: boolean;
  // feedback
  public ok: boolean;
  public msg: string;
  public countdown: number;

  constructor(private route: ActivatedRoute,
    private fb: FormBuilder,
    private _userService: UserService,
    private _dialogService: DialogService,
    private router: Router,
    private _errorService: ErrorService) {

      this.resetPasswordForm = fb.group({
        'password': ['', [
          CustomValidators.required,
          CustomValidators.missingLowerCases,
          CustomValidators.missingUpperCases,
          CustomValidators.missingNumbers,
          CustomValidators.missingSpecialChars,
          CustomValidators.minLength(6)
        ]],
        'password_confirmation': ['', [CustomValidators.required]]
      }, {
        validator: CustomValidators.MustMatch('password_confirmation', 'password')
      });
    }

  ngOnInit(): void {
    this.route.params.subscribe((params)=>{
      this.email = params.email;
      this.token = params.token;
    });
  }

  /**
   * Send a reset password request with the email and token from params
   * and the new password, it returns if the pass was successfully changed
   * or not, after all, an interval of 5 seconds starts for redirect to root path
   */
  public resetPassword(): void {
    this._dialogService.loading();
    this._userService.resetPassword(this.email, this.token,
      this.password.value, this.password_confirmation.value)
      .subscribe({
        next: (resp)=>{
          this.ok = resp.ok;
          this.msg = resp.message;
          this._dialogService.close();
          this.redirection();
        },
        error: (err)=>{
          if(this._errorService.manipulableError(err.error)){
            this.ok = err.error.ok;
            this.msg = err.error.message;
            this.redirection();
          }
        }
      });
  }

  /**
   * Interval of 5 seconds, after it ends, it redirects to root path
   */
  private redirection(): void {
    this.countdown = 5;
    let interval = setInterval(()=>{
      this.countdown--;

      if(this.countdown < 1){
        clearInterval(interval);
        this.router.navigate(['/']);
      }
    },1000);
  }

  // GETTERS
  get password(): AbstractControl {
    return this.resetPasswordForm.get('password');
  }
  
  get password_confirmation(): AbstractControl {
    return this.resetPasswordForm.get('password_confirmation');
  }
}
