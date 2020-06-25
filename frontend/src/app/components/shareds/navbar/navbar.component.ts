import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

// SERVICES
import { UserService } from 'src/app/services/user.service';
import { MultilangService } from 'src/app/services/multilang.service';
import { ErrorService } from 'src/app/services/error.service';
import { MessageService } from 'src/app/services/message.service';
import { ToastService } from 'src/app/services/toast.service';

// INTERFACES
import { User } from 'src/app/interfaces/user';
import { Role } from 'src/app/interfaces/role';
import { ProcessMessagePipe } from 'src/app/pipes/process-message.pipe';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  providers: [ProcessMessagePipe]
})
export class NavbarComponent implements OnInit, OnDestroy {

  public collapsed = true; // navbar collapse
  public newMessages: number;
  private newMessageListener: Subscription;
  private newChatListener: Subscription;
  private iReadAMessageListener: Subscription;
  private newBalanceListener: Subscription;

  constructor(private router: Router,
    public _multilangService: MultilangService,
    public _userService: UserService,
    private _errorService: ErrorService,
    private _messageService: MessageService,
    private _toastService: ToastService,
    private _processMessagePipe: ProcessMessagePipe) { }

  ngOnInit(): void {
    if(this.user){
      this.userLoggedActions(true);
    }
  }

  
  ngOnDestroy(): void {
    if(this.newChatListener) this.newChatListener.unsubscribe();
    if(this.newMessageListener) this.newMessageListener.unsubscribe();
    if(this.iReadAMessageListener) this.iReadAMessageListener.unsubscribe();
    if(this.newBalanceListener) this.newBalanceListener.unsubscribe();
  }

  /**
   * Actions to do when a user is logged
   */
  public userLoggedActions(itsLogged: boolean): void {
    if(itsLogged){
      this.startMessagesSocket();
    }
  }

  private startMessagesSocket(): void {
    this.newMessages = 0;
      this.getUnreadsCount();
      this._messageService.startWebSocket();
      this.newMessageListener = this._messageService.listenToNewChats()
      .subscribe((chat)=>{
        if(chat.user.id != this._userService.user.id) this.newMessages++;
        if(!this.router.url.includes('/messages')){
          let text = (chat.last_message.text.startsWith('OkFreelancersInternal')) ? this._processMessagePipe.transform(chat.last_message.text, true) : chat.last_message.text;
          this._toastService.show(`${chat.user.name} ${chat.user.surnames}: ${text}`, {
            classname: 'bg-dark text-light',
            delay: 3500 ,
            autohide: true,
            headertext: this._multilangService.translate('chats.new_message')
          });
        }
      });

      this.newChatListener = this._messageService.listenToNewMessages()
      .subscribe((message)=>{
        if(message.sender_id != this._userService.user.id) this.newMessages++;
        if(!this.router.url.includes('/messages')){
          let text = (message.text.startsWith('OkFreelancersInternal')) ? this._processMessagePipe.transform(message.text, true) : message.text;
          this._toastService.show(`${message.sender_info.name} ${message.sender_info.surnames}: ${text}`, {
            classname: 'bg-dark text-light',
            delay: 3500 ,
            autohide: true,
            headertext: this._multilangService.translate('chats.new_message')
          });
        }
        
      });
      
      this.iReadAMessageListener = this._messageService.listenWhenIReadAMessage()
      .subscribe((reads)=>{
        this.newMessages -= reads;
      });

      this.newBalanceListener = this._messageService.listenNewBalance()
      .subscribe((newBalance)=>{
        this._userService.user.balance = newBalance;
        this._userService.saveUser();
      });
  }

  private getUnreadsCount(): void {
    this._messageService.getUnreadsCount()
    .subscribe({
      next: (resp)=>{
        this.newMessages += resp.data;
      },
      error: (err)=>{
        this._errorService.handeError(err.error);
      }
    });
  }

  /**
    * Change the user activeRole
    * 
    * @param role string
    */
  public changeRole(role: number): void {
    this.user.activeRole = role;
    this._userService.saveUser();
  }

  /**
   * User logout, redirect to home if logout went ok
   */
  public logout(): void {
    this._userService.logout()
    .subscribe({
      next: (resp)=>{
        if(this.newMessages != undefined){
          this.newChatListener.unsubscribe();
          this.newMessageListener.unsubscribe();
          this.iReadAMessageListener.unsubscribe();
          this.newBalanceListener.unsubscribe();
        }
        this.collapsed = true;
        this.router.navigate(['/']);
      },
      error: (err)=>{
        this._errorService.handeError(err.error);
      }
    });
  }

  //GETTERS
  get user(): User {
    return  this._userService.user;
  }

  get availableMissingRoles(): Role[] {
    return  this._userService.availableMissingRoles;
  }

}
