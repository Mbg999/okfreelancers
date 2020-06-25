import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';

import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

// SERVICES
import { SkillService } from 'src/app/services/skill.service';
import { ErrorService } from 'src/app/services/error.service';
import { MultilangService } from 'src/app/services/multilang.service';
import { FreelancerService } from 'src/app/services/freelancer.service';
import { ProjectService } from 'src/app/services/project.service';
import { UserService } from 'src/app/services/user.service';
import { CategoryService } from 'src/app/services/category.service';

// INTERFACES
import { Paginator } from 'src/app/interfaces/paginator';
import { User } from 'src/app/interfaces/user';
import { CategorySelect } from 'src/app/interfaces/category-select';
import { SkillSelect } from 'src/app/interfaces/skill-select';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  // image carousel
  @ViewChild('imgsDiv') private imgsDiv: ElementRef;
  public activeImage: number;
  // more skills
  public categories: CategorySelect[];
  public subcategories: CategorySelect[][];
  public skills: SkillSelect[];
  public selectedCatName: string;
  public selectedSkillName: string;
  // projects and freelancers
  public freelancerPaginator: Paginator;
  public projectPaginator: Paginator;
  private freelancerLimit: number;
  private projectLimit: number;
  // multilang purposes
  private multilang: Subscription;

  constructor(private _skillService: SkillService,
    private _errorService: ErrorService,
    private _multilangService: MultilangService,
    private _freelancerService: FreelancerService,
    private _projectService: ProjectService,
    private _userService: UserService,
    private _categoryService: CategoryService,
    private router: Router) {
      this.freelancerLimit = 8;
      this.projectLimit = 8;
    }

  ngOnInit(): void {
    this.getFreelancers();
    this.getProjects();
    this.getCategories();

    this.multilang = this._multilangService.onLangChangeEvent()
    .subscribe(()=>{
      this.categories = null;
      this.subcategories = null;
      this.skills = null;
      this.selectedCatName = null;
      this.selectedSkillName = null;
      this.getFreelancers();
      this.getProjects();
      this.getCategories();
    });

    this.imageCarousel();
  }

  ngOnDestroy(): void {
    this.multilang.unsubscribe();
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
      // save selected category name
      this.selectedCatName = this.categories[i].name;
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
      // save selected category name
      this.selectedCatName = this.subcategories[subcat][i].name;
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

  public searchCategory(): void {
    this.router.navigate(['/category', this.selectedCatName]);
  }

  public searchSkill(): void {
    this.router.navigate(['/skill', this.selectedSkillName]);
  }

  public getFreelancers(page: number=1): void {
    this._freelancerService.getTopLatest(this.freelancerLimit, page)
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
    this._projectService.getTopLatest(this.projectLimit, page)
    .subscribe({
      next: (resp)=>{
        this.projectPaginator = resp.data;
      },
      error: (err)=>{
        this._errorService.handeError(err.error);
      }
    });
  }

  private imageCarousel(): void {
    this.activeImage = 1;
    setInterval(()=>{
      this.imgsDiv.nativeElement.classList.add('fadeOut', 'faster');
        this.imgsDiv.nativeElement.classList.remove('fadeOut', 'faster');
        this.imgsDiv.nativeElement.classList.add('fadeIn', 'slower');
        this.activeImage = (this.activeImage > 3) ? 1 : this.activeImage+1;
        setTimeout(()=>{
          this.imgsDiv.nativeElement.classList.remove('fadeIn', 'slower');
        }, 2000);
    }, 5000);
  }

  // GETTERS
  get user(): User {
    return this._userService.user;
  }

}
