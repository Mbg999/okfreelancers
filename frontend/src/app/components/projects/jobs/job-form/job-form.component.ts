import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

// FORMS
import { FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { CustomValidators } from '../../../../classes/custom-validators'

// INTERFACES
import { Job } from 'src/app/interfaces/job';

@Component({
  selector: 'app-job-form',
  templateUrl: './job-form.component.html',
  styleUrls: ['./job-form.component.css']
})
export class JobFormComponent implements OnInit {

  @Input('job') public job: Job;
  @Output('updatedHours') public updatedHours = new EventEmitter<number>();
  @Output('cancelJob') public cancelJob = new EventEmitter<boolean>();
  // form
  public jobForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.jobForm = fb.group({
      'hours': ['', [
        CustomValidators.required,
        CustomValidators.min(1),
        CustomValidators.max(99999)
      ]]
    });
  }

  ngOnInit(): void {
    if(this.job){ // update
      this.hours.setValue(this.job.hours);
      if(this.job.finished) this.hours.disable();
    }
  }

  // GETTERS
  get hours(): AbstractControl{
    return this.jobForm.get('hours');
  }

}
