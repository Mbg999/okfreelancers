import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';

// FORMS
import { FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { CustomValidators } from '../../../classes/custom-validators'

// SERVICES
import { ErrorService } from 'src/app/services/error.service';
import { CategoryService } from 'src/app/services/category.service';
import { SkillService } from 'src/app/services/skill.service';
import { MultilangService } from 'src/app/services/multilang.service';

// INTERFACES
import { CategorySelect } from 'src/app/interfaces/category-select';
import { SkillSelect } from 'src/app/interfaces/skill-select';
import { Project } from 'src/app/interfaces/project';
import { UserService } from 'src/app/services/user.service';
import { Editor } from 'primeng/editor/editor';

@Component({
  selector: 'app-project-form',
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.css']
})
export class ProjectFormComponent implements OnInit, OnDestroy {

  // inputs
  @Input('project') public project: Project;
  // outputs
  @Output('result') public result = new EventEmitter<any>();
  // form
  public projectForm: FormGroup;
  public picture: File;
  @ViewChild('editor') public editor: Editor;
  // categories
  public categories: CategorySelect[];
  public subcategories: CategorySelect[][];
  public selectedCat: CategorySelect;
  public selectedCats: CategorySelect[];
  public catErr: string;
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
    public _multilangService: MultilangService,
    private _userService: UserService) {
    
    this.projectForm = fb.group({
      'title': ['', [
        CustomValidators.required
      ]],
      'description': ['', [
        CustomValidators.required,
        CustomValidators.minLength(1),
        CustomValidators.maxLength(1000)
      ]],
      'budget': ['', [
        CustomValidators.required,
        CustomValidators.min(1),
        CustomValidators.max(99999999.99)
      ]],
      'advertisable': [true, []]
    });
  }
  
  ngOnInit(): void {
    this.getCategories(); // get categories
    if(this.project){ // its an update, place the data
      this.title.setValue(this.project.title);
      this.description.setValue(this.project.description);
      this.budget.setValue(this.project.budget);
      this.advertisable.setValue(this.project.advertisable);
      this.selectedCats = this.project.categories;
      this.selectedSkills = this.project.skills;
    } else {
      this.selectedCats = [];
      this.selectedSkills = [];
    }
    if(this.selectedCats.length > 0) this.getSkills();

    this.multilang = this._multilangService.onLangChangeEvent()
    .subscribe(()=>{
      this.subcategories = null;
      this.selectedCat = null;
      this.getCategories();
      this.getSkills();
    });
  }

  ngOnDestroy(): void {
    this.multilang.unsubscribe();
  }

  /**
  * retrieves all root categories
  */
  private getCategories(): void {
    this.catErr = undefined;
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
    this.catErr = undefined;
    if(i){ // not first empty select (empty string)
      // it comes as string, we need numbers
      i = parseInt(i);
      this.subcategories = []; // bidimensional array of categories
      // save the current selected root category
      this.selectedCat = this.categories[i];
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
    this.catErr = undefined;
    if(i){ // not first empty select (empty string)
      // it comes as string, we need numbers
      i = parseInt(i);
      subcat = parseInt(subcat);
      // save the current selected subcategory
      this.selectedCat = this.subcategories[subcat][i];
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

  public addCategory(): void {
    for(let cat of this.selectedCats){
      if(cat.id == this.selectedCat.id){
        this.catErr = this._multilangService.translate('categories.already_selected');
        return;
      }
    }
    this.selectedCats.push(this.selectedCat);
    this.selectedCat = undefined;
    this.getSkills();
  }

  public removeCategory(i: number){
    let aux: number[] = [];
    this.selectedSkills.map((skill, idx)=>{
      if(skill.category_id == this.selectedCats[i].id){
        aux.push(idx);
      }
    });
    aux.sort((a,b)=>b-a); // reorder indexes to delete, we will delete from last to first
    aux.map(idx=>this.selectedSkills.splice(idx,1));
    this.selectedCats.splice(i,1);
    this.getSkills();
  }

  /**
   * get the skills associated with a category id
   * it saves into the selectedSkills the oned that came with the freelancer data
   * if they are in the same category of the selectedCatId and
   * remove them from the available ones
   * 
   */
  private getSkills(): void {
    let categories_id = new FormData();
    this.selectedCats.map((cat,i)=>{
      categories_id.set(`categories[${i}]`, String(cat.id));
    });
    this._skillService.getSkillsOfMultipleCategories(categories_id)
    .subscribe({
      next: (resp)=>{
        if(this.project){
          this.originalSkills = this._skillService.availableSkills(resp.data, this.selectedSkills);
        } else {
          this.originalSkills = resp.data;
        }
        this.skills = JSON.parse(JSON.stringify(this.originalSkills)); // deep clone
        
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
    if(this.project){ // update
      this.result.emit(this.update());
    } else { // new
      this.result.emit(this.create());
    }
  }

  /**
   * returns a form data, in case of admin use, it needs the user_id to be setted in the parent component
   */
  private create(): Project {
    return {
      title: this.title.value,
      description: this.description.value,
      budget: this.budget.value,
      advertisable: (this.advertisable.value) ? 1 : 0,
      addCategories: this.selectedCats.map(cat=>cat.id),
      addSkills: this.selectedSkills.map(skill=>skill.id)
    };
  }

  /**
  * Stores into a variable only the updated data,
  * ready for http sending, and return the variable
  */
  private update(): Project {
    let data: Project = {
      addCategories: this.selectedCats.map(cat=>cat.id),
      addSkills: this.selectedSkills.map(skill=>skill.id)
    };

    if(this.title.value != this.project.title){
      data.title = this.title.value;
    }

    if(this.description.value != this.project.description){
      data.description = this.description.value;
    }

    if(this.budget.value != this.project.budget){
      data.budget = this.budget.value;
    }

    if(this.advertisable.value != this.project.advertisable){
      data.advertisable = (this.advertisable.value) ? 1 : 0;
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
  get title(): AbstractControl {
    return this.projectForm.get('title');
  }

  get description(): AbstractControl {
    return this.projectForm.get('description');
  }

  get budget(): AbstractControl {
    return this.projectForm.get('budget');
  }

  get advertisable(): AbstractControl {
    return this.projectForm.get('advertisable');
  }
}
