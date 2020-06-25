import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

// NG BOOTSTRAP
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

// INTERFACES
import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-admin-user-modal',
  templateUrl: './admin-user-modal.component.html',
  styleUrls: ['./admin-user-modal.component.css']
})
export class AdminUserModalComponent {
  @ViewChild('modalBody') private modalBody: ElementRef;
  @Input('id') public id: number; // user to update
  @Output('updated') public updated = new EventEmitter<User>();

  constructor(public activeModal: NgbActiveModal) { }

  /**
   * closes the modal
   */
  public close(): void {
    this.activeModal.close();
  }

  /**
   * emits the changes to the father, in this way the father can update
   * the user without make another http request
   * 
   * @param user User
   */
  public anUpdate(user: User): void {
    this.updated.emit(user);
  }

  public scrollToTop(): void {
    setTimeout(()=>{ // something weird made this scroll to top, and then to bottom, so i need the setTimeout
      this.modalBody.nativeElement.scrollTop = 320; // https://stackoverflow.com/questions/51517324/scrollto-method-doesnt-work-in-edge
    }, 300);
  }

}
