import { Component, OnInit } from '@angular/core';

// SERVICES
import { MultilangService } from './services/multilang.service';
import { UserService } from './services/user.service';
import { ErrorService } from './services/error.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  public consentedCookies: boolean;

  constructor(private _multilangService: MultilangService,
    private _userService: UserService,
    private _errorService: ErrorService){ }

  ngOnInit(): void {
    // looks for default lang
    this._multilangService.setDefaultLang();

    if(this._userService.checkForAuthUser()){
      this._userService.refreshUserData()
      .subscribe({
        error: (err)=>this._errorService.handeError(err.error)
      });
    }

    if(localStorage.getItem('consentedCookies')){
      this.consentedCookies = true;
    }

    // welcome console log
    setTimeout(()=>{
      console.log('%c%s', 'background: #1a1a1a; color: #00b5d7; font-family:monospace; font-size: 20px; padding: 5px; border-radius: 10px;',
      this._multilangService.translate('welcome_to_OkFreelancers'));
    }, 1000);
  }
}
