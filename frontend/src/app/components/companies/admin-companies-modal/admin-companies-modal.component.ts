import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';

// SERVICES
import { CompanyService } from 'src/app/services/company.service';
import { ErrorService } from 'src/app/services/error.service';
import { DialogService } from 'src/app/services/dialog.service';

// INTERFACES
import { Company } from 'src/app/interfaces/company';

// NG BOOTSTRAP
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-admin-companies-modal',
  templateUrl: './admin-companies-modal.component.html',
  styleUrls: ['./admin-companies-modal.component.css']
})
export class AdminCompaniesModalComponent implements OnInit {
  @ViewChild('modalBody') private modalBody: ElementRef;
  // inputs
  @Input('id') public id: number;
  public company: Company;
  public showForm: boolean;
  public user: string[]; // 0 -> id, 1 -> email
  public user_idError: string;
  public takenName: string;

  constructor(public activeModal: NgbActiveModal,
    private _companyService: CompanyService,
    private _errorService: ErrorService,
    private _dialogService: DialogService) { }

  ngOnInit(): void {
    if(this.id){ // update
      this.getCompany();
    } else { // create
      this.showForm = true;
    }
  }

  /**
   * Get the company to update data
   */
  private getCompany(): void {
    this._companyService.getACompanyAsAdmin(this.id)
    .subscribe({
      next: (resp)=>{
        this.company = resp.data;
        this.showForm = true;
      },
      error: (err)=>{
        this._errorService.handeError(err.error);
      }
    });
  }

  /**
   * Sends the data, it determines if its a new company or an update
   * 
   * @param company FormData
   */
  public send(company: FormData): void {
    this.takenName = undefined;
    if(this.id){ // its update
      this.update(company);
    } else { // its create
      this.create(company);
    }
  }

  /**
   * Sends the data for create a new company
   * it controls the posible errors with user_id error
   * 
   * @param company FormData
   */
  private create(company: FormData): void {
    this._dialogService.loading();
    company.set('user_id', this.user[0]);
    this._companyService.createAsAdmin(company)
      .subscribe({
        next: (resp)=>{
          this._dialogService.close();
          this.close(resp.data);
        },
        error: (err)=>{
          this._dialogService.close();
          if(this._errorService.manipulableError(err.error)){
            if(err.error.errors.user_id){
              this.user_idError = err.error.errors.user_id;
              this.modalBody.nativeElement.scrollTop = 0; // https://stackoverflow.com/questions/51517324/scrollto-method-doesnt-work-in-edge
            }
            if(err.error.errors.name){
              this.takenName = err.error.errors.name;
              this.modalBody.nativeElement.scrollTop = 0; // https://stackoverflow.com/questions/51517324/scrollto-method-doesnt-work-in-edge
            }
          }
        }
      });
  }

  /**
   * Sends the data for update a company
   * it controls the posible errors with user_id error
   * 
   * @param company FormData
   */
  private update(company: FormData): void {
    this._dialogService.loading();
    this._companyService.updateAsAdmin(this.id, company)
      .subscribe({
        next: (resp)=>{
          this._dialogService.close();
          this.close(resp.data);
        },
        error: (err)=>{
          this._dialogService.close();
          if(this._errorService.manipulableError(err.error) && err.error.errors.name){
            this.takenName = err.error.errors.name;
            this.modalBody.nativeElement.scrollTop = 0; // https://stackoverflow.com/questions/51517324/scrollto-method-doesnt-work-in-edge
          }
        }
      });
  }

  /**
   * Closes the modal, it returns the created/updated company data
   * 
   * @param company Company
   */
  public close(company: Company): void {
    this.activeModal.close(company);
  }

}
