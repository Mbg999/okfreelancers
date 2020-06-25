import { Component, Input } from '@angular/core';

// NG BOOTSTRAP
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-user-auth-modal',
  templateUrl: './user-auth-modal.component.html',
  styleUrls: ['./user-auth-modal.component.css']
})
export class UserAuthModalComponent {
  @Input('itsLogin') public itsLogin:any; // this one is used for know if the user requested for login or for register

  constructor(public activeModal: NgbActiveModal) { }

  /**
   * Closes the modal, sends a boolean flag for know when the user is logged,
   * that flag is required for ng-bootstrap usage reasons, for know when the user
   * did a correct loggin and when user just close the modal with any of the options
   * 
   * @param result boolean
   */
  public close(type: string, result: boolean): void {
    this.activeModal.close({type, result: result});
  }
  
}
