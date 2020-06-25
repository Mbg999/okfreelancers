import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

// SERVICES
import { HttpService } from './http.service';
import { UserService } from './user.service';

// INTERFACES
import { Category } from 'src/app/interfaces/category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private http: HttpService,
    private _userService: UserService) { }

  // --------- ALL ZONE
  /**
   * retrieve all the root categories
   */
  public getCategories(): Observable<any> {
    return this.http.get('/categories');    
  }

  /**
   * retrieve all the subcategories by a category name
   * @param category string
   */
  public getSubcategories(category): Observable<any> {
    return this.http.get(`/subcategories/${category}`);
  }

  public getACategory(name: string): Observable<any> {
    return this.http.get(`/categories/${name}`);
  }

  // --------- ADMIN ZONE
  /**
   * retrieve all the root categories with admin privileges
   */
  public getCategoriesAsAdmin(): Observable<any> {
    return this.http.get('/categories/admin/all', {Authorization: this._userService.token});    
  }

  /**
   * retrieve a category or subcategory by name with admin privileges
   * 
   * @param category string
   */
  public getCategoryAsAdmin(category: string): Observable<any> {
    return this.http.get(`/categories/admin/${category}`, {Authorization: this._userService.token});
  }

  /**
   * retrieve all the subcategories by a category name with admin privileges
   * @param category string
   */
  public getSubcategoriesAsAdmin(category: string): Observable<any> {
    return this.http.get(`/subcategories/admin/${category}`, {Authorization: this._userService.token});
  }

  /**
   * Create a new category or subcategory
   * 
   * @param category Category
   */
  public create(category: FormData): Observable<any> {
    return this.http.post('/categories/admin', category, {Authorization: this._userService.token});
  }

  /**
   * Update a category or subcategory
   * this should be put but laravel put doesn't catch formdata files
   * 
   * @param category Category
   */
  public update(id: number, category: FormData): Observable<any> {
    return this.http.post(`/categories/admin/${id}`, category, {Authorization: this._userService.token});
  }

  /**
   * SoftDeleted
   * 
   * @param id number
   */
  public deactivate(id: number): Observable<any> {
    return this.http.delete(`/categories/admin/${id}/deactivate`, {Authorization: this._userService.token});
  }

  /**
   * restore SoftDeleted
   * 
   * @param id number
   */
  public activate(id: number): Observable<any> {
    return this.http.get(`/categories/admin/${id}/activate`, {Authorization: this._userService.token});
  }

  /**
   * force delete from storage
   * take care with delete on cascade,
   * this option should only be used in really safe cases
   * 
   * @param id number
   */
  public delete(id: number): Observable<any> {
    return this.http.delete(`/categories/admin/${id}`, {Authorization: this._userService.token});
  }
  
}
