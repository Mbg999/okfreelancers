import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

// FORMS
import { FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { CustomValidators } from 'src/app/classes/custom-validators';

// SERVICES
import { AuthService } from 'src/app/services/auth.service';
import { HttpService } from 'src/app/services/http.service';
import { FileService } from 'src/app/services/file.service';
import { ErrorService } from 'src/app/services/error.service';

// INTERFACES
import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-update-user-form',
  templateUrl: './update-user-form.component.html',
  styleUrls: ['./update-user-form.component.css']
})
export class UpdateUserFormComponent implements OnInit {
  @Input('user') public user: User;
  // forms
  public userForm: FormGroup;
  public passwordForm: FormGroup;
  public countries: any[];
  public regions: any[];
  public towns: any[];
  // feedback msg
  @Input('takenEmail') public takenEmail: string;
  @Input('uploadingPicture') public uploadingPicture: boolean;
  @Input('pictureError') public pictureError: string;
  @Input('itsModal') public itsModal: boolean;
  public showPassSecurity: boolean;
  // outputs
  @Output('updateUser') public updateUser = new EventEmitter<User>();
  @Output('changePassword') public changePassword = new EventEmitter<User>();
  @Output('changePicture') public changePicture = new EventEmitter<File>();

  constructor(private fb: FormBuilder,
    private http: HttpService,
    private _authService: AuthService,
    private _fileService: FileService,
    private _errorService: ErrorService) {

    this.userForm = fb.group({
      'email': ['', [
        CustomValidators.required,
        CustomValidators.email
      ]],
      'name': ['', [
        CustomValidators.required,
        CustomValidators.minLength(2),
        CustomValidators.maxLength(100)
      ]],
      'surnames': ['', [
        CustomValidators.required,
        CustomValidators.minLength(2),
        CustomValidators.maxLength(100)
      ]],
      'born_date': ['', [CustomValidators.required, CustomValidators.bornDate]],
      'phone': ['', [
        CustomValidators.minLength(9),
        CustomValidators.maxLength(25)
      ]],
      'address': ['', [
        CustomValidators.minLength(1),
        CustomValidators.maxLength(100)
      ]],
      'address_description': ['', [
        CustomValidators.minLength(1),
        CustomValidators.maxLength(500)
      ]],
      'zip': ['', [
        CustomValidators.minLength(4),
        CustomValidators.maxLength(12)
      ]],
      'town': ['', []],
      'region': ['', []],
      'country': ['', []],
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
    
    this.passwordForm = fb.group({
      'password': ['', [
        CustomValidators.required,
        CustomValidators.missingLowerCases,
        CustomValidators.missingUpperCases,
        CustomValidators.missingNumbers,
        CustomValidators.missingSpecialChars,
        CustomValidators.minLength(6)
      ]],
      'password_confirmation': ['', [CustomValidators.required]]
    }, {
      validator: CustomValidators.MustMatch('password_confirmation', 'password')
    });
  }

  /**
   * sets the input field values (@Input is not ready at constructor time)
   *
   * loads the select fields
   *  - country
   *  - if user has country, regions
   *  - if user has region, towns
   */
   ngOnInit(): void {
    this.email.setValue(this.user.email);
    this.name.setValue(this.user.name);
    this.surnames.setValue(this.user.surnames);
    this.born_date.setValue(this.user.born_date);
    this.phone.setValue(this.user.phone);
    this.address.setValue(this.user.address);
    this.address_description.setValue(this.user.address_description);
    this.zip.setValue(this.user.zip);
    this.github.setValue(this.user.github);
    this.linkedin.setValue(this.user.linkedin);
    this.twitter.setValue(this.user.twitter);
    this.getCountries();
    if(this.user.country) {
      this.country.setValue(this.user.country);
      this.getRegions(this.user.country);
      if(this.user.region) {
        this.getTowns(this.user.region);
        this.region.setValue(this.user.region);
        this.town.setValue(this.user.town);
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
  * Retrieve only the updated data into a variable and
  * emits it to the father
  * 
  */
  public update(): void {
    this.updateUser.emit(this.dataForUpdateUser());
  }

  /**
    * When the change password inputs are ok, this, as first instance,
    * require a fast login for security reasons, if the loggin is ok, 
    * it emits the new password to the father
    * 
    */
   public changePass(): void {
    this._authService.securityAuth().then((result) => {
      this.changePassword.emit(<User>{
        password: this.password.value,
        password_confirmation: this.password_confirmation.value
      });
      
    })
    .catch(err=>{});
  }

  /**
  * Uses the file service to valdiate and edit a picture
  * 
  * emits the new picture to the father
  * the father uses the uploadingPicture flag to show an animation and disable
  * the add picture button
  * 
  * @param picture File
  */
  public changePic(picture: HTMLInputElement): void {
    this.pictureError = undefined;
    this._fileService.uploadImage(picture.files[0], FileService.pictureLogoSize)
    .then((resp:any)=>{
      picture.value = "";
      this.changePicture.emit(resp);
    })
    .catch((err)=>{ // if some error or the user just closed the modal
      this.pictureError = err;
      picture.value = "";
    });
  }

  /**
  * Stores into a variable only the updated data,
  * ready for http sending, and return the variable
  */
  public dataForUpdateUser(): User {
    let data: User = {};
    
    if(this.email.value && this.email.value != this.user.email){
      data["email"] = this.email.value;
    }
    
    if(this.name.value && this.name.value != this.user.name){
      data["name"] = this.name.value;
    }
    
    if(this.surnames.value && this.surnames.value != this.user.surnames){
      data["surnames"] = this.surnames.value;
    }
    
    if(this.born_date.value && this.born_date.value != this.user.born_date){
      data["born_date"] = this.born_date.value;
    }
    
    if(this.phone.value && this.phone.value != this.user.phone){
      data["phone"] = this.phone.value;
    }
    
    if(this.address.value && this.address.value != this.user.address){
      data["address"] = this.address.value;
    }
    
    if(this.address_description.value && this.address_description.value != this.user.address_description){
      data["address_description"] = this.address_description.value;
    }
    
    if(this.zip.value && this.zip.value != this.user.zip){
      data["zip"] = this.zip.value;
    }
    
    if(this.town.value && this.town.value != this.user.town){
      data["town"] = this.town.value;
    }
    
    if(this.region.value && this.region.value != this.user.region){
      data["region"] = this.region.value;
    }
    
    if(this.country.value && this.country.value != this.user.country){
      data["country"] = this.country.value;
    }
    
    if(this.github.value && this.github.value != this.user.github){
      data["github"] = this.github.value;
    }
    
    if(this.linkedin.value && this.linkedin.value != this.user.linkedin){
      data["linkedin"] = this.linkedin.value;
    }
    
    if(this.twitter.value && this.twitter.value != this.user.twitter){
      data["twitter"] = this.twitter.value;
    }
    
    return data;
  }


  // GETTERS
  get email(): AbstractControl{
    return this.userForm.get('email');
  }
  
  get password(): AbstractControl{
    return this.passwordForm.get('password');
  }
  
  get password_confirmation(): AbstractControl{
    return this.passwordForm.get('password_confirmation');
  }
  
  get name(): AbstractControl{
    return this.userForm.get('name');
  }
  
  get surnames(): AbstractControl{
    return this.userForm.get('surnames');
  }
  
  get born_date(): AbstractControl{
    return this.userForm.get('born_date');
  }
  
  get phone(): AbstractControl{
    return this.userForm.get('phone');
  }
  
  get address(): AbstractControl{
    return this.userForm.get('address');
  }
  
  get address_description(): AbstractControl{
    return this.userForm.get('address_description');
  }
  
  get zip(): AbstractControl{
    return this.userForm.get('zip');
  }
  
  get town(): AbstractControl{
    return this.userForm.get('town');
  }
  
  get region(): AbstractControl{
    return this.userForm.get('region');
  }
  
  get country(): AbstractControl{
    return this.userForm.get('country');
  }
  
  get github(): AbstractControl{
    return this.userForm.get('github');
  }
  
  get linkedin(): AbstractControl{
    return this.userForm.get('linkedin');
  }
  
  get twitter(): AbstractControl{
    return this.userForm.get('twitter');
  }
  
}
