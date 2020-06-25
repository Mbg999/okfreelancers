import { Injectable } from '@angular/core';

// NG BOOTSTRAP
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

// COMPONENTS
import { BanModalComponent } from '../components/shareds/admin/ban-modal/ban-modal.component';

@Injectable({
  providedIn: 'root'
})
export class BanService {

  constructor(private modalService: NgbModal) { }

  /**
     * Open the modal for write or read a ban reason message
     * 
     * @param id number
     */
    public openBanReasonModal(reason: string= null): Promise<any> {
      const modalRef: NgbModalRef = this.modalService.open(BanModalComponent,{
        scrollable: true,
        windowClass: 'animated fadeInDown faster'
      });
      
      modalRef.componentInstance.reason = reason;
      
      return modalRef.result;
    }
}
