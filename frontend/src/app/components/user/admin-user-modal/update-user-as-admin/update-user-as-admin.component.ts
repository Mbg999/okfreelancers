import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

// INTERFACES
import { User } from 'src/app/interfaces/user';
import { Role } from 'src/app/interfaces/role';

// SERVICES
import { UserService } from 'src/app/services/user.service';
import { DialogService } from 'src/app/services/dialog.service';
import { ErrorService } from 'src/app/services/error.service';
import { MultilangService } from 'src/app/services/multilang.service';

@Component({
  selector: 'app-update-user-as-admin',
  templateUrl: './update-user-as-admin.component.html',
  styleUrls: ['./update-user-as-admin.component.css']
})
export class UpdateUserAsAdminComponent implements OnInit {
  @Input('id') public id: number; // user to update
  @Output('updated') public updated = new EventEmitter<User>();
  @Output('close') public close = new EventEmitter<boolean>();
  @Output('scrollToTop') public scrollToTop = new EventEmitter<boolean>();
  public user: User;
  // forms
  public availableRoles: Role[];
  public onUseRoles: Role[];
  // feedback
  public addedRole: string;
  public removedRole: string;
  public takenEmail: string;
  public uploadingPicture: boolean;

  constructor(private _userService: UserService,
    private _dialogService: DialogService,
    private _errorService: ErrorService,
    private _multilangService: MultilangService,
    private router: Router) {}

  ngOnInit(): void {
    this.getUser();
    this.availableRoles = [
      {id: 42, name: "administrator"} // this is currently the single toggleable role, if here are new ones, just add them to this array
    ];

    this.onUseRoles = this.availableRoles;
  }

  /**
   * retrieve the selected user data
   */
  private getUser(): void {
    this._userService.getAnUserAsAdmin(this.id)
    .subscribe({
      next: (resp)=>{
        this.user = resp.data;
        this.availableRoles = this._userService.missingRoles(this.availableRoles, this.user.roles);
        this.onUseRoles = this._userService.missingRoles(this.onUseRoles, this.availableRoles);
      },
      error: (err)=>{
        this._errorService.handeError(err.error);
      }
    });
  }

  /**
   * add the selected role to the user, and change it from availableRoles to user.roles variables
   * 
   * @param roleField select field
   */
  public addRole(roleField:any): void {
    this._userService.addRoleAsAdmin(this.user.id, parseInt(roleField.value))
    .subscribe({
      next: (resp)=>{
        let role: Role = this.availableRoles.splice(roleField.selectedIndex-1,1)[0];
        this.onUseRoles.push(role);
        this.onUseRoles.sort((a,b)=>a.name.localeCompare(b.name));
        this.addedRole = resp.message;
        if(this._userService.user.id == this.user.id){
          this._userService.addRole(role);
        }
      },
      error: (err)=>{
        this._errorService.handeError(err.error);
      }
    });
  }

  /**
   * remove the selected role to the user, and change it from user.roles variables to availableRoles
   * 
   * @param roleField select field
   */
  public removeRole(roleField:any): void {
    this._userService.removeRoleAsAdmin(this.user.id, parseInt(roleField.value))
    .subscribe({
      next: (resp)=>{
        let role: Role = this.onUseRoles.splice(roleField.selectedIndex-1,1)[0]
        this.availableRoles.push(role);
        this.availableRoles.sort((a,b)=>a.name.localeCompare(b.name));
        this.removedRole = resp.message;
        if(this._userService.user.id == this.user.id){
          this._userService.removeRole(parseInt(roleField.value));
          if(parseInt(roleField.value) == 42){
            this.close.emit(true);
            this.router.navigate(['/']);
          }
        }
      },
      error: (err)=>{
        this._errorService.handeError(err.error);
      }
    });
  }
  
  /**
  * takes the data from the update user form and updates the user
  * 
  * Saves the posible taken email error into takenEmail variable
  * 
  * this emits the changes to the father, in this way the father can update
  * the user without make another http request
  */
  public updateUser(data:User): void {
    this.takenEmail = undefined;
    this._dialogService.loading();
    this._userService.updateAsAdmin(this.user.id, data)
    .subscribe({
      next: (resp:any)=>{
        this._dialogService.close();
        if(resp.need_reauth && this.user.id == this._userService.user.id){
          this._userService.removeAuthData();
          this._dialogService.success(this._multilangService.translate('user.important_changes'));
          this.close.emit(true);
          this.router.navigate(['/']);
        } else {
          this.updated.emit(resp.data);
        }
        
      },
      error: (err:any)=>{
        this._dialogService.close();
        if(this._errorService.manipulableError(err.error) && err.error.errors?.email){
          this.takenEmail = err.error.errors?.email;
          this.scrollToTop.emit(true);
        }
      }
    });
  }
  
  /**
  * takes the data from the update user form and updates the user
  * 
  */
  public changePassword(data: User): void {
    this._dialogService.loading();
    this._userService.updateAsAdmin(this.id, data)
    .subscribe({
      next: (resp:any)=>{
        this._dialogService.close(); // after navigate for better efect
        if(this.user.id == this._userService.user.id){
          this._userService.removeAuthData();
          this._dialogService.success(this._multilangService.translate('user.important_changes'));
          this.close.emit(true);
          this.router.navigate(['/']);
        }
      },
      error: (err:any)=>{
        this._dialogService.close();
        this._errorService.handeError(err.error);
      }
    });
  }

  /**
  * takes the picture from the update user form and updates the user
  * 
  * 
  * @param picture File
  */
 public changePicture(picture:File): void {
  this.uploadingPicture = true;
  this._userService.uploadPictureAsAdmin(this.user.id, picture)
  .subscribe({
    next: (resp)=>{
      this.user.picture = resp.picture;
        this.uploadingPicture = false;
    },
    error: (err)=>{
      this._errorService.handeError(err.error);
    }
  });
}
}
