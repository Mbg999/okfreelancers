import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter, ViewChild } from '@angular/core';

// FORMS
import { FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { CustomValidators } from 'src/app/classes/custom-validators';

// SERVICES
import { OfferService } from 'src/app/services/offer.service';
import { DialogService } from 'src/app/services/dialog.service';
import { ErrorService } from 'src/app/services/error.service';

// INTERFACES
import { Offer } from 'src/app/interfaces/offer';
import { Editor } from 'primeng/editor/editor';

@Component({
  selector: 'app-offer-form',
  templateUrl: './offer-form.component.html',
  styleUrls: ['./offer-form.component.css']
})
export class OfferFormComponent implements OnChanges {

  @Input('project_id') private project_id: number;
  @Input('freelancer_id') private freelancer_id: number;
  @Input('offer') public offer: Offer;
  @Output('newOffer') private newOffer = new EventEmitter<Offer>();
  @ViewChild('editor') public editor: Editor;
  public offerForm: FormGroup;

  constructor(private fb: FormBuilder,
    private _offerService: OfferService,
    private _dialogService: DialogService,
    private _errorService: ErrorService) {

    this.offerForm = this.fb.group({
      'price': ['', [
        CustomValidators.required,
        CustomValidators.min(1),
        CustomValidators.max(99999999.99)
      ]],
      'approx_hours': ['', [
        CustomValidators.required,
        CustomValidators.min(1),
        CustomValidators.max(99999)
      ]],
      'approx_term': ['', [
        CustomValidators.required,
        CustomValidators.min(1),
        CustomValidators.max(99999)
      ]],
      'message': ['', [
        CustomValidators.required,
        CustomValidators.minLength(1),
        CustomValidators.maxLength(1000)
      ]]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.offer.currentValue){
      // set offer fields
      this.price.setValue(this.offer.price);
      this.approx_hours.setValue(this.offer.approx_hours);
      this.approx_term.setValue(this.offer.approx_term);
      this.message.setValue(this.offer.message);
    }
  }

  public create(): void {
    let offer: Offer = {
      project_id: this.project_id,
      freelancer_id: this.freelancer_id,
      price: this.price.value,
      approx_hours: this.approx_hours.value,
      approx_term: this.approx_term.value,
      message: this.message.value
    };

    this._dialogService.loading();
    this._offerService.create(offer)
    .subscribe({
      next: (resp)=>{
        this.newOffer.emit(resp.data);
        this._dialogService.close();
      },
      error: (err)=>{
        this._dialogService.close();
        this._errorService.handeError(err.error);
      }
    });
  }

  public update(): void {
    let offer: Offer = this.updatableData();

    this._dialogService.loading();
    this._offerService.update(this.offer.id, offer)
    .subscribe({
      next: (resp)=>{
        this.newOffer.emit(resp.data);
        this._dialogService.close();
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

  public delete(): void {
    this._dialogService.loading();
    this._offerService.delete(this.offer.id)
    .subscribe({
      next: (resp)=>{
        this.offerForm.reset();
        this.newOffer.emit(null);
        this._dialogService.close();
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

  private updatableData(): Offer {
    let data: Offer = {};

    if(this.price.value != this.offer.price){
      data.price = this.price.value
    }

    if(this.approx_hours.value != this.offer.approx_hours){
      data.approx_hours = this.approx_hours.value
    }

    if(this.approx_term.value != this.offer.approx_term){
      data.approx_term = this.approx_term.value
    }

    if(this.message.value != this.offer.message){
      data.message = this.message.value
    }

    return data;
  }

  // GETTERS
  get price(): AbstractControl {
    return this.offerForm.get('price')
  }

  get approx_hours(): AbstractControl {
    return this.offerForm.get('approx_hours')
  }

  get approx_term(): AbstractControl {
    return this.offerForm.get('approx_term')
  }

  get message(): AbstractControl {
    return this.offerForm.get('message')
  }

}
