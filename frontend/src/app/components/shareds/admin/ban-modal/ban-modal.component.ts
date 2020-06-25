import { Component, OnInit, Input } from '@angular/core';

// NG BOOTSTRAP
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-ban-modal',
  templateUrl: './ban-modal.component.html',
  styleUrls: ['./ban-modal.component.css']
})
export class BanModalComponent implements OnInit {
  
  @Input('reason') public reason: string;
  public result: string;

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
    if(this.reason){
      this.result = this.reason;
    }
  }

  /**
   * Closes the modal and return the ban_reason result
   */
  public close(){
    this.activeModal.close(this.result);
  }

}
