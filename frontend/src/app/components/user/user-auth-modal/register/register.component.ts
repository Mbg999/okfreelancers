import { Component, OnInit, Output, EventEmitter } from '@angular/core';

// FORMS
import { FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { CustomValidators } from 'src/app/classes/custom-validators';

// SERVICES
import { UserService } from 'src/app/services/user.service';
import { DialogService } from 'src/app/services/dialog.service';
import { ErrorService } from 'src/app/services/error.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  @Output() public registered = new EventEmitter<boolean>(); // this one is used for know when to close the modal
  public registerForm: FormGroup;
  public takenEmail: string;
  public showPassSecurity: boolean;
  public registeredMsg: string;

  constructor(private fb: FormBuilder, 
    private _userService: UserService,
    private _dialogService: DialogService,
    private _errorService: ErrorService ) {

    this.registerForm = fb.group({
      'email': ['', [
        CustomValidators.required,
        CustomValidators.email
      ]],
      'password': ['', [
        CustomValidators.required,
        CustomValidators.missingLowerCases,
        CustomValidators.missingUpperCases,
        CustomValidators.missingNumbers,
        CustomValidators.missingSpecialChars,
        CustomValidators.minLength(6)
      ]],
      'password_confirmation': ['', [CustomValidators.required]],
      'name': ['', [
        CustomValidators.required,
        CustomValidators.minLength(2),
        CustomValidators.maxLength(100)
      ]],
      'surnames': ['', [
        CustomValidators.required,
        CustomValidators.minLength(2),
        CustomValidators.maxLength(100)
      ]],
      'born_date': ['', [CustomValidators.required, CustomValidators.bornDate]]
    }, {
      validator: CustomValidators.MustMatch('password_confirmation', 'password')
    });
   }

  ngOnInit(): void {
    this.registerForm.markAsUntouched();
    this.registerForm.markAsPristine();
  }

   /**
   * Shows a Swal loading dialog and calls _userService register
   * if registration success -> close Swal dialog -> navigate to home
   * if registration error -> close Swal dialog -> save the backend error message into
   *   takenEmail and show it
   * 
   * currently, only taken email can fail
   */
  public register(): void {
    this._dialogService.loading();
    this._userService.register({
      email: this.email.value,
      password: this.password.value,
      password_confirmation: this.password_confirmation.value,
      name: this.name.value,
      surnames: this.surnames.value,
      born_date: this.born_date.value
    })
    .subscribe({
      next: (resp:any)=>{
        this._dialogService.close();
        this.registeredMsg = resp.message;
      },
      error: (err:any)=>{
        this._dialogService.close();
        if(this._errorService.manipulableError(err.error)){
          this.takenEmail = err.error.errors?.email;
        }
      }
    });
  }

  public close(): void {
    this.registered.emit(true);
  }

  // GETTERS
  get email(): AbstractControl{
    return this.registerForm.get('email');
  }

  get password(): AbstractControl{
    return this.registerForm.get('password');
  }

  get password_confirmation(): AbstractControl{
    return this.registerForm.get('password_confirmation');
  }

  get name(): AbstractControl{
    return this.registerForm.get('name');
  }

  get surnames(): AbstractControl{
    return this.registerForm.get('surnames');
  }

  get born_date(): AbstractControl{
    return this.registerForm.get('born_date');
  }

}
