import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';

// FORMS
import { FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { CustomValidators } from '../../../classes/custom-validators';

// SERVICES
import { ErrorService } from 'src/app/services/error.service';
import { CategoryService } from 'src/app/services/category.service';
import { SkillService } from 'src/app/services/skill.service';
import { MultilangService } from 'src/app/services/multilang.service';

// INTERFACES
import { Freelancer } from 'src/app/interfaces/freelancer';
import { CategorySelect } from 'src/app/interfaces/category-select';
import { SkillSelect } from 'src/app/interfaces/skill-select';
import { Editor } from 'primeng/editor/editor';

@Component({
  selector: 'app-freelancer-form',
  templateUrl: './freelancer-form.component.html',
  styleUrls: ['./freelancer-form.component.css']
})
export class FreelancerFormComponent implements OnInit, OnDestroy {
  // inputs
  @Input('freelancer') public freelancer: Freelancer;
  @Input('repeated') public repeated: string; // if the user already has a freelancer profile in a category
  // outputs
  @Output('result') public result = new EventEmitter<any>();
  // form
  public freelancerForm: FormGroup;
  public picture: File;
  @ViewChild('editor') public editor: Editor;
  // categories
  public categories: CategorySelect[];
  public subcategories: CategorySelect[][];
  private selectedCatId: number;
  // skills
  public showSkillsList: boolean;
  public originalSkills: SkillSelect[];
  public skills: SkillSelect[];
  public selectedSkills: SkillSelect[];
  // multilang
  private multilang: Subscription;
  
  constructor(private fb: FormBuilder,
    private _errorService: ErrorService,
    private _categoryService: CategoryService,
    private _skillService: SkillService,
    private _multilangService: MultilangService) {
    
    this.freelancerForm = fb.group({
      'category_id': ['', [
        CustomValidators.required
      ]],
      'title': ['', [
        CustomValidators.required,
        CustomValidators.minLength(1),
        CustomValidators.maxLength(80)
      ]],
      'description': ['', [
        CustomValidators.required,
        CustomValidators.minLength(1),
        CustomValidators.maxLength(1000)
      ]],
      'years_exp': ['', [
        CustomValidators.required,
        CustomValidators.in([1,2,5,7], true)
      ]],
      'approx_fee': ['', [
        CustomValidators.required,
        CustomValidators.min(0),
        CustomValidators.max(99999999.99)
      ]],
      'advertisable': [true, []]
    });

    this.multilang = this._multilangService.onLangChangeEvent()
    .subscribe(()=>{
      this.getSkills();
    });
  }
  
  ngOnInit(): void {
    this.getCategories(); // get categories
    if(this.freelancer){ // its an update, place the data
      this.getSkills();
      this.category_id.setValidators(null);
      this.title.setValue(this.freelancer.title);
      this.description.setValue(this.freelancer.description);
      this.years_exp.setValue(this.freelancer.years_exp);
      this.approx_fee.setValue(this.freelancer.approx_fee);
      this.advertisable.setValue(this.freelancer.advertisable);
    }
  }

  ngOnDestroy(): void {
    this.multilang.unsubscribe();
  }
  
  /**
  * retrieves all root categories
  */
  private getCategories(): void {
    this._categoryService.getCategories()
    .subscribe({
      next: (resp)=>{
        this.categories = resp.data;
      },
      error: (err)=>{
        this._errorService.handeError(err.error);
      }
    });
  }
  
  /**
  * retrieve all subcategories from a category name
  * 
  * @param i string
  */
  public getSubcategoriesFromRoot(i:any): void {
    if(i){ // not first empty select (empty string)
      // it comes as string, we need numbers
      i = parseInt(i);
      this.subcategories = []; // bidimensional array of categories
      // save the current selected root category
      this.selectedCatId = this.categories[i].id;
      this.getSkills();
      this._categoryService.getSubcategories(this.categories[i].name)
      .subscribe({
        next: (resp)=>{
          if(resp.data.length > 0){ // if the category has subcategories, it push the retrieved subcategories into subcategories bidimensional array
            this.subcategories.push(resp.data);
          }
        },
        error: (err)=>{
          this._errorService.handeError(err.error);
        }
      });
    }
  }
  
  /**
  * retrieve all subcategories from a subcategory name
  * 
  * @param category string
  */
  public getSubcategories(subcat:any, i:any): void {
    if(i){ // not first empty select (empty string)
      // it comes as string, we need numbers
      i = parseInt(i);
      subcat = parseInt(subcat);
      // save the current selected subcategory
      this.selectedCatId = this.subcategories[subcat][i].id;
      this.getSkills();
      this._categoryService.getSubcategories(this.subcategories[subcat][i].name) // selecting the name of the subcategory from the array of subcategories arrays
      .subscribe({
        next: (resp)=>{
          if(this.subcategories.length-1 > subcat){ // if a parent subcategory is changed, all the down level will be deleted
            this.subcategories.splice(subcat+1);
          }
          
          if(resp.data.length > 0){ // if the category has subcategories, it push the array of subcats retrieved into subcategories
            this.subcategories.push(resp.data);
          }
        },
        error: (err)=>{
          this._errorService.handeError(err.error);
        }
      });
    }
  }
  
  /**
   * get the skills associated with a category id
   * it saves into the selectedSkills the oned that came with the freelancer data
   * if they are in the same category of the selectedCatId and
   * remove them from the available ones
   * 
   */
  private getSkills(): void {
    this._skillService.getSkillsOfACategory((this.selectedCatId) ? this.selectedCatId : this.freelancer.category_id)
    .subscribe({
      next: (resp)=>{
        if(!this.selectedCatId || (this.freelancer?.category_id == this.selectedCatId && this.freelancer.skills.length > 0)){
          this.selectedSkills = this.freelancer.skills;
          this.originalSkills = this._skillService.availableSkills(resp.data, this.freelancer.skills);
        } else {
          this.selectedSkills = [];
          this.originalSkills = resp.data;
        }
        this.skills = JSON.parse(JSON.stringify(this.originalSkills));
        
      },
      error: (err)=>{
        this._errorService.handeError(err.error);
      }
    });
  }

  /**
   * Selects a new skill for the user
   * If the user press enter, it will pick the first one
   * in the list (position 0).
   * It removes the selected one from the availables
   * 
   * @param i number
   */
  public selectSkill(i: number = 0): void {
    this.originalSkills.map((skill, idx) => {
      if(skill.id == this.skills[i].id){
        this.originalSkills.splice(idx, 1);
      }
    });
    this.selectedSkills.push(this.skills.splice(i,1)[0]);
  }

  /**
   * Remove a skill from the selected ones and place it into
   * the available ones
   * 
   * @param i 
   */
  public removeSkill(i:number): void {
    let skill = this.selectedSkills.splice(i,1)[0];
    this.originalSkills.push(skill);
    this.skills.push(skill);
    this.originalSkills.sort((a, b)=>{
      return a.id - b.id;
    });
    this.skills.sort((a, b)=>{
      return a.id - b.id;
    });
  }

  /**
   * Sends the form, it determines
   * if its a new freelancer or an update and
   * emits the data to the father
   */
  public send(): void {
    if(this.freelancer){ // update
      this.result.emit(this.update());
    } else { // new
      this.result.emit(this.create());
    }
  }

  /**
   * returns a form data, in case of admin use, it needs the user_id to be setted in the parent component
   */
  private create(): FormData {
    let data = new FormData();
    
      data.set('category_id', String(this.selectedCatId));
      data.set('title', this.title.value);
      data.set('description', this.description.value);
      data.set('years_exp', this.years_exp.value);
      data.set('approx_fee', this.approx_fee.value);
      data.set('advertisable', (this.advertisable.value) ? '1' : '0');
      this.selectedSkills.map((skill, i)=>{
        data.set(`addSkills[${i}]`, String(skill.id));
      });
      if(this.picture){
        data.set('picture', this.picture, this.picture.name);
      }

      return data;
  }

  /**
  * Stores into a variable only the updated data,
  * ready for http sending, and return the variable
  */
  private update(): FormData {
    let data = new FormData();

    if(this.selectedCatId && this.selectedCatId != this.freelancer.category_id){
      data.set('category_id', String(this.selectedCatId));
    }

    if(this.title.value != this.freelancer.title){
      data.set('title', this.title.value);
    }

    if(this.description.value != this.freelancer.description){
      data.set('description', this.description.value);
    }

    if(this.years_exp.value != this.freelancer.years_exp){
      data.set('years_exp', this.years_exp.value);
    }

    if(this.approx_fee.value != this.freelancer.approx_fee){
      data.set('approx_fee', this.approx_fee.value);
    }

    if(this.advertisable.value != this.freelancer.advertisable){
      data.set('advertisable', (this.advertisable.value) ? '1' : '0');
    }

    this.selectedSkills.map((skill, i)=>{
      data.set(`addSkills[${i}]`, String(skill.id));
    });
    
    if(this.picture){
      data.set('picture', this.picture, this.picture.name);
    }

    return data;
  }

  /**
    * case insensitive search by skill name
    * 
    * @param search string
    */
   public search(search:string): void {
    if(!search){
      this.skills = JSON.parse(JSON.stringify(this.originalSkills)); // deep clone;
    } else {
      this.skills =  this.originalSkills.filter(skill => { // came cloned
        return skill.name.toLowerCase().indexOf(search.toLowerCase()) > -1
      });
    }
  }
  
  /**
  * clears the search bar by clicking the cross on it
  * 
  * @param field input
  */
  public clearSearchBar(field:any): void {
    field.value = "";
    this.search("");
    field.focus();
  }

  // GETTERS
  get category_id(): AbstractControl{
    return this.freelancerForm.get('category_id');
  }
  
  get title(): AbstractControl{
    return this.freelancerForm.get('title');
  }
  
  get description(): AbstractControl{
    return this.freelancerForm.get('description');
  }

  get years_exp(): AbstractControl{
    return this.freelancerForm.get('years_exp');
  }
  
  get approx_fee(): AbstractControl{
    return this.freelancerForm.get('approx_fee');
  }
  
  get advertisable(): AbstractControl{
    return this.freelancerForm.get('advertisable');
  }
}
