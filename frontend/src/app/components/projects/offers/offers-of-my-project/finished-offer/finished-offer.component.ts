import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';

// FORMS
import { FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { CustomValidators } from 'src/app/classes/custom-validators';

// SERVICES
import { MultilangService } from 'src/app/services/multilang.service';

// INTERFACES
import { Offer } from 'src/app/interfaces/offer';

// STAR RATING

@Component({
  selector: 'app-finished-offer',
  templateUrl: './finished-offer.component.html',
  styleUrls: ['./finished-offer.component.css']
})
export class FinishedOfferComponent implements OnInit {

  @Input('offer') public offer: Offer;
  public assessmentForm: FormGroup;
  public rate: number;
  @Output('newRate') private newRate = new EventEmitter<{rate: number, assessment: string}>();

  constructor(public _multilangService: MultilangService,
    private fb: FormBuilder) {
      this.assessmentForm = fb.group({
        'assessment': ['', [
          CustomValidators.required,
          CustomValidators.minLength(2),
          CustomValidators.maxLength(500)
        ]]
      });
  }

  ngOnInit(): void {
    if(this.offer.job.rate){
      this.rate = this.offer.job.rate;
      this.assessment.setValue(this.offer.job.assessment);
    } else {
      this.rate = 0;
    }
  }

  public onRate(rate: number): void {
    this.rate = rate;
  }

  public emitRate(): void {
    this.newRate.emit({rate: this.rate, assessment: this.assessment.value});
  }

  // GETTERS
  get assessment(): AbstractControl {
    return this.assessmentForm.get('assessment');
  }
}
