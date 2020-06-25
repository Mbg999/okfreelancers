import { Component, OnInit } from '@angular/core';

// FORMS
import { FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { CustomValidators } from 'src/app/classes/custom-validators';

// SERVICES
import { UserService } from 'src/app/services/user.service';
import { DialogService } from 'src/app/services/dialog.service';
import { ErrorService } from 'src/app/services/error.service';

@Component({
  selector: 'app-forgotten-password',
  templateUrl: './forgotten-password.component.html',
  styleUrls: ['./forgotten-password.component.css']
})
export class ForgottenPasswordComponent implements OnInit {

  public passwordResetForm: FormGroup;
  public passwordResetMsg: string;

  constructor(private fb: FormBuilder,
    private _userService: UserService,
    private _dialogService: DialogService,
    private _errorService: ErrorService) {

    this.passwordResetForm = fb.group({
      'remail': ['', [CustomValidators.required, CustomValidators.email]]
    });
  }

  ngOnInit(): void {
    this.passwordResetForm.markAsUntouched();
    this.passwordResetForm.markAsPristine();
  }


  /**
   * Sends a request for an email with a reset password token
   * asociated with the input email
   */
  public sendPasswordReset(): void {
    this._dialogService.loading();
    this._userService.sendPasswordReset(this.remail.value)
    .subscribe({
      next: (resp)=>{
        this.passwordResetMsg = resp.message;
        this._dialogService.close();
      },
      error: (err)=>{
        this._dialogService.close();
        this._errorService.handeError(err.error);
      }
    });
  }

  // GETTERS
  get remail(): AbstractControl{
    return this.passwordResetForm.get('remail');
  }
}
