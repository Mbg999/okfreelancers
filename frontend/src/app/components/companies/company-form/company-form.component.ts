import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';

// FORMS
import { FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { CustomValidators } from '../../../classes/custom-validators'

// SERVICES
import { HttpService } from 'src/app/services/http.service';
import { ErrorService } from 'src/app/services/error.service';

// INTERFACES
import { Company } from 'src/app/interfaces/company';
import { Editor } from 'primeng/editor/editor';

@Component({
  selector: 'app-company-form',
  templateUrl: './company-form.component.html',
  styleUrls: ['./company-form.component.css']
})
export class CompanyFormComponent implements OnInit {

  // inputs
  @Input('company') public company: Company;
  @Input('takenName') public takenName: string;
  // outputs
  @Output('result') public result = new EventEmitter<any>();
  // form
  @ViewChild('editor') public editor: Editor;
  public companyForm: FormGroup;
  public countries: any[];
  public regions: any[];
  public towns: any[];
  public logo: File;

  constructor(private fb: FormBuilder,
    private http: HttpService,
    private _errorService: ErrorService) {

    this.companyForm = fb.group({
      'name': ['', [
        CustomValidators.required,
        CustomValidators.minLength(1),
        CustomValidators.maxLength(100)
      ]],
      'description': ['', [
        CustomValidators.required,
        CustomValidators.minLength(1),
        CustomValidators.maxLength(1000)
      ]],
      'address': ['', [
        CustomValidators.required,
        CustomValidators.minLength(1),
        CustomValidators.maxLength(100)
      ]],
      'address_description': ['', [
        CustomValidators.minLength(1),
        CustomValidators.maxLength(500)
      ]],
      'zip': ['', [
        CustomValidators.required,
        CustomValidators.minLength(4),
        CustomValidators.maxLength(12)
      ]],
      'town': ['', [CustomValidators.required]],
      'region': ['', [CustomValidators.required]],
      'country': ['', [CustomValidators.required]],
      'web': ['', [
        CustomValidators.minLength(5),
        CustomValidators.maxLength(100)
      ]],
      'github': ['', [
        CustomValidators.minLength(20),
        CustomValidators.maxLength(100)
      ]],
      'linkedin': ['', [
        CustomValidators.minLength(1),
        CustomValidators.maxLength(100)
      ]],
      'twitter': ['', [
        CustomValidators.minLength(1),
        CustomValidators.maxLength(100)
      ]]
    });
    
   }

  ngOnInit(): void {
    this.getCountries(); // get countries
    if(this.company){ // // its an update, place the data
      this.name.setValue(this.company.name);
      this.description.setValue(this.company.description);
      this.address.setValue(this.company.address);
      this.address_description.setValue(this.company.address_description);
      this.zip.setValue(this.company.zip);
      this.web.setValue(this.company.web);
      this.github.setValue(this.company.github);
      this.linkedin.setValue(this.company.linkedin);
      this.twitter.setValue(this.company.twitter);
      if(this.company.country) {
        this.country.setValue(this.company.country);
        this.getRegions(this.company.country);
        if(this.company.region) {
          this.getTowns(this.company.region);
          this.region.setValue(this.company.region);
          this.town.setValue(this.company.town);
        }
      }
    }
  }

  /**
    * Retrieve all the country names as a string array
    */
   public getCountries(): void {
    this.http.get('/countries')
    .subscribe({
      next: (resp:any)=>{
        this.countries = resp.data;
      },
      error: (err)=>{
        this._errorService.handeError(err.error);
      }
    });
  }
  
  /**
  * Retrieves all the regions by a country name,
  * as a string array
  * 
  * @param country string
  */
  public getRegions(country:string): void {
    this.http.get(`/countries/${country}`)
    .subscribe({
      next: (resp:any)=>{
        this.regions = resp.data;
      },
      error: (err)=>{
        this._errorService.handeError(err.error);
      }
    });
  }
  
  /**
  * Retrieves all the towns by a region name,
  * as a string array
  * 
  * @param region string
  */
  public getTowns(region:string): void {
    this.http.get(`/regions/${region}`)
    .subscribe({
      next: (resp:any)=>{
        this.towns = resp.data;
      },
      error: (err)=>{
        this._errorService.handeError(err.error);
      }
    });
  }

  /**
   * Sends the form, it determines
   * if its a new freelancer or an update and
   * emits the data to the father
   */
  public send(): void {
    if(this.company){ // update
      this.result.emit(this.update());
    } else { // new
      this.result.emit(this.create());
    }
  }

  /**
   * returns a form data, in case of admin use, it needs the user_id to be setted in the parent component
   */
  private create(): FormData {
    let data: FormData = new FormData();
    data.set('name', this.name.value);
    data.set('description', this.description.value);
    data.set('description', this.description.value);
    data.set('address', this.address.value);
    data.set('address_description', this.address_description.value);
    data.set('zip', this.zip.value);
    data.set('town', this.town.value);
    data.set('region', this.region.value);
    data.set('country', this.country.value);
    data.set('web', this.web.value);
    data.set('github', this.github.value);
    data.set('linkedin', this.linkedin.value);
    data.set('twitter', this.twitter.value);
    if(this.logo){ // if user selected a logo, append it
      data.set('logo', this.logo, this.logo.name);
    }
    return data;
  }

  /**
  * Stores into a variable only the updated data,
  * ready for http sending, and return the variable
  */
  private update(): FormData {
    let data: FormData = new FormData();
    if(this.name.value != this.company.name){
      data.set('name', this.name.value);
    }
    
    if(this.description.value != this.company.description){
      data.set('description', this.description.value);
    }
    
    if(this.address.value != this.company.address){
      data.set('address', this.address.value);
    }
    
    if(this.address_description.value != this.company.address_description){
      data.set('address_description', this.address_description.value);
    }
    
    if(this.zip.value != this.company.zip){
      data.set('zip', this.zip.value);
    }
    
    if(this.town.value != this.company.town){
      data.set('town', this.town.value);
    }
    
    if(this.region.value != this.company.region){
      data.set('region', this.region.value);
    }
    
    if(this.country.value != this.company.country){
      data.set('country', this.country.value);
    }

    if(this.web.value != this.company.web){
      data.set('web', this.web.value);
    }
    
    if(this.github.value != this.company.github){
      data.set('github', this.github.value);
    }
    
    if(this.linkedin.value != this.company.linkedin){
      data.set('linkedin', this.linkedin.value);
    }
    
    if(this.twitter.value != this.company.twitter){
      data.set('twitter', this.twitter.value);
    }

    if(this.logo){
      data.set('logo', this.logo, this.logo.name);
    }
    
    return data;
  }

  // GETTERS
  get name(): AbstractControl{
    return this.companyForm.get('name');
  }
  
  get description(): AbstractControl{
    return this.companyForm.get('description');
  }
  
  get address(): AbstractControl{
    return this.companyForm.get('address');
  }
  
  get address_description(): AbstractControl{
    return this.companyForm.get('address_description');
  }
  
  get zip(): AbstractControl{
    return this.companyForm.get('zip');
  }
  
  get town(): AbstractControl{
    return this.companyForm.get('town');
  }
  
  get region(): AbstractControl{
    return this.companyForm.get('region');
  }
  
  get country(): AbstractControl{
    return this.companyForm.get('country');
  }

  get web(): AbstractControl{
    return this.companyForm.get('web');
  }
  
  get github(): AbstractControl{
    return this.companyForm.get('github');
  }
  
  get linkedin(): AbstractControl{
    return this.companyForm.get('linkedin');
  }
  
  get twitter(): AbstractControl{
    return this.companyForm.get('twitter');
  }
}
