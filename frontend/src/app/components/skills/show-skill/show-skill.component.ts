import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common'; 

import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

// SERVICES
import { SkillService } from 'src/app/services/skill.service';
import { ErrorService } from 'src/app/services/error.service';
import { DialogService } from 'src/app/services/dialog.service';
import { MultilangService } from 'src/app/services/multilang.service';
import { FreelancerService } from 'src/app/services/freelancer.service';
import { ProjectService } from 'src/app/services/project.service';
import { UserService } from 'src/app/services/user.service';
import { CategoryService } from 'src/app/services/category.service';

// INTERFACES
import { Category } from 'src/app/interfaces/category';
import { Skill } from 'src/app/interfaces/skill';
import { Paginator } from 'src/app/interfaces/paginator';
import { User } from 'src/app/interfaces/user';
import { CategorySelect } from 'src/app/interfaces/category-select';
import { SkillSelect } from 'src/app/interfaces/skill-select';

@Component({
  selector: 'app-show-skill',
  templateUrl: './show-skill.component.html',
  styleUrls: ['./show-skill.component.css']
})
export class ShowSkillComponent implements OnInit, OnDestroy {

  public category: Category;
  public skill: Skill;
  public freelancerPaginator: Paginator;
  public projectPaginator: Paginator;
  private freelancerLimit: number;
  private projectLimit: number;
  public filter: string;
  private name: string;
  // multilang purposes
  private multilang: Subscription;
  // more skills
  public categories: CategorySelect[];
  public subcategories: CategorySelect[][];
  public skills: SkillSelect[];
  public selectedSkillName: string;

  constructor(private _skillService: SkillService,
    private _errorService: ErrorService,
    private _dialogService: DialogService,
    private _multilangService: MultilangService,
    private _freelancerService: FreelancerService,
    private _projectService: ProjectService,
    private _userService: UserService,
    private _categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location) { }

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
      this.getSkill(resp.name);
    });
    
    this.getCategories();

    this.multilang = this._multilangService.onLangChangeEvent()
    .subscribe(()=>{
      this.categories = null;
      this.subcategories = null;
      this.skills = null;
      this.selectedSkillName = null;
      this.getSkill(this.name);
      this.getCategories();
    });
  }

  ngOnDestroy(): void {
    this.multilang.unsubscribe();
  }

  private getSkill(name: string): void {
    this._skillService.getSkill(name)
    .subscribe({
      next: (resp)=>{
        this.skill = resp.data.skill;
        this.category = resp.data.category;
        this.name = this.skill.name;
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

  public getFreelancers(page: number=1): void {
    this._freelancerService.getFreelancersFromASkillPaginated(this.name, this.freelancerLimit, page)
    .subscribe({
      next: (resp)=>{
        this.freelancerPaginator = resp.data;
      },
      error: (err)=>{
        this._errorService.handeError(err.error);
      }
    });
  }

  public getProjects(page: number=1): void {
    this._projectService.getProjectsFromASkillPaginated(this.name, this.projectLimit, page)
    .subscribe({
      next: (resp)=>{
        this.projectPaginator = resp.data;
      },
      error: (err)=>{
        this._errorService.handeError(err.error);
      }
    });
  }

  public navigate(filter: string = ''): void {
    this.router.navigate([`/skill/${this.name}/${filter}`]);
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
      // get skills from the current selected root category
      this.getSkills(this.categories[i].id);
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
      // get skills from the current selected subcategory
      this.getSkills(this.subcategories[subcat][i].id);
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

  public getSkills(catId: number): void {
    this._skillService.getSkillsOfACategory(catId)
    .subscribe({
      next: (resp)=>{
        this.skills = resp.data;
        this.selectedSkillName = null;
      },
      error: (err)=>{
        this._errorService.handeError(err.error);
      }
    })
  }

  public searchSkill(): void {
    this.freelancerPaginator = null;
    this.projectPaginator = null;
    this.category = null;
    this.subcategories = null;
    this.skills = null;
    // this.router.navigate(['/skill', this.selectedSkillName]);
    this.location.go(`/skill/${this.selectedSkillName}`); // https://stackoverflow.com/a/39447121/9764641
    this.getSkill(this.selectedSkillName);
  }

  // GETTERS
  get user(): User {
    return this._userService.user;
  }
}
