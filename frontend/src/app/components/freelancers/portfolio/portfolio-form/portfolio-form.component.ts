import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

// FORMS
import { FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { CustomValidators } from '../../../../classes/custom-validators'

// INTERFACES
import { Portfolio } from 'src/app/interfaces/portfolio';

@Component({
  selector: 'app-portfolio-form',
  templateUrl: './portfolio-form.component.html',
  styleUrls: ['./portfolio-form.component.css']
})
export class PortfolioFormComponent implements OnChanges {

  @Input('portfolio') public portfolio: Portfolio[];
  @Input('portfolio_type') public portfolio_type: string;
  @Input('freelancer_picture') public freelancer_picture;
  @Output('result') public result = new EventEmitter<any>();
  public files: File[] = [];
  public removedPortfolio: Portfolio[] = [];
  public portfolioForm: FormGroup[] = [];
  public clear: boolean[];
  @Input('fileError') public fileError: any[];

  constructor(private fb: FormBuilder){
    for(let i = 0; i<3; i++){
      this.portfolioForm[i] = fb.group({
          'title': ['', [
            CustomValidators.minLength(3),
            CustomValidators.maxLength(80)
          ]],
          'description': ['', [
            CustomValidators.minLength(3),
            CustomValidators.maxLength(250)
          ]]
      });
    }
    this.clear = Array(this.portfolioForm.length).fill(false);
  }

  ngOnChanges(changes: SimpleChanges): void {
    for(let i = 0; i<this.portfolio.length; i++){ // padding null at empty positions + set values
      if(this.portfolio[i].position > i+1){
        this.portfolio.splice(i,0,null);
      } else {
        this.setValueToForm(i, this.portfolio[i].title, this.portfolio[i].description);
      }
    }
  }

  public save(): void {
    let data = new FormData();
    let idx = 0;
    for(let i = 0; i<this.portfolioForm.length; i++){ // emit only changed or created ones
      if(this.validateData(i)){ // create or update form
        data.set(`portfolio[${idx}][position]`, String(i+1));
        data.set(`portfolio[${idx}][title]`, this.title(i).value);
        data.set(`portfolio[${idx}][description]`, this.description(i).value);
        if(this.files[i]) data.set(`portfolio[${idx}][file]`, this.files[i], this.files[i].name);
        idx++;
        this.files[i] = undefined;
        this.clear[i] = true;
      }
    }

    this.result.emit(data);
  }

  private validateData(i: number): boolean {
    return (this.portfolioForm[i].valid // its valid
    && ( // its new or has changes
      (this.files[i] || this.portfolio[i]?.file) || // has file
      this.title(i).value || // has title
      this.description(i).value // has description
    )) ? true : false;
  }

  public addFile(i: number, file: File): void {
    this.files[i] = file;
  }

  public removeFile(i: number): void {
    this.files.splice(i,1,null);
  }

  public removePortfolio(i: number): void {
    this.removedPortfolio[i] = this.portfolio.splice(i,1,null)[0];
    this.files[i] = undefined;
    this.clear[i] = true;
    this.setValueToForm(i,'','',true);
  }

  public restorePortfolio(i: number): void {
    this.portfolio[i] = this.removedPortfolio.splice(i,1,null)[0];
    this.setValueToForm(i, this.portfolio[i].title, this.portfolio[i].description);
  }

  public setValueToForm(i: number, title: string, description: string, remove=false): void {
    this.title(i).setValue(title);
    this.description(i).setValue(description);
    if(remove){
      this.portfolioForm[i].markAsTouched();
      this.portfolioForm[i].markAsDirty();
    } else {
      this.portfolioForm[i].markAsUntouched();
      this.portfolioForm[i].markAsPristine();
    }
  }

  public checkSaveButton(): boolean {
    let result: boolean[] = [];
    for(let i in this.portfolioForm){
      if((this.files[i] && this.portfolioForm[i].valid) || // new file
        (this.portfolio[i]?.file && this.portfolioForm[i].valid) || // only form
        (!this.portfolio[i]?.file && this.portfolioForm[i].valid)){ // empty
        result[i] = false;
      } else {
        result[i] = true;
      }
    }

    for(let i in result){ // if one is true, disable button
      if(result[i]){
        return true;
      }
    }
    return false;
  }

  // GETTERS
  public title(i: number): AbstractControl{
    return this.portfolioForm[i].get('title');
  }

  public description(i: number): AbstractControl{
    return this.portfolioForm[i].get('description');
  }
}
