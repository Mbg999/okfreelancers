import { Component, Input } from '@angular/core';

@Component({
  selector: 'password-error-messages',
  templateUrl: './password-error-messages.component.html',
  styleUrls: ['./password-error-messages.component.css']
})
/**
 * Takes an AbstractControl password from father input and 
 * show if the security requirements are valid or not
 */
export class PasswordErrorMessagesComponent {
  @Input('password') public password: any;

}
