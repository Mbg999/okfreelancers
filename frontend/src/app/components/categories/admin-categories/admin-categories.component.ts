import { Component, OnInit } from '@angular/core';

// SERVICES
import { CategoryService } from 'src/app/services/category.service';
import { DialogService } from 'src/app/services/dialog.service';
import { MultilangService } from 'src/app/services/multilang.service';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';

// INTERFACES
import { Category } from 'src/app/interfaces/category';

// NG BOOTSTRAP
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

// COMPONENTS
import { AdminCategoryModalComponent } from '../admin-category-modal/admin-category-modal.component';

@Component({
  selector: 'app-admin-categories',
  templateUrl: './admin-categories.component.html',
  styleUrls: ['./admin-categories.component.css']
})
export class AdminCategoriesComponent implements OnInit {
  
  public originalCategories: Category[]; // cats or subcats, this will save all the data
  public categories: Category[]; // cats or subcats, this will be shown and filtered and use the originalCategories for restore the data
  public father: Category; // only if its a subcategory request
  public tree: string[]; // breadcrumb tree
  
  constructor(private _multilangService: MultilangService,
    private _categoriesService: CategoryService,
    private _dialogService: DialogService,
    private _authService: AuthService,
    private modalService: NgbModal,
    private _errorService: ErrorService) { }
    
    /**
     * starts the tree for breadcrumb and retrieve the categories
     */
    ngOnInit(): void {
      // this.tree = ['⮞']; // optimal 
      this.tree = []; // better translation
      this._multilangService.translateStream(['miscellaneous.root'])
      .subscribe({
        next: (resp)=>{
          this.tree[0] = resp["miscellaneous.root"];
        },
        error: (err)=>{}
      });
      this.getCategories();
    }
    
    /**
    * retrieve category or subcategory by the param name
    */
    public retrieveCategory(name:string): void {
      this._categoriesService.getCategoryAsAdmin(name)
      .subscribe({
        next: (resp)=>{
          this.father = resp.data;
        },
        error: (err)=>{
          this._errorService.handeError(err.error);
        }
      });
    }

    /**
     * Open the modal for create or update a category or subcategory
     * 
     * @param category Category
     */
    private openCategorymodal(category: Category=null): Promise<any> {
      const modalRef: NgbModalRef = this.modalService.open(AdminCategoryModalComponent,{
        scrollable: true,
        windowClass: 'animated fadeInDown faster'
      });
      
      modalRef.componentInstance.category = category;
      modalRef.componentInstance.father = (!this.father) ? null :{
        id: this.father.id,
        name: this.getTranslatedFatherName()
      }
      
      return modalRef.result
    }

    /**
     * Create a new category or subcategory
     */
    public create(): void {
      this.openCategorymodal()
      .then((result)=>{
        // check if its needed to save the category into originalCategories, for do not make another http request
        if(!result.category.father_id && !this.father || // currently = root, and result its a new root
          result.category.father_id == this.father?.id){ // currently = subcategory, and result its a new subcategory of this father
            this.originalCategories.push(result.category);
            this.categories.push(result.category);
            this.originalCategories.sort((a,b)=>a.id-b.id);
            this.categories.sort((a,b)=>a.id-b.id);
        }
      })
      .catch((err)=>{}); // nbBootstrap modal requirements
    }

    /**
     * Update a subcategory from the table
     * 
     * @param i number
     */
    public update(i:number): void {
      this.openCategorymodal(this.categories[i])
      .then((result)=>{
        this.originalCategories.map((cat, idx)=>{
           // check if its needed to save or delete the category into originalCategories, for do not make another http request
          if(cat.id == this.categories[i].id){ // looking for the updated category into categories array
            if(cat.father_id != result.category.father_id){ // if the updated category has changed the father_id, this subcategory should not be showed here
              // deleting the updated category from our categories list
              this.originalCategories.splice(idx, 1);
              this.categories.splice(i, 1);
            } else { // its the same father, it should be showed here
              // update into our categories list
              this.originalCategories[idx] = result.category;
              this.categories[i] = result.category; // in filtering cases, the reference will not be added
            }
          }
        });
      })
      .catch((err)=>{}); // nbBootstrap modal requirements
    }

