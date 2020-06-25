import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';

// SERVICES
import { FreelancerService } from 'src/app/services/freelancer.service';
import { ErrorService } from 'src/app/services/error.service';

// INTERFACES
import { Freelancer } from 'src/app/interfaces/freelancer';

// NG BOOTSTRAP
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-admin-freelancers-modal',
  templateUrl: './admin-freelancers-modal.component.html',
  styleUrls: ['./admin-freelancers-modal.component.css']
})
export class AdminFreelancersModalComponent implements OnInit {
  @ViewChild('modalBody') private modalBody: ElementRef;
  // inputs
  @Input('id') public id: number;
  public freelancer: Freelancer;
  public showForm: boolean;
  public user: string[]; // 0 -> id, 1 -> email
  public user_idError: string;
  public repeated: string;

  constructor(public activeModal: NgbActiveModal,
    private _freelancerService: FreelancerService,
    private _errorService: ErrorService) { }

  ngOnInit(): void {
    if(this.id){ // update
      this.getFreelancer();
    } else { // create
      this.showForm = true;
    }
  }

  /**
   * Get the freelancer to update data
   */
  private getFreelancer(): void {
    this._freelancerService.getAFreelancerAsAdmin(this.id)
    .subscribe({
      next: (resp)=>{
        this.freelancer = resp.data;
        this.showForm = true;
      },
      error: (err)=>{
        this._errorService.handeError(err.error);
      }
    });
  }

  /**
   * Sends the data, it determines if its a new freelancer or an update
   * 
   * @param freelancer FormData
   */
  public send(freelancer: FormData): void {
    if(this.id){ // its update
      this.update(freelancer);
    } else { // its create
      this.create(freelancer);
    }
  }

  /**
   * Sends the data for create a new freelancer
   * it controls the posible errors with user_id error and 
   * repeated profiles (same user, same category)
   * 
   * @param freelancer FormData
   */
  private create(freelancer: FormData): void {
    freelancer.set('user_id', this.user[0]);
    this._freelancerService.createAsAdmin(freelancer)
      .subscribe({
        next: (resp)=>{
          this.close(resp);
        },
        error: (err)=>{
          if(this._errorService.manipulableError(err.error)){
            if(err.error.errors?.user_id){
              this.user_idError = err.error.errors.user_id;
              this.modalBody.nativeElement.scrollTop = 0; // https://stackoverflow.com/questions/51517324/scrollto-method-doesnt-work-in-edge
            }
            if(err.error.errors?.category_id){
              this.repeated = err.error.errors.category_id;
              this.modalBody.nativeElement.scrollTop = 0; // https://stackoverflow.com/questions/51517324/scrollto-method-doesnt-work-in-edge
            }
          }
        }
      });
  }

  /**
   * Sends the data for update a freelancer profile
   * it controls the posible errors with user_id error and 
   * repeated profiles (same user, same category)
   * 
   * @param freelancer FormData
   */
  private update(freelancer: FormData): void {
    this._freelancerService.updateAsAdmin(this.id, freelancer)
      .subscribe({
        next: (resp)=>{
          this.close(resp.data);
        },
        error: (err)=>{
          if(this._errorService.manipulableError(err.error)){
            if(err.error.errors?.user_id){
              this.user_idError = err.error.errors.user_id;
              this.modalBody.nativeElement.scrollTop = 0; // https://stackoverflow.com/questions/51517324/scrollto-method-doesnt-work-in-edge
            }
            if(err.error.errors?.category_id){
              this.repeated = err.error.errors.category_id;
              this.modalBody.nativeElement.scrollTop = 0; // https://stackoverflow.com/questions/51517324/scrollto-method-doesnt-work-in-edge
            }
          }
        }
      });
  }

  /**
   * Closes the modal, it returns the created/updated freelancer data
   * 
   * @param freelancer Freelancer
   */
  public close(freelancer: Freelancer): void {
    this.activeModal.close(freelancer);
  }


}
