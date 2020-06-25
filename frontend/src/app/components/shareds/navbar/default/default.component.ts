import { Component, Output, EventEmitter } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'default-navbar',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.css']
})
export class DefaultComponent {
  @Output('collapsed') public collapsed = new EventEmitter<boolean>();
  @Output('logged') private logged = new EventEmitter<boolean>();
  @Output('registered') private registered = new EventEmitter<boolean>();
  constructor(private _authService: AuthService) { }

  /**
   * Open the UserAuthComponent as a modal
   * 
   * @param itsLogin boolean
   */
  public openUserAuthModal(itsLogin: boolean): void {
    this._authService.openUserAuthModal(itsLogin)
    .then((result)=>{
      if(result.type == 'logged') this.logged.emit(result.result);
      else this.registered.emit(result.result);
    }).catch((err)=>{}); //ngBootstrap requirement
  }
}