    /**
     * Update the father category
     */
    public updateFather(): void {
      this.openCategorymodal(this.father)
      .then((result)=>{
        this.father = result.category;
      })
      .catch((err)=>{}); // ngBootstrap requirements
    }

    /**
     * Activate or deactivate a subcategory from the table,
     * by toggling the SoftDeleted field deleted_at
     * 
     * @param i number
     */
    public toggleDeleted_at(i: number): void {
      this._dialogService.danger( // dialog messages
        this._multilangService.translate('miscellaneous.sure_from_this_action'),
        this._multilangService.translate('miscellaneous.action_msg'),
        (this.categories[i].deleted_at) ? 
        this._multilangService.translate("miscellaneous.activate") :
        this._multilangService.translate("miscellaneous.deactivate") 
      )
      .then((result)=>{
        if(result.value){
          if(this.categories[i].deleted_at){ // its deactivated, lets activate it
            this._categoriesService.activate(this.categories[i].id)
            .subscribe({
              next: ()=>{
                this.saveToggleDeleted_at(i);
              },
              error: (err)=>{
                this._errorService.handeError(err.error);
              }
            });
          } else { // its activated, lets deactivate it
            this._categoriesService.deactivate(this.categories[i].id)
            .subscribe({
              next: ()=>{
                this.saveToggleDeleted_at(i, "deleted");
              },
              error: (err)=>{
                if(this._errorService.manipulableError(err.error)){
                  if(err.error.errors.pending){
                    this._dialogService.error(err.error.errors.pending);
                  }
                }
              }
            });
          }
        }
      });
    }

    /**
     * Activate or deactivate current father category by toggling the SoftDeleted field deleted_at
     * ask for if you are sure of this action
     * 
     * @param i number
     */
    public toggleDeleted_atFather(): void {
      this._dialogService.danger( // dialog messages
        this._multilangService.translate('miscellaneous.sure_from_this_action'),
        this._multilangService.translate('miscellaneous.action_msg'),
        (this.father.deleted_at) ? 
        this._multilangService.translate("miscellaneous.activate") :
        this._multilangService.translate("miscellaneous.deactivate") 
      )
      .then((result)=>{
        if(result.value){
          if(this.father.deleted_at){ // its deactivated, lets activate it
            this._categoriesService.activate(this.father.id)
            .subscribe({
              next: ()=>{
                this.father.deleted_at = null;
              },
              error: (err)=>{
                this._errorService.handeError(err.error);
              }
            });
          } else { // its activated, lets deactivate it
            this._categoriesService.deactivate(this.father.id)
            .subscribe({
              next: ()=>{
                this.father.deleted_at = "deleted"; // just significant for know when is activated or not
              },
              error: (err)=>{
                if(this._errorService.manipulableError(err.error)){
                  if(err.error.errors.pending){
                    this._dialogService.error(err.error.errors.pending);
                  }
                }
              }
            });
          }
        }
      });
    }

    /**
     * stores the toggle changes instead or make another http request
     * 
     * @param i number
     * @param deleted_at string, just significant for know when is activated or not
     */
    private saveToggleDeleted_at(i:number, deleted_at:string=null): void {
      this.categories[i].deleted_at = deleted_at;
      this.originalCategories.map((c, idx)=>{
         if(c.id === this.categories[i].id){
          this.originalCategories[idx].deleted_at = deleted_at;
         }
      });
    }

    /**
     * Permanent delete a subcategory from the table
     * ask for security auth
     * ask for if you are sure of this action
     * 
     * @param i number
     */
    public delete(i:number): void {
      this._authService.securityAuth()
      .then(()=>{
        this._dialogService.danger( // dialog messages
          this._multilangService.translate('miscellaneous.delete'),
          this._multilangService.translate('miscellaneous.delete_msg'),
          this._multilangService.translate("miscellaneous.delete")
        )
        .then((result)=>{
          if(result.value){
            this._categoriesService.delete(this.categories[i].id)
              .subscribe({
                next: (resp)=>{
                  this.originalCategories.map((c, idx)=>{
                    if(c.id === this.categories[i].id){
                      this.originalCategories.splice(idx, 1); // delete from our list
                    }
                  });
                  this.categories.splice(i,1);
                },
                error: (err)=>{
                  if(this._errorService.manipulableError(err.error)){
                    if(err.error.errors.pending){
                      this._dialogService.error(err.error.errors.pending);
                    }
                  }
                }
              });
          }
        });
      }).catch((err)=>{}); // ngBootstrap modal requirements
    }

