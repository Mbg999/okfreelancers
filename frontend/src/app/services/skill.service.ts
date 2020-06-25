import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// SERVICES
import { HttpService } from './http.service';
import { UserService } from './user.service';

// UTILS
import { MyUtils } from '../classes/my-utils';

// INTERFACES
import { Skill } from 'src/app/interfaces/skill';
import { SkillSelect } from '../interfaces/skill-select';

@Injectable({
  providedIn: 'root'
})
export class SkillService {

  constructor(private http: HttpService,
    private _userService: UserService) { }

  // --------- ALL ZONE
  public getSkill(name: string){
    return this.http.get(`/skills/${name}`);
  }

  /**
   * Separates the selected skills and the available ones, and return the available ones
   * 
   * @param skills SkillSelec[]
   * @param selectedSkills SkillSelec[]
   */
  public availableSkills(skills: SkillSelect[], selectedSkills: SkillSelect[]): SkillSelect[]{
    return skills.filter(MyUtils.comparer(selectedSkills));
  }

  public getSkillsOfACategory(category_id: number): Observable<any> {
    return this.http.get(`/skills/category/${category_id}`);
  }

  public getSkillsOfMultipleCategories(categories_is: FormData): Observable<any> {
    return this.http.post('/skills/category/multiple', categories_is);
  }

  // --------- ADMIN ZONE
  /**
   * retrieve all the root skills with admin privileges
   */
  public getSkillsAsAdmin(): Observable<any> {
    return this.http.get('/skills/admin/all', {Authorization: this._userService.token});    
  }

  /**
   * retrieve a skill by name with admin privileges
   * 
   * @param skill string
   */
  public getSkillAsAdmin(skill: string): Observable<any> {
    return this.http.get(`/skills/admin/${skill}`, {Authorization: this._userService.token});
  }

  /**
   * SoftDeleted
   * 
   * @param id number
   */
  public deactivate(id: number): Observable<any> {
    return this.http.delete(`/skills/admin/${id}/deactivate`, {Authorization: this._userService.token});
  }

  /**
   * restore SoftDeleted
   * 
   * @param id number
   */
  public activate(id: number): Observable<any> {
    return this.http.get(`/skills/admin/${id}/activate`, {Authorization: this._userService.token});
  }

  /**
   * Create a new skill
   * 
   * @param category Category
   */
  public create(skill: FormData): Observable<any> {
    return this.http.post('/skills/admin', skill, {Authorization: this._userService.token});
  }

  /**
   * Update a skill
   * 
   * @param category Category
   */
  public update(id: number, skill: Skill): Observable<any> {
    return this.http.put(`/skills/admin/${id}`, skill, {Authorization: this._userService.token});
  }

  /**
   * force delete from storage
   * take care with delete on cascade,
   * this option should only be used in really safe cases
   * 
   * @param id number
   */
  public delete(id: number): Observable<any> {
    return this.http.delete(`/skills/admin/${id}`, {Authorization: this._userService.token});
  }
}
