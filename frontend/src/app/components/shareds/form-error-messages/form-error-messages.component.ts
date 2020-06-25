
import { Component, Input } from '@angular/core';

@Component({
  selector: 'form-error-messages',
  templateUrl: './form-error-messages.component.html',
  styleUrls: ['./form-error-messages.component.css']
})
/**
 * Takes an AbstractControl from father input and show its errors.
 * This centralizes the error messages in a single component.
 */
export class FormErrorMessagesComponent {
  @Input('control') public control: any;
  
}
