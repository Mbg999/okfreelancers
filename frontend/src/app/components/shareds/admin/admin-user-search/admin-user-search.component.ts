import { Component, Output, EventEmitter, Input } from '@angular/core';

// SERVICES
import { UserService } from 'src/app/services/user.service';

// INTERFACE
import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-admin-user-search',
  templateUrl: './admin-user-search.component.html',
  styleUrls: ['./admin-user-search.component.css']
})
export class AdminUserSearchComponent {

  public users: User[];
  @Output('user') public user = new EventEmitter<string[]>();
  @Input('user_idError') public user_idError: string;

  constructor(private _userService: UserService) { }

  public search(search: string){
    if(search.trim()){
      this._userService.searchByEmailAsAdmin(search)
      .subscribe({
        next: (resp)=>{
          this.users = resp.data;
        },
        error: (err)=>{
          // fast typing can return errors in a development environment
        }
      });
    }
  }

  public select(user){
    this.users = [];
    this.user.emit(user.split(' - '));
  }
}
