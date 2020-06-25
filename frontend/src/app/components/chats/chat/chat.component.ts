import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

// FORMS
import { FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { CustomValidators } from '../../../classes/custom-validators'

// SERVICES
import { DialogService } from 'src/app/services/dialog.service';
import { ErrorService } from 'src/app/services/error.service';
import { MultilangService } from 'src/app/services/multilang.service';
import { UserService } from 'src/app/services/user.service';
import { MessageService } from 'src/app/services/message.service';

// INTERFACES
import { Chat } from 'src/app/interfaces/chat';
import { Message } from 'src/app/interfaces/message';
import { Paginator } from 'src/app/interfaces/paginator';
import { User } from 'src/app/interfaces/user';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {

  @ViewChild('chat_box') private chat_box: ElementRef;
  @ViewChild('text_box') private text_box: ElementRef;
  public originalChats: Chat[];
  public chats: Chat[];
  public messagesPaginator: Paginator;
  public messages: Message[];
  public selectedChat: Chat;
  public messageForm: FormGroup;
  public selectedIndex: number;
  public itsLoading: boolean;
  public collapsed = false; // navbar collapse
  // suscriptions
  private newChatListener: Subscription;
  private newMessageListener: Subscription;
  private messageReadListener: Subscription;
  // multilang purposes
  private multilang: Subscription;

  constructor(private _dialogService: DialogService,
    private _errorService: ErrorService,
    public _multilangService: MultilangService,
    private _userService: UserService,
    private _messageService: MessageService,
    private fb: FormBuilder,
    private route: ActivatedRoute) {
      this.messageForm = fb.group({
        text: ['', [
          CustomValidators.required,
          CustomValidators.minLength(1),
          CustomValidators.maxLength(1000)
        ]]
      });
      this.text.disable();
    }

  /**
   * get the chats
   * start the websocket
   * suscribe to listeners
   * 
   */
  ngOnInit(): void {
    this.getMyChats();
    this._messageService.startWebSocket();
    this.newChatListener = this._messageService.listenToNewChats().subscribe({
      next: (chat)=>{
        if(chat.user.id != this.user.id) { // not a new own chat
          this.originalChats.unshift(chat);
          this.chats.unshift(JSON.parse(JSON.stringify(chat))); // deep clone
        } else { // its an own chat, mark as read
          this._messageService.markAsRead(chat.last_message.id)
          .subscribe({
            next: ()=>{
              chat.last_message.read = 1;
            },
            error: (err)=> this._errorService.handeError(err.error)
          });
        }
      }
    });

    this.newMessageListener = this._messageService.listenToNewMessages().subscribe({
      next: (message)=>{
        // current chat, mark as read, push message and update chat list with last message
        if(this.selectedChat?.user.id == message.sender_id){
          this.selectedIndex = 0;
          this._messageService.markAsRead(message.id)
          .subscribe({
            next: ()=>{
              // implementation of an own chat, like telegram
              if(message.sender_id != this.user.id) {
                this.receivedMessage(message, true);
              } else if(this.selectedChat && this.messages[this.messages.length-1].id != message.id) {
                message.read = 1;
                let index = this.chatListLookFor(message.sender_id);
                this.chats[index[0]].last_message = message;
                this.originalChats[index[1]].last_message = message;
                this.messages.push(message);
              }
              setTimeout(()=>{
                this.chat_box.nativeElement.scrollTop = this.chat_box.nativeElement.scrollHeight; // https://stackoverflow.com/questions/51517324/scrollto-method-doesnt-work-in-edge
              }, 150); // giving time to slow devices to render the new message
            },
            error: (err)=> this._errorService.handeError(err.error)
          });
        } else { // not current chat, update chat list
          this.receivedMessage(message, false);
        }
      }
    });

    this.messageReadListener = this._messageService.listenToMessagesRead().subscribe({
      next: (receiver_id)=>{
        let index = this.chatListLookFor(receiver_id);
        if(index[0] && this.chats[index[0]].user.id != this.user.id) this.chats[index[0]].last_message.read = 1;
        if(index[1] && this.originalChats[index[1]].user.id != this.user.id) this.chats[index[1]].last_message.read = 1;
        if(this.selectedChat?.user.id == receiver_id){
          this.messages.map((message)=>{
            message.read = 1;
          });
        }
      }
    });

    this.multilang = this._multilangService.onLangChangeEvent()
    .subscribe(()=>{
      // deep clone for reprocess them, for internal messages translations
      if(this.messages) this.messages = JSON.parse(JSON.stringify(this.messages));
      this.originalChats = JSON.parse(JSON.stringify(this.originalChats));
      this.chats = JSON.parse(JSON.stringify(this.chats));
    });
  }

  ngOnDestroy(): void {
    this.newChatListener.unsubscribe();
    this.newMessageListener.unsubscribe();
    this.messageReadListener.unsubscribe();
    this.multilang.unsubscribe();
  }

  private receivedMessage(message: Message, currentChat: boolean): void {
    let index = this.chatListLookFor(message.sender_id);
    this.chats[index[0]].last_message = message;
    this.originalChats[index[1]].last_message = message;
    if(currentChat){
      message.read = 1;
      this.messages.push(message);
    } else {
        this.chats[index[0]].unreads++;
        this.chats.unshift(this.chats.splice(index[0],1)[0]);
        if(index[0] > this.selectedIndex) this.selectedIndex++;

      this.originalChats[index[1]].unreads++;
      this.originalChats.unshift(this.originalChats.splice(index[1],1)[0]);
    }
  }

  private chatListLookFor(id: number): number[]{
    // look for index on lists
    let index: number[] = [];
    this.chats.map((chat,i)=>{
      if(chat.user.id == id){
        index[0] = i;
      }
    });
    this.originalChats.map((chat,i)=>{
      if(chat.user.id == id){
        index[1] = i;
      }
    });
    return index;
  }

  private getMyChats(): void {
    // this._dialogService.loading();
    this._messageService.getChats()
    .subscribe({
      next: (resp)=>{
        this.originalChats = resp.data;
        this.chats = JSON.parse(JSON.stringify(this.originalChats)); // deep clone
        this.route.params.subscribe((params)=>{
          if(params.id){
            this.chats.map((chat,i)=>{
              if(chat.user.id == params.id){
                this.viewChat(i);
              }
            });
            if(!this.selectedChat){
              this.getUserForNewChat(params.id);
            }
          }
        });
        // this._dialogService.close();
      },
      error: (err)=>{
        // this._dialogService.close();
        this._errorService.handeError(err.error);
      }
    });
  }

  private getUserForNewChat(id: number): void {
    this._messageService.getUserForNewChat(id)
    .subscribe({
      next: (resp)=>{
        this.originalChats.unshift(resp.data);
        this.chats.unshift(JSON.parse(JSON.stringify(resp.data))); // deep clone
        this.viewChat(0);
      },
      error: (err)=>{
        this._errorService.handeError(err.error);
      }
    });
  }

  public viewChat(i: number): void {
    this.selectedChat = this.chats[i];
    this.selectedIndex = i;
    this.collapsed = true; // close small screen chat list
    this.getMessages(this.selectedChat.user.id);
  }

  private getMessages(userId: number): void {
    this.messages = undefined;
    this.text.disable();
    this._messageService.getMessagesPaginated(userId)
    .subscribe({
      next: (resp)=>{
        this.messagesPaginator = resp.data;
        this.messages = [];
        this.messages = this.messagesPaginator.data;
        this.messagesPaginator.data = undefined;
        setTimeout(()=>{
          this.chat_box.nativeElement.scrollTop = this.chat_box.nativeElement.scrollHeight; // https://stackoverflow.com/questions/51517324/scrollto-method-doesnt-work-in-edge
        }, 10);
        this.text.enable();
        if(this.messages.length > 0 && !this.messages[this.messages.length-1].read){ // if the last is not read, mark chat as read
          this._messageService.markChatAsRead(this.selectedChat.user.id)
          .subscribe({
            next: (resp)=>{
              this.selectedChat.unreads = 0;
              if(this.selectedChat.last_message.sender_id != this.user.id) this.selectedChat.last_message.read = 1;
            },
            error: (err)=>{
              this._errorService.handeError(err.error);
            }
          });
        }
      },
      error: (err)=>{
        this._errorService.handeError(err.error);
      }
    });
  }

  public getMessagesNextPage(): void {
    this.itsLoading = true;
    this._messageService.getMessagesPaginated(this.selectedChat.user.id, ++this.messagesPaginator.current_page)
    .subscribe({
      next: (resp)=>{
        this.itsLoading = false;
        this.messagesPaginator = resp.data;
        this.messagesPaginator.data.map((msg)=>{
          this.messages.unshift(msg);
        });
        this.messagesPaginator.data = undefined;
      },
      error: (err)=>{
        this._errorService.handeError(err.error);
        this.itsLoading = false;
      }
    });
  }

  public sendMessage(): void {
    let i = this.messages.length;
    let message: Message = { // new "on sending" message
      sender_id: this.user.id,
      receiver_id: this.selectedChat.user.id,
      text: this.text.value
    }
    this.messages.push(message); // add to chat
    this.selectedChat.last_message = message; // ad to chatlist as last message
    let chatListIndex = this.chatListLookFor(this.selectedChat.user.id); // move that chat to first position in chatlist
    this.chats.unshift(this.chats.splice(chatListIndex[0],1)[0]);
    this.originalChats.unshift(this.originalChats.splice(chatListIndex[1],1)[0]);
    this.selectedIndex = 0;
    this.text.setValue(''); // reset the text box
    this.text_box.nativeElement.focus(); // focus the text box
    setTimeout(()=>{
      this.chat_box.nativeElement.scrollTop = this.chat_box.nativeElement.scrollHeight; // https://stackoverflow.com/questions/51517324/scrollto-method-doesnt-work-in-edge
    }, 150); // giving time to slow devices to render the new message
    this._messageService.sendMessage(this.selectedChat.user.id, this.messages[i].text)
    .subscribe({
      next: (resp)=>{
        // add the correctly sent message data to the message
        this.messages[i].id = resp.data.id; // for do not render it again, or animations will be displayed again
        this.messages[i].read = resp.data.read;
        this.messages[i].created_at = resp.data.created_at;
        this.selectedChat.last_message = this.messages[i]; // update the chat list last message
      },
      error: (err)=>{
        this.messages[i].failed = true; // mark message as failed at send
        this._errorService.handeError(err.error);
      }
    });
  }

  /**
    * case insensitive search by name or surname
    *
    * @param search string
    */
   public search(search:string): void {
    if(!search){
      this.chats = JSON.parse(JSON.stringify(this.originalChats));
    } else {
      search = search.trim();
      this.chats =  this.originalChats.filter(chat => { // came cloned
        return `${chat.user.name} ${chat.user.surnames}`.toLowerCase().indexOf(search.toLowerCase()) > -1;
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

  // GETTERS
  get user(): User {
    return this._userService.user;
  }

  get text(): AbstractControl {
    return this.messageForm.get('text');
  }

}
