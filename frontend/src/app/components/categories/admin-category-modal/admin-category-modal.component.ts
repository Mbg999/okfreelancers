import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { map } from 'rxjs/operators';

// FORMS
import { FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { CustomValidators } from 'src/app/classes/custom-validators';

// SERVICES
import { CategoryService } from 'src/app/services/category.service';
import { DialogService } from 'src/app/services/dialog.service';
import { ErrorService } from 'src/app/services/error.service';

// INTERFACES
import { Category } from 'src/app/interfaces/category';
import { CategorySelect } from 'src/app/interfaces/category-select';

// NG BOOTSTRAP
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

// NGX COLORPICKER
// in movile error: [Intervention] Unable to preventDefault inside passive event listener due to target being treated as passive
// https://developers.google.com/web/updates/2017/01/scrolling-intervention
import { ColorPickerControl } from '@iplab/ngx-color-picker';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin-category-modal',
  templateUrl: './admin-category-modal.component.html',
  styleUrls: ['./admin-category-modal.component.css']
})
export class AdminCategoryModalComponent implements OnInit {
  @ViewChild('modalBody') private modalBody: ElementRef;
  // input
  @Input('category') public category: Category; // category to update
  @Input('father') public father: any; // father category, id and name, id is required if its a new category
  // form
  public catForm: FormGroup;
  public categories: CategorySelect[];
  public subcategories: CategorySelect[][];
  private selectedCatId: number;
  public image: File;
  public title_color: ColorPickerControl;
  public text_color: ColorPickerControl;
  public background_color: ColorPickerControl;
  // feedback
  public takenName_en:string;
  public takenName_es:string;

