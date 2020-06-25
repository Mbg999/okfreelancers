import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common'; 

// SERVICES
import { CategoryService } from 'src/app/services/category.service';
import { ErrorService } from 'src/app/services/error.service';
import { DialogService } from 'src/app/services/dialog.service';
import { MultilangService } from 'src/app/services/multilang.service';
import { FreelancerService } from 'src/app/services/freelancer.service';
import { ProjectService } from 'src/app/services/project.service';
import { UserService } from 'src/app/services/user.service';

// INTERFACES
import { Category } from 'src/app/interfaces/category';
import { Paginator } from 'src/app/interfaces/paginator';
import { User } from 'src/app/interfaces/user';
import { CategorySelect } from 'src/app/interfaces/category-select';

@Component({
  selector: 'app-show-category',
  templateUrl: './show-category.component.html',
  styleUrls: ['./show-category.component.css']
})
export class ShowCategoryComponent implements OnInit, OnDestroy {

  public category: Category;
  public freelancerPaginator: Paginator;
  public projectPaginator: Paginator;
  private freelancerLimit: number;
  private projectLimit: number;
  public filter: string;
  private name: string;
  // multilang purposes
  private multilang: Subscription;
  // more categories
  public categories: CategorySelect[];
  public subcategories: CategorySelect[][];
  public selectedCatName: string;

  constructor(private _categoryService: CategoryService,
    private _errorService: ErrorService,
    private _dialogService: DialogService,
    private _multilangService: MultilangService,
    private _freelancerService: FreelancerService,
    private _projectService: ProjectService,
    private _userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location) { }

  /**
    * get filter and set the pagination limit
    * get categories
    * suscribe to the changelang observable
    */
  ngOnInit(): void {
    this.route.params.subscribe((resp)=>{
      if(resp.filter){
        this.filter = resp.filter;
        if(this.filter == 'freelancer'){
          this.freelancerLimit = 20;
        } else if(this.filter == 'project'){
          this.projectLimit = 20;
        } else {
          this.router.navigate(['/']);
        }
      } else {
        this.filter = undefined;
        this.freelancerLimit = 8;
        this.projectLimit = 8;
      }
      this.getCategory(resp.name);
    });

    this.getCategories();

    this.multilang = this._multilangService.onLangChangeEvent()
    .subscribe(()=>{
      this.categories = null;
      this.subcategories = null;
      this.selectedCatName = null;
      this.getCategory(this.name);
      this.getCategories();
    });
  }

  /**
   * unsuscribe to the changelang observable
   */
  ngOnDestroy(): void {
    this.multilang.unsubscribe();
  }

  /**
   * 
   * gets the category data, filtering if needed
   * 
   * @param name string
   */
  private getCategory(name: string): void {
    this._categoryService.getACategory(name)
    .subscribe({
      next: (resp)=>{
        this.category = resp.data;
        this.name = this.category.name;
        if(this.filter == 'freelancer'){
          this.getFreelancers();
        } else if(this.filter == 'project'){
          this.getProjects();
        } else {
          this.getFreelancers();
          this.getProjects();
        }
      },
      error: (err)=>{
        if(this._errorService.manipulableError(err.error) && err.status == 404){
          this._dialogService.error(this._multilangService.translate('categories.not_found'));
          this.router.navigate(['/']);
        }
      }
    });
  }

  /**
   * get the freelancers paginated
   * 
   * @param page number
   */
  public getFreelancers(page: number=1): void {
    this._freelancerService.getFreelancersFromACategoryPaginated(this.name, this.freelancerLimit, page)
    .subscribe({
      next: (resp)=>{
        this.freelancerPaginator = resp.data;
      },
      error: (err)=>{
        this._errorService.handeError(err.error);
      }
    });
  }

  /**
   * get the projects paginated
   * 
   * @param page number
   */
  public getProjects(page: number=1): void {
    this._projectService.getProjectsFromACategoryPaginated(this.name, this.projectLimit, page)
    .subscribe({
      next: (resp)=>{
        this.projectPaginator = resp.data;
      },
      error: (err)=>{
        this._errorService.handeError(err.error);
      }
    });
  }

  public navigate(filter: string = ''){
    this.router.navigate([`/category/${this.name}/${filter}`]);
  }

  /**
    * retrieves all root categories,
    * remove the category itself for avoid that a parent can be child of his child
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
      this.selectedCatName = this.categories[i].name;
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
      this.selectedCatName = this.subcategories[subcat][i].name;
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

  public searchCategory(): void {
    this.freelancerPaginator = null;
    this.projectPaginator = null;
    this.subcategories = null;
    this.category = null;
    // this.router.navigate(['/category', this.selectedCatName]);
    // change url without reload or something weird
    this.location.go(`/category/${this.selectedCatName}`); // https://stackoverflow.com/a/39447121/9764641
    this.getCategory(this.selectedCatName);
  }

  // GETTERS
  get user(): User {
    return this._userService.user
  }
}