    /**
     * Permanent delete the father category
     * ask for security auth
     * ask for if you are sure of this action
     * 
     * @param i number
     */
    public deleteFather(): void {
      this._authService.securityAuth()
      .then((result)=>{
        this._dialogService.danger( // dialog messages
          this._multilangService.translate('miscellaneous.delete'),
          this._multilangService.translate('miscellaneous.delete_msg'),
          this._multilangService.translate("miscellaneous.delete")
        )
        .then((result)=>{
          if(result.value){
            this._categoriesService.delete(this.father.id)
              .subscribe({
                next: ()=>{
                  this.breadcrumb(this.tree.length-2); // redirects to previous father category
                },
                error: (err)=>{
                  if(this._errorService.manipulableError(err.error)){
                    if(err.error.errors.pending){
                      this._dialogService.error(err.error.errors.pending);
                    }
                  }
                }
              });
          }
        });
      }).catch((err)=>{});
    }

    /**
     * return the current language name
     */
    public getTranslatedFatherName(): string {
      if(this._multilangService.activeLang == 'en'){
        return this.father.name_en;
      } 
      return this.father.name_es;
    }

    /**
     * return the current language description
     */
    public getTranslatedFatherDescription(): string {
      if(this._multilangService.activeLang == 'en'){
        return this.father.description_en;
      } 
      return this.father.description_es;
    }

    /**
    * retrieves all root categories
    */
   private getCategories(): void {
    this._categoriesService.getCategoriesAsAdmin()
    .subscribe({
      next: (resp)=>{
        this.originalCategories = resp.data;
        this.categories = JSON.parse(JSON.stringify(this.originalCategories)); // deep clone
      },
      error: (err)=>{
        this._errorService.handeError(err.error);
      }
    });
   }
    
    /**
    * retrieve all subcategories from a category name_en
    * 
    * @param category string
    */
    public retrieveSubcategories(category:string): void {
      this._categoriesService.getSubcategoriesAsAdmin(category)
      .subscribe({
        next: (resp)=>{
          this.originalCategories = resp.data;
          this.categories = JSON.parse(JSON.stringify(this.originalCategories)); // deep clone;
        },
        error: (err)=>{
          this._errorService.handeError(err.error);
        }
      });
    }
    
    /**
    * This component is NEVER reloaded, it just reloads the categories/subcategories data
    * 
    * @param name_en string
    */
    public view(i:number): void {
      this.reload((this._multilangService.activeLang == 'en') ? this.categories[i].name_en : this.categories[i].name_es);
    }

    /**
     * move in the categories tree
     * 
     * @param i number
     */
    public breadcrumb(i:number): void {
      if(i > 0){ // move between categories and subcategories
        this.reload(this.tree.splice(i)[0]); // splice for remove the child branches of the selected one, and reload the data
      } else { // to root
        this.tree.splice(1); // splice all except root, its easier than translate again the root
        this.clearData(); // Clear the current data for give an user feedback
        this.getCategories(); // retrieve the new data, only categories, because in root, there is no father
      }
    }

    /**
     * Clear the current data for give an user feedback, push the new child branch, retrieve the new data
     * @param name string
     */
    private reload(name:string): void {
      this.clearData();
      this.tree.push(name);
      this.retrieveCategory(name); // father
      this.retrieveSubcategories(name); // subcategories
    }

    /**
     * Clear the current data for give an user feedback
     */
    private clearData(): void {
      this.originalCategories = undefined;
      this.categories = undefined;
      this.father = undefined;
    }

    
    /**
    * case insensitive search by name_en || name_es
    * 
    * @param search string
    */
    public search(search:string): void {
      if(!search){
        this.categories = JSON.parse(JSON.stringify(this.originalCategories)); // deep clone;
      } else {
        this.categories =  this.originalCategories.filter(cat => { // came cloned
          return cat.name_en.toLowerCase().indexOf(search.toLowerCase()) > -1 ||
          cat.name_es.toLowerCase().indexOf(search.toLowerCase()) > -1
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
    }
    
  }
  