  constructor(public activeModal: NgbActiveModal,
    private _categoryService: CategoryService,
    private _dialogService: DialogService,
    private fb: FormBuilder,
    private _errorService: ErrorService) {
      this.catForm = fb.group({
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
        ]],
        'portfolio_type': ['', []]
      });
      this.title_color = new ColorPickerControl();
      this.text_color = new ColorPickerControl();
      this.background_color = new ColorPickerControl();
  }

  ngOnInit(): void {
    this.selectedCatId = -2; // for default category
    this.getCategories();
    if(this.category){ // its update, load fields
      this.name_en.setValue(this.category.name_en);
      this.name_es.setValue(this.category.name_es);
      this.description_en.setValue(this.category.description_en);
      this.description_es.setValue(this.category.description_es);
      if(this.category.portfolio_type) this.portfolio_type.setValue(this.category.portfolio_type);
      this.title_color.setValueFrom(this.category.title_color);
      this.text_color.setValueFrom(this.category.text_color);
      this.background_color.setValueFrom(this.category.background_color);
    }
  }

  /**
    * retrieves all root categories,
    * remove the category itself for avoid that a parent can be child of his child
    */
    private getCategories(): void {
      this._categoryService.getCategories()
      .pipe(
        map((resp)=>{
          return this.removeSelf(resp.data);
        })
      )
      .subscribe({
        next: (resp)=>{
          this.categories = resp;
        },
        error: (err)=>{
          this._errorService.handeError(err.error);
        }
      });
    }

  /**
   * Retrieve all the subcategories by a category name and
   * pipe them for, in update cases, remove the category itself for avoid that a parent can be child of his child
   * 
   * @param name string
   */
  private retrieveSubcategories(name): Observable<CategorySelect[]>{
    return this._categoryService.getSubcategories(name)
      .pipe(
        map((resp)=>{
          return this.removeSelf(resp.data);
        })
      );
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
        this.retrieveSubcategories(this.categories[i].name)
        .subscribe({
          next: (resp)=>{
            if(resp.length > 0){ // if the category has subcategories, it push the retrieved subcategories into subcategories bidimensional array
              this.subcategories.push(resp);
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
      this.retrieveSubcategories(this.subcategories[subcat][i].name) // selecting the name of the subcategory from the array of subcategories arrays
      .subscribe({
        next: (resp)=>{
          if(this.subcategories.length-1 > subcat){ // if a parent subcategory is changed, all the down level will be deleted
            this.subcategories.splice(subcat+1);
          }

          if(resp.length > 0){ // if the category has subcategories, it push the array of subcats retrieved into subcategories
            this.subcategories.push(resp);
          }
        },
        error: (err)=>{
          this._errorService.handeError(err.error);
        }
      });
    }
  }

  /**
   * remove itself category for avoid that it can be child of one of his childs
   * only in update cases
   * 
   * @param data Category[]
   */
  private removeSelf(data:any): CategorySelect[] {
    if(this.category){ // only if updating
      data.map((cat, idx)=>{
        if(cat.id == this.category.id){
          data.splice(idx, 1);
        }
      });
    }
    return data;
  }

  /**
   * Send form, update or create
   * only taken name_en or name_es can fail
   */
  public send(): void {
    this.takenName_en = undefined;
    this.takenName_es = undefined;
    this._dialogService.loading();
    if(this.category){ // update
      this.update();
    } else { // create
      this.create();
    }
  }

  /**
   * Takes the changed values and updates the category
   */
  private update(): void {
    this._categoryService.update(this.category.id, this.getChanges())
      .subscribe({
        next: (resp)=>{
          this._dialogService.close();
          this.activeModal.close({category: resp.data});
        },
        error: (err)=>{
          this._dialogService.close();
          if(this._errorService.manipulableError(err.error)){
            if(err.error.errors.name_en){
              this.takenName_en = err.error.errors.name_en[0];
              this.modalBody.nativeElement.scrollTop = 0; // https://stackoverflow.com/questions/51517324/scrollto-method-doesnt-work-in-edge
            }
            if(err.error.errors.name_es){
              this.takenName_es = err.error.errors.name_es[0];
              this.modalBody.nativeElement.scrollTop = 0; // https://stackoverflow.com/questions/51517324/scrollto-method-doesnt-work-in-edge
            }
          }
        }
      });
  }

  /**
   * Creates a new category
   */
  private create(): void {
    let data: FormData = new FormData();
      data.set('name_en', this.name_en.value);
      data.set('name_es', this.name_es.value);
      data.set('description_en', this.description_en.value);
      data.set('description_es', this.description_es.value);
      data.set('title_color', this.title_color.value.toRgbaString());
      data.set('text_color', this.text_color.value.toRgbaString());
      data.set('background_color', this.background_color.value.toRgbaString());
      data.set('portfolio_type', this.portfolio_type.value);
      let father = this.getFather(); // takes the category father (default, null(root category), or category id)
      if(father){ // if its not null, append the father
        data.set('father_id', father);
      }
      if(this.image){ // if user selected an image, append it
        data.append('image', this.image, this.image.name);
      }
      this._categoryService.create(data)
      .subscribe({
        next: (resp)=>{
          this._dialogService.close();
          this.activeModal.close({category : resp.data});
        },
        error: (err)=>{
          this._dialogService.close();
          if(this._errorService.manipulableError(err.error)){
            if(err.error.errors.name_en){
              this.takenName_en = err.error.errors.name_en[0];
              this.modalBody.nativeElement.scrollTop = 0; // https://stackoverflow.com/questions/51517324/scrollto-method-doesnt-work-in-edge
            }
            if(err.error.errors.name_es){
              this.takenName_es = err.error.errors.name_es[0];
              this.modalBody.nativeElement.scrollTop = 0; // https://stackoverflow.com/questions/51517324/scrollto-method-doesnt-work-in-edge
            }
          }
        }
      });
  }

  /**
   * Returns the father id
   * -2 = default -> this.father.id
   * -1 = root category -> null
   * other = selected category or subcategory id
   */
  private getFather(): any {
    switch(this.selectedCatId){
      case -2: return (this.father?.id) ? this.father.id : null; // == -2 -> category we are in
      case -1: return null; // == -1 -> root category, null
      default: return this.selectedCatId; // picked caregory
    }
  }


  /**
   * Return the canged data for update
   */
  private getChanges(): FormData {
    let data: FormData = new FormData();

    if(this.selectedCatId > -2 && this.selectedCatId != this.category.id){
      data.set('father_id', String((this.selectedCatId < 0) ? null : this.selectedCatId));
      // -1 -> null, null = root
    }

    if(this.name_en.value != this.category.name_en){
      data.set('name_en', this.name_en.value);
    }

    if(this.name_es.value != this.category.name_es){
      data.set('name_es', this.name_es.value);
    }

    if(this.description_en.value != this.category.description_en){
      data.set('description_en', this.description_en.value);
    }

    if(this.description_es.value != this.category.description_es){
      data.set('description_es', this.description_es.value);
    }

    if(this.title_color.value.toRgbaString() != this.category.title_color){
      data.set('title_color', this.title_color.value.toRgbaString());
    }

    if(this.text_color.value.toRgbaString() != this.category.text_color){
      data.set('text_color', this.text_color.value.toRgbaString());
    }

    if(this.background_color.value.toRgbaString() != this.category.background_color){
      data.set('background_color', this.background_color.value.toRgbaString());
    }

    if(this.portfolio_type.value != this.category.portfolio_type){
      data.set('portfolio_type', this.portfolio_type.value);
    }

    if(this.image){
      data.set('image', this.image, this.image.name);
    }

    return data;
  }

  // GETTERS
  get name_en(): AbstractControl{
    return this.catForm.get('name_en');
  }

  get name_es(): AbstractControl{
    return this.catForm.get('name_es');
  }

  get description_en(): AbstractControl{
    return this.catForm.get('description_en');
  }

  get description_es(): AbstractControl{
    return this.catForm.get('description_es');
  }

  get portfolio_type(): AbstractControl{
    return this.catForm.get('portfolio_type');
  }
}
