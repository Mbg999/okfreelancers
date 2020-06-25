import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';

// SERVICES
import { FreelancerService } from 'src/app/services/freelancer.service';
import { ErrorService } from 'src/app/services/error.service';
import { DialogService } from 'src/app/services/dialog.service';

// INTERFACES
import { Portfolio } from 'src/app/interfaces/portfolio';

// NG BOOTSTRAP
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-admin-portfolio-modal',
  templateUrl: './admin-portfolio-modal.component.html',
  styleUrls: ['./admin-portfolio-modal.component.css']
})
export class AdminPortfolioModalComponent implements OnInit {
  @ViewChild('modalBody') private modalBody: ElementRef;
  @Input('freelancer_id') private freelancer_id: number;
  @Input('freelancer_picture') public freelancer_picture: string;
  @Input('portfolio_type') public portfolio_type: string;
  public portfolio: Portfolio[];
  public fileError: any[] = [];

  constructor(public activeModal: NgbActiveModal,
    private _freelancerService: FreelancerService,
    private _errorService: ErrorService,
    private _dialogService: DialogService) { }

  ngOnInit(): void {
    this.getPortfolio();
  }

  private getPortfolio(): void {
    this._freelancerService.getAPortfolioAsAdmin(this.freelancer_id)
    .subscribe({
      next: (resp)=>{
        this.portfolio = resp.data;
      },
      error: (err)=>{
        this._errorService.handeError(err.error);
      }
    });
  }

  public update(portfolio: FormData[]): void {
    this._dialogService.loading();
    this._freelancerService.updatePortfolioAsAdmin(this.freelancer_id, portfolio)
    .subscribe({
      next: (resp)=>{
        this.activeModal.close();
        this._dialogService.close();
      },
      error: (err)=>{
        this._dialogService.close();
        if(this._errorService.manipulableError(err)){
          // error comes in a string format like 'portfolio.0.file', 'portfolio.1.file'..., lets make it a more friendly message
          Object.keys(err.error.errors).forEach((error)=>{
            if(error.endsWith('.file')){
              let aux = error.split('.');
              this.fileError[parseInt(aux[1])] = {err:'miscellaneous.required_file'};
            }
          });
          this.modalBody.nativeElement.scrollTop = 0; // https://stackoverflow.com/questions/51517324/scrollto-method-doesnt-work-in-edge
        }
      }
    });
  }
}
