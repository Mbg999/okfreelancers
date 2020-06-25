import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

// SERVICES
import { SkillService } from 'src/app/services/skill.service';
import { DialogService } from 'src/app/services/dialog.service';
import { MultilangService } from 'src/app/services/multilang.service';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';

// INTERFACES
import { Skill } from 'src/app/interfaces/skill';

// NG BOOTSTRAP
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

// COMPONENTS
import { AdminSkillModalComponent } from '../admin-skill-modal/admin-skill-modal.component';

@Component({
  selector: 'app-admin-skills',
  templateUrl: './admin-skills.component.html',
  styleUrls: ['./admin-skills.component.css']
})
export class AdminSkillsComponent implements OnInit, OnDestroy {

  public originalSkills: Skill[]; // this will save all the data
  public skills: Skill[]; // this will be shown and filtered and use the originalSkills for restore the data
  // multilang purposes
  private multilang: Subscription;
  
  constructor(private _multilangService: MultilangService,
    private _skillService: SkillService,
    private _dialogService: DialogService,
    private _authService: AuthService,
    private modalService: NgbModal,
    private _errorService: ErrorService) {}

  /**
   * retrieve skills
   * seets the onchangelang event to retrieve the skills in the current language
   */
  ngOnInit(): void {
    this.retrieveSkills();

    this.multilang = this._multilangService.onLangChangeEvent()
    .subscribe(()=>{
        this.originalSkills = undefined;
        this.skills = undefined;
        this.retrieveSkills(); // for category names
    });
  }

    
  ngOnDestroy(): void {
    this.multilang.unsubscribe();
  }

  /**
  * retrieves all the skills in the current language
  */
   public retrieveSkills(): void {
    this._skillService.getSkillsAsAdmin()
    .subscribe({
      next: (resp)=>{
        this.originalSkills = resp.data;
        this.skills = JSON.parse(JSON.stringify(this.originalSkills)); // deep clone
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
    private openCategorymodal(skill: Skill=null): Promise<any> {
      const modalRef: NgbModalRef = this.modalService.open(AdminSkillModalComponent,{
        scrollable: true,
        windowClass: 'animated fadeInDown faster'
      });
      
      modalRef.componentInstance.skill = skill;
      
      return modalRef.result
    }

    /**
     * Create a new skill
     */
    public create(): void {
      this.openCategorymodal()
      .then((result)=>{
        this.originalSkills.push(result.skill);
        this.skills.push(result.skill);
        this.originalSkills.sort((a,b)=>a.id-b.id);
        this.skills.sort((a,b)=>a.id-b.id);
      })
      .catch((err)=>{}); // nbBootstrap modal requirements
    }

    /**
     * Update a skill from the table
     * 
     * @param i number
     */
    public update(i:number): void {
      this.openCategorymodal(this.skills[i])
      .then((result)=>{
        this.originalSkills.map((skill, idx)=>{
          if(skill.id = this.skills[i].id){
            this.originalSkills[idx] = result.skill;
          }
        });
        this.skills[i] = result.skill;
      })
      .catch((err)=>{}); // nbBootstrap modal requirements
    }

    /**
     * Activate or deactivate a skill from the table,
     * by toggling the SoftDeleted field deleted_at
     * 
     * @param i number
     */
    public toggleDeleted_at(i: number): void {
      this._dialogService.danger( // dialog messages
        this._multilangService.translate('miscellaneous.sure_from_this_action'),
        this._multilangService.translate('miscellaneous.action_msg'),
        (this.skills[i].deleted_at) ? 
        this._multilangService.translate("miscellaneous.activate") :
        this._multilangService.translate("miscellaneous.deactivate") 
      )
      .then((result)=>{
        if(result.value){
          if(this.skills[i].deleted_at){ // its deactivated, lets activate it
            this._skillService.activate(this.skills[i].id)
            .subscribe({
              next: (resp)=>{
                this.saveToggleDeleted_at(i);
              },
              error: (err)=>{
                this._errorService.handeError(err.error);
              }
            });
          } else { // its activated, lets deactivate it
            this._skillService.deactivate(this.skills[i].id)
            .subscribe({
              next: (resp)=>{
                this.saveToggleDeleted_at(i, "deleted");
              },
              error: (err)=>{
                this._errorService.handeError(err.error);
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
      this.skills[i].deleted_at = deleted_at;
      this.originalSkills.map((s, idx)=>{
         if(s.id === this.skills[i].id){
          this.originalSkills[idx].deleted_at = deleted_at;
         }
      });
    }

    /**
     * Permanent delete a skill from the table
     * ask for security auth
     * ask for if you are sure of this action
     * 
     * @param i number
     */
    public delete(i:number): void {
      this._authService.securityAuth()
      .then((result)=>{
        this._dialogService.danger( // dialog messages
          this._multilangService.translate('miscellaneous.delete'),
          this._multilangService.translate('miscellaneous.delete_msg'),
          this._multilangService.translate("miscellaneous.delete")
        )
        .then((result)=>{
          if(result.value){
            this._skillService.delete(this.skills[i].id)
              .subscribe({
                next: (resp)=>{
                  this.originalSkills.map((s, idx)=>{
                    if(s.id === this.skills[i].id){
                      this.originalSkills.splice(idx, 1); // delete from our list
                    }
                  });
                  this.skills.splice(i,1);
                },
                error: (err)=>{
                  this._errorService.handeError(err.error);
                }
              });
          }
        });
      }).catch((err)=>{}); // ngBootstrap modal requirements
    }

    
    /**
    * case insensitive search by name_en || name_es
    * 
    * @param search string
    */
    public search(search:string): void {
      if(!search){
        this.skills = JSON.parse(JSON.stringify(this.originalSkills));
      } else {
        this.skills =  this.originalSkills.filter(skill => { // came cloned
          return skill.name_en.toLowerCase().indexOf(search.toLowerCase()) > -1 ||
          skill.name_es.toLowerCase().indexOf(search.toLowerCase()) > -1 ||
          skill.category_name.toLowerCase().indexOf(search.toLowerCase()) > -1
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
