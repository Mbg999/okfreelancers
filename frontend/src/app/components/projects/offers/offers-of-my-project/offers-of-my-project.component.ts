import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

// SERVICES
import { MultilangService } from 'src/app/services/multilang.service';
import { OfferService } from 'src/app/services/offer.service';
import { ErrorService } from 'src/app/services/error.service';
import { DialogService } from 'src/app/services/dialog.service';

// INTERFACES
import { OfferStatusCompany } from 'src/app/interfaces/offer-status-company';
import { JobService } from 'src/app/services/job.service';

@Component({
  selector: 'app-offers-of-my-project',
  templateUrl: './offers-of-my-project.component.html',
  styleUrls: ['./offers-of-my-project.component.css']
})
export class OffersOfMyProjectComponent implements OnInit, OnDestroy {

  @Input('project_id') private project_id: number;
  @Input('project_finished') public project_finished: string;
  public offers: OfferStatusCompany;
  public errHours: string[];
  public activeTab: number = 1;
  // multilang
  private multilang: Subscription;

  constructor(public _multilangService: MultilangService,
    private _offerService: OfferService,
    private _errorService: ErrorService,
    private _dialogService: DialogService,
    private _jobService: JobService,
    private currencyPipe: CurrencyPipe,
    private router: Router) { }

  ngOnInit(): void {
    this.getOffers();
    this.errHours = [];

    this.multilang = this._multilangService.onLangChangeEvent()
      .subscribe(()=>{
        this.getOffers();
    });
  }

  
  ngOnDestroy(): void {
    if(this.multilang) this.multilang.unsubscribe();
  }

  private getOffers(){
    this._offerService.getMyProjectOffers(this.project_id)
    .subscribe({
      next: (resp)=>{
        this.offers = resp.data;
        this.errHours = this.errHours.fill(null, 0, this.offers.in_progress_offers.length-1);
      },
      error: (err)=>{
        this._errorService.handeError(err.error);
      }
    });
  }

  public acceptAnOffer(i:number): void {
    this.errHours[i] = null;
    let company_deposit: number = this.offers.available_offers[i].price * this.offers.available_offers[i].approx_hours;
    this._dialogService.iconless(
      // TEXT
      this._multilangService.translate('offers.want_to_accept') +
      this._multilangService.translate('offers.amount_to_pay',
      {amount: this.currencyPipe.transform(company_deposit, 'EUR', 'symbol-narrow', null, this._multilangService.activeLang)}),
      // TITLE
      this._multilangService.translate('offers.accept_offer_question'),
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
        this._offerService.acceptAnOfferToMyProject(this.offers.available_offers[i].id, company_deposit)
        .subscribe({
          next: (resp)=>{
            this.offers.available_offers.splice(i,1);
            this.offers.pending_offers.unshift(resp.data.offer);
            this._dialogService.close();
            this._dialogService.success(this._multilangService.translate('offers.accepted'));
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
                this.offers.available_offers[i] = err.error.data;
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

  public cancelAnOffer(i: number): void {
    let company_deposit: number = this.offers.pending_offers[i].price * this.offers.pending_offers[i].approx_hours;
    this._dialogService.iconless(
      // TEXT
      this._multilangService.translate('offers.want_to_cancel') +
      this._multilangService.translate('offers.amount_to_refound',
      {amount: this.currencyPipe.transform(company_deposit, 'EUR', 'symbol-narrow', null, this._multilangService.activeLang)}),
      // TITLE
      this._multilangService.translate('offers.cancel_offer_question'),
      // CONFIRM BUTTON TEXT
      this._multilangService.translate('offers.cancel_offer'),
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
        this._offerService.cancelAnOfferToMyProject(this.offers.pending_offers[i].id, company_deposit)
        .subscribe({
          next: (resp)=>{
            this.offers.pending_offers.splice(i,1);
            this.offers.available_offers.push(resp.data.offer);
            this.offers.available_offers.sort((a,b)=>a.id-b.id);
            this._dialogService.close();
            this._dialogService.success(this._multilangService.translate('offers.cancelled'));
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

  public markAsFinished(i: number): void {
    let offer = this.offers.in_progress_offers[i];
    this._dialogService.iconless(
      // TEXT
      this._multilangService.translate('jobs.finish') +
      this._multilangService.translate('jobs.final_price',
      {amount: this.currencyPipe.transform(offer.price * offer.job.hours, 'EUR', 'symbol-narrow', null, this._multilangService.activeLang)}),
      // TITLE
      this._multilangService.translate('jobs.finish_question'),
      // CONFIRM BUTTON TEXT
      this._multilangService.translate('miscellaneous.finish'),
      // SHOW CANCEL BUTTON
      true,
      // CANCEL BUTTON TEXT
      this._multilangService.translate('miscellaneous.cancel')
    )
    .then((result)=>{
      if(result.value){
        this._dialogService.loading();
        this._jobService.markAsFinished(offer.id, offer.job.id, offer.job.hours)
          .subscribe({
            next: (resp)=>{
              this.offers.in_progress_offers[i].job = resp.data.job;
              this.offers.finished_offers.unshift(this.offers.in_progress_offers.splice(i,1)[0]);
              this._dialogService.close();
              this._dialogService.success('',this._multilangService.translate('jobs.correctly_finished'));
            },
            error: (err)=>{
              this._dialogService.close();
              if(this._errorService.manipulableError(err.error)){
                if(err.error.errors.hours) this.errHours[i] = this._multilangService.translate('jobs.hours_error');
                if(err.error.errors.balance) {
                  this._dialogService.error(err.error.errors.balance, '', this._multilangService.translate('user.goto_add_balance'), true)
                  .then((result)=>{
                    if(result.value){
                      this.router.navigate(['/MyBalance']);
                    }
                  });
                }
                if(err.error.errors.changed) {
                  this.offers.in_progress_offers[i].job.hours = err.error.data;
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

  public cancelJob(i: number): void {
    let offer = this.offers.in_progress_offers[i];
    this._dialogService.iconless(
      // TEXT
      this._multilangService.translate('jobs.cancel_text_company') +
      this._multilangService.translate('jobs.penalty_amount',
      {amount: this.currencyPipe.transform(offer.company_deposit * 0.2, 'EUR', 'symbol-narrow', null, this._multilangService.activeLang)}),
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
        this._jobService.cancelJobAsCompany(offer.id, offer.job.id)
          .subscribe({
            next: (resp)=>{
              this.offers.in_progress_offers[i] = resp.data.offer;
              this.offers.available_offers.push(this.offers.in_progress_offers.splice(i,1)[0]);
              this.offers.available_offers.sort((a,b) => a.id-b.id);
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
  
  public sendRate(i:number, rate: {rate: number, assessment: string}): void {
    this._dialogService.loading();
    this._jobService.rateAFinishedJob(this.offers.finished_offers[i].job.id, rate)
    .subscribe({
      next: (resp)=>{
        this.offers.finished_offers[i].job = resp.data;
        this._dialogService.close();
        this._dialogService.success('',this._multilangService.translate('jobs.correctly_rated'));
      },
      error: (err)=>{
        this._dialogService.close();
        this._errorService.handeError(err.error);
      }
    });
  }
}
