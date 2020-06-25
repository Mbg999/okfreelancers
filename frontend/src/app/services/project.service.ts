import { Injectable } from '@angular/core';

// SERVICES
import { HttpService } from './http.service';
import { UserService } from './user.service';

// INTERFACES
import { Project } from '../interfaces/project';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(private http: HttpService,
    private _userService: UserService) { }

  // --------- ALL ZONE
  public getAProject(id: number): Observable<any> {
    let auth = {};
    if(this._userService.token){ // its optional, needed for return the auth freelancer profiles valid to offer for a project
      auth['Authorization'] = this._userService.token;
    }
    return this.http.get(`/projects/${id}`, auth);
  }

  public getAllProjectsOfACompany(name: string): Observable<any> {
    return this.http.get(`/projects/company/${name}`);
  }

  public getProjectsFromACategoryPaginated(name: string, limit: number, page: number=1): Observable<any> {
    return this.http.get(`/projects/category/${name}/${limit}?page=${page}`);
  }

  public getProjectsFromASkillPaginated(name: string, limit: number, page: number=1): Observable<any> {
    return this.http.get(`/projects/skill/${name}/${limit}?page=${page}`);
  }

  public getAFreelancerAcceptedProjects(id: number): Observable<any> {
    let options = {};
    if(this._userService.token){
      options['Authorization'] = this._userService.token;
    }
    return this.http.get(`/projects/freelancer/${id}`, options);
  }

  public getTopLatest(limit: number, page: number=1): Observable<any> {
    return this.http.get(`/projects/top/${limit}/latest?page=${page}`);
  }

  // --------- AUTH FREELANCER ZONE
  public getAllMyFreelancersAndInProgressProjects(): Observable<any> {
    return this.http.get('/projects/freelancers/all', {Authorization: this._userService.token});
  }

  // --------- AUTH COMPANY ZONE
  public getAllMyCompanyProjects(): Observable<any> {
    return this.http.get('/projects/companies/all', {Authorization: this._userService.token});
  }

  public getOneOfMyCompanyProjects(id: number): Observable<any> {
    return this.http.get(`/projects/companies/${id}/get`, {Authorization: this._userService.token});
  }

  public toggleProjectFinished(id: number, finished: string): Observable<any> {
    return this.http.put(`/projects/companies/${id}/toggleFinish`, {finished}, {Authorization: this._userService.token});
  }

  /**
   * 
   * Create a project
   * 
   * @param project Project
   */
  public createAsCompany(project: Project): Observable<any> {
    return this.http.post('/projects/companies', project, {Authorization: this._userService.token});
  }

  /**
   * Update a project
   * 
   * @param id number
   * @param project Project
   */
  public updateAsCompany(id: number, project: Project): Observable<any> {
    return this.http.put(`/projects/companies/${id}`, project, {Authorization: this._userService.token});
  }

  /**
   * Ban a project
   * SoftDeleted
   * 
   * @param id number
   */
  public deactivateAsCompany(id: number): Observable<any> {
    return this.http.delete(`/projects/companies/${id}/deactivate`, {Authorization: this._userService.token});
  }

  /**
   * Rehabilitate a project
   * restore SoftDeleted
   * 
   * @param id number
   */
  public activateAsCompany(id: number): Observable<any> {
    return this.http.get(`/projects/companies/${id}/activate`, {Authorization: this._userService.token});
  }

  /**
   * force delete from storage
   * take care with delete on cascade,
   * this option should only be used in really safe cases
   * 
   * @param id number
   */
  public deleteAsCompany(id: number): Observable<any> {
    return this.http.delete(`/projects/companies/${id}`, {Authorization: this._userService.token});
  }

  // --------- ADMIN ZONE
  /**
    * retrieve all the projects with admin privileges
    */
   public getProjectsAsAdmin(): Observable<any> {
    return this.http.get('/projects/admin/companies/all', {Authorization: this._userService.token});    
  }

  /**
   * retrieve a project profile data as admin
   * 
   * @param id number
   */
  public getAProjectAsAdmin(id: number): Observable<any> {
    return this.http.get(`/projects/admin/companies/${id}`, {Authorization: this._userService.token}); 
  }

  /**
   * Retrieve all the projects of a company
   * 
   * @param userId number
   */
  public getProjectsOfACompanyAsAdmin(company_id: number): Observable<any> {
    return this.http.get(`/projects/admin/companies/company/${company_id}`, {Authorization: this._userService.token});
  }

  /**
   * 
   * Create a project
   * 
   * @param project Project
   */
  public createAsAdmin(company_id: number, project: Project): Observable<any> {
    return this.http.post(`/projects/admin/companies/${company_id}`, project, {Authorization: this._userService.token});
  }

  /**
   * Update a project
   * 
   * @param id number
   * @param project Project
   */
  public updateAsAdmin(id: number, project: Project): Observable<any> {
    return this.http.put(`/projects/admin/companies/${id}`, project, {Authorization: this._userService.token});
  }

  /**
   * Ban a project
   * SoftDeleted
   * 
   * @param id number
   */
  public ban(id: number, ban_reason: string): Observable<any> {
    return this.http.put(`/projects/admin/companies/${id}/ban`, {ban_reason}, {Authorization: this._userService.token});
  }

  /**
   * Rehabilitate a project
   * restore SoftDeleted
   * 
   * @param id number
   */
  public activateAsAdmin(id: number): Observable<any> {
    return this.http.get(`/projects/admin/companies/${id}/activate`, {Authorization: this._userService.token});
  }

  /**
   * force delete from storage
   * take care with delete on cascade,
   * this option should only be used in really safe cases
   * 
   * @param id number
   */
  public deleteAsAdmin(id: number): Observable<any> {
    return this.http.delete(`/projects/admin/companies/${id}`, {Authorization: this._userService.token});
  }
}
