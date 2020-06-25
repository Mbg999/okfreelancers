import { Component, OnInit, Input } from '@angular/core';

// FORMS
import { FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { CustomValidators } from 'src/app/classes/custom-validators';

// SERVICES
import { SkillService } from 'src/app/services/skill.service';
import { DialogService } from 'src/app/services/dialog.service';
import { CategoryService } from 'src/app/services/category.service';
import { ErrorService } from 'src/app/services/error.service';

// INTERFACES
import { CategorySelect } from 'src/app/interfaces/category-select';
import { Skill } from 'src/app/interfaces/skill';

// NG BOOTSTRAP
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-admin-skill-modal',
  templateUrl: './admin-skill-modal.component.html',
  styleUrls: ['./admin-skill-modal.component.css']
})
export class AdminSkillModalComponent implements OnInit {
  @Input('skill') public skill: Skill; // skill to update
  // form
  public skillForm: FormGroup;
  public categories: CategorySelect[];
  public subcategories: CategorySelect[][];
  private selectedCatId: number;
  // feedback
  public takenName_en:string;
  public takenName_es:string;

  constructor(public activeModal: NgbActiveModal,
    private _skillService: SkillService,
    private _categoryService: CategoryService,
    private _dialogService: DialogService,
    private _errorService: ErrorService,
    private fb: FormBuilder) {
      this.skillForm = fb.group({
        'category_id': ['', CustomValidators.required],
        'name_en': ['', [
          CustomValidators.required,
          CustomValidators.minLength(1),
          CustomValidators.maxLength(50)
        ]],
        'name_es': ['', [
          CustomValidators.required,
          CustomValidators.minLength(1),
          CustomValidators.maxLength(50)
        ]],
        'description_en': ['', [
          CustomValidators.required,
          CustomValidators.minLength(1),
          CustomValidators.maxLength(255)
        ]],
        'description_es': ['', [
          CustomValidators.required,
          CustomValidators.minLength(1),
          CustomValidators.maxLength(255)
        ]]
      });
  }

  ngOnInit(): void {
    this.getCategories();
    if(this.skill){ // its update, load fields
      this.category_id.setValidators(null);
      this.name_en.setValue(this.skill.name_en);
      this.name_es.setValue(this.skill.name_es);
      this.description_en.setValue(this.skill.description_en);
      this.description_es.setValue(this.skill.description_es);
    }
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
        if(i < 0){ // selected default (-2) or as a new root category (-1)
          this.selectedCatId = i;
        } else {
          // save the current selected root category
          this.selectedCatId = this.categories[i].id;
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
   * Send form, update or create
   * only taken name_en or name_es can fail
   */
  public send(): void {
    // remove errors
    this.takenName_en = undefined;
    this.takenName_es = undefined;
    // loading dialog
    this._dialogService.loading();
    if(this.skill){ // update
      this.update();
    } else { // create
      this.create();
    }
  }

  /**
   * Update skill and close modal, it sends the updated category to admin skills
   */
  private update(): void {
      this._skillService.update(this.skill.id, this.getChanges())
      .subscribe({
        next: (resp)=>{
          this._dialogService.close();
          this.activeModal.close({skill: resp.data});
        },
        error: (err)=>{
          this._dialogService.close();
          if(this._errorService.manipulableError(err.error)){
            if(err.error.errors.name_en){
              this.takenName_en = err.error.errors.name_en[0];
            }
            if(err.error.errors.name_es){
              this.takenName_es = err.error.errors.name_es[0];
            }
          }
        }
      });
  }

  /**
   * Create a new skill and close modal, it sends the updated category to admin skills
   */
  private create(): void {
      let form: FormData = new FormData();
      form.set('name_en', this.name_en.value);
      form.set('name_es', this.name_es.value);
      form.set('description_en', this.description_en.value);
      form.set('description_es', this.description_es.value);
      form.set('category_id', String(this.selectedCatId));
      this._skillService.create(form)
      .subscribe({
        next: (resp)=>{
          this._dialogService.close();
          this.activeModal.close({skill : resp.data});
        },
        error: (err)=>{
          this._dialogService.close();
          if(this._errorService.manipulableError(err.error)){
            if(err.error.errors.name_en){
              this.takenName_en = err.error.errors.name_en[0];
            }
            if(err.error.errors.name_es){
              this.takenName_es = err.error.errors.name_es[0];
            }
          }
        }
      });
  }

  /**
   * Return the canged data for update
   */
  private getChanges(): Skill {
    let data: Skill = {};

    if(this.selectedCatId && this.selectedCatId != this.skill.category_id){
      data.category_id = this.selectedCatId;
    }

    if(this.name_en.value != this.skill.name_en){
      data.name_en = this.name_en.value
    }

    if(this.name_es.value != this.skill.name_es){
      data.name_es = this.name_es.value
    }

    if(this.description_en.value != this.skill.description_en){
      data.description_en = this.description_en.value
    }

    if(this.description_es.value != this.skill.description_es){
      data.description_es = this.description_es.value
    }
    
    return data;
  }

  // GETTERS
  get name_en(): AbstractControl {
    return this.skillForm.get('name_en');
  }

  get name_es(): AbstractControl {
    return this.skillForm.get('name_es');
  }

  get description_en(): AbstractControl {
    return this.skillForm.get('description_en');
  }

  get description_es(): AbstractControl {
    return this.skillForm.get('description_es');
  }

  get category_id(): AbstractControl {
    return this.skillForm.get('category_id');
  }

}
