import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

// SERVICES
import { OfferService } from 'src/app/services/offer.service';
import { ErrorService } from 'src/app/services/error.service';
import { MultilangService } from 'src/app/services/multilang.service';
import { DialogService } from 'src/app/services/dialog.service';
import { JobService } from 'src/app/services/job.service';
import { UserService } from 'src/app/services/user.service';

// INTERFACES
import { Freelancer } from 'src/app/interfaces/freelancer';

// NG BOOTSTRAP
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-my-offers',
  templateUrl: './my-offers.component.html',
  styleUrls: ['./my-offers.component.css'],
  providers: [NgbDropdownConfig]
})
export class MyOffersComponent implements OnInit {
  
  public freelancers: Freelancer[];
  @Input('project_id') public project_id: number;
  @Input('project_finished') public project_finished: string;
  public selectedFreelancer: Freelancer;
  public errBalance: string;
  // multilang
  private multilang: Subscription;

  constructor(private _offerService: OfferService,
    private _errorService: ErrorService,
    public _multilangService: MultilangService,
    private _dialogService: DialogService,
    private _jobService: JobService,
    private currencyPipe: CurrencyPipe,
    private _userService: UserService,
    private router: Router,
    private dropdownConfig: NgbDropdownConfig) { }

  ngOnInit(): void {
    this.getMyOffersToAProject();
    this.dropdownConfig.placement = 'top-left';
    this.multilang = this._multilangService.onLangChangeEvent()
    .subscribe(()=>{
      this.getMyOffersToAProject();
    });
  }

  ngOnDestroy(): void {
    if(this.multilang) this.multilang.unsubscribe();
  }

  private getMyOffersToAProject(): void {
    if(this._userService.user?.roles.find(role=>role.id == 2)){
      this._offerService.getMyOffersToAProject(this.project_id)
      .subscribe({
        next: (resp)=>{
          this.freelancers = resp.data;
          if(this.selectedFreelancer){ // lang changed
            this.selectedFreelancer = this.freelancers.find((freelancer)=>freelancer.id == this.selectedFreelancer.id);
          }
        },
        error: (err)=>{
          this._errorService.handeError(err.error);
        }
      });
    } else {
      this.freelancers = []; // he has no freelancer role
    }
  }

  public takeProject(): void {
    let freelancer_deposit: number = this.selectedFreelancer.offer.price * this.selectedFreelancer.offer.approx_hours * 0.2; // 20%
    this._dialogService.iconless(
      // TEXT
      this._multilangService.translate('offers.want_to_take') +
      this._multilangService.translate('offers.amount_to_pay',
      {amount: this.currencyPipe.transform(freelancer_deposit, 'EUR', 'symbol-narrow', null, this._multilangService.activeLang)}),
      // TITLE
      this._multilangService.translate('offers.take_offer_question'),
      // CONFIRM BUTTON TEXT
      this._multilangService.translate('miscellaneous.accept'),
      // SHOW CANCEL BUTTON
      true,
      // CANCEL BUTTON TEXT
      this._multilangService.translate('miscellaneous.cancel')
    )
    .then((result)=>{
      if(result.value){
        this._dialogService.loading();
        this._offerService.takeProject(this.selectedFreelancer.offer.id, freelancer_deposit)
        .subscribe({
          next: (resp)=>{
            this.selectedFreelancer.offer = resp.data.offer;
            this.selectedFreelancer.job = resp.data.job;
            this._dialogService.close();
            this._dialogService.success(this._multilangService.translate('offers.taken'));
          },
          error: (err)=>{
            this._dialogService.close();
            if(this._errorService.manipulableError(err.error)){
              if(err.error.errors.balance) {
                this._dialogService.error(err.error.errors.balance, '', this._multilangService.translate('user.goto_add_balance'), true)
                .then((result)=>{
                  if(result.value){
                    this.router.navigate(['/MyBalance']);
                  }
                });
              }
              if(err.error.errors.changed) {
                this.selectedFreelancer.offer = err.error.data;
                this._dialogService.error(err.error.errors.changed);
              }
              if(err.error.errors.concurrence){
                this._dialogService.error(err.error.errors.concurrence)
                .then(()=>{
                  window.location.reload();
                });
              }
            }
          }
        });
      }
    });
  }

  public refuseProject(): void {
    this._dialogService.iconless(
      // TEXT
      this._multilangService.translate('offers.refuse_project_text'),
      // TITLE
      this._multilangService.translate('offers.refuse_project_question'),
      // CONFIRM BUTTON TEXT
      this._multilangService.translate('offers.refuse_project'),
      // SHOW CANCEL BUTTON
      true,
      // CANCEL BUTTON TEXT
      this._multilangService.translate('miscellaneous.cancel'),
      // CONFIRM BUTTON COLOR
      '#dc3545',
      // CANCEL BUTTON COLOR
      '#6c757d'
    )
    .then((result)=>{
      if(result.value){
        this._dialogService.loading();
        this._offerService.refuseProject(this.selectedFreelancer.offer.id)
        .subscribe({
          next: (resp)=>{
            this.selectedFreelancer.offer = resp.data;
            this._dialogService.close();
            this._dialogService.success(this._multilangService.translate('offers.refused'));
          },
          error: (err)=>{
            this._dialogService.close();
            if(this._errorService.manipulableError(err.error)){
              if(err.error.errors.concurrence){
                this._dialogService.error(err.error.errors.concurrence)
                .then(()=>{
                  window.location.reload();
                });
              }
            }
          }
        });
      }
    });
  }

  public updateHours(hours: number): void {
    this._jobService.updateHours(this.selectedFreelancer.job.id, hours)
    .subscribe({
      next: (resp)=>{
        this.selectedFreelancer.job = resp.data;
        this._dialogService.success(
          '',
          this._multilangService.translate('jobs.updated_hours')
        );
      },
      error: (err)=>{
        this._errorService.handeError(err.error);
      }
    });
  }

  public cancelJob(): void {
    this._dialogService.iconless(
      // TEXT
      this._multilangService.translate('jobs.cancel_text_freelancer') +
      this._multilangService.translate('jobs.penalty_amount',
      {amount: this.currencyPipe.transform(this.selectedFreelancer.offer.freelancer_deposit, 'EUR', 'symbol-narrow', null, this._multilangService.activeLang)}),
      // TITLE
      this._multilangService.translate('jobs.cancel_question'),
      // CONFIRM BUTTON TEXT
      this._multilangService.translate('jobs.cancel'),
      // SHOW CANCEL BUTTON
      true,
      // CANCEL BUTTON TEXT
      this._multilangService.translate('miscellaneous.cancel_action'),
      // CONFIRM BUTTON COLOR
      '#dc3545',
      // CANCEL BUTTON COLOR
      '#6c757d'
    )
    .then((result)=>{
      if(result.value){
        this._dialogService.loading();
        this._jobService.cancelJobAsFreelancer(this.selectedFreelancer.offer.id, this.selectedFreelancer.job.id)
          .subscribe({
            next: (resp)=>{
              this.selectedFreelancer.offer = resp.data.offer;
              delete this.selectedFreelancer.job;
              this._dialogService.close();
              this._dialogService.success('',this._multilangService.translate('jobs.correctly_canceled'));
            },
            error: (err)=>{
              this._dialogService.close();
              if(this._errorService.manipulableError(err.error)){
                if(err.error.errors.concurrence){
                  this._dialogService.error(err.error.errors.concurrence)
                  .then(()=>{
                    window.location.reload();
                  });
                }
              }
            }
          });
      }
    });
  }
}
