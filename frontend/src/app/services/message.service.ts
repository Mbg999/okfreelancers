import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';import { environment } from 'src/environments/environment';
import { Subject, Observable } from 'rxjs';

// SERVICES
import { UserService } from './user.service';
import { HttpService } from './http.service';

// INTERFACES
import { Chat } from '../interfaces/chat';
import { Message } from '../interfaces/message';

// PUSHER
import Pusher from 'pusher-js';
import * as PusherTypes from 'pusher-js';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private pusher: Pusher;
  private chatSubject: Subject<Chat>;
  private messageChannel: PusherTypes.Channel;
  private messageSubject: Subject<Message>;
  private messageReadSubject: Subject<number>;
  private iReadAMessageSubject: Subject<number>;
  private newBalanceSubject: Subject<number>;

  constructor(private http: HttpService,
    private _userService: UserService) {}

  // --------- AUTH ZONE
  public startWebSocket(): void {
    if(!this.pusher || !this.messageChannel){
      this.pusher = new Pusher(environment.pusher.key, {
        cluster: environment.pusher.cluster,
        forceTLS: false,
        wsHost: environment.wsHost,
        wsPort: 6001,
        wssPort: 6001,
        // authEndpoint: environment.url+'/api/sockets/auth',
        auth: {
          headers: {
            Authorization: this._userService.token
          }
        }
      });
      //this.pusher.connect();
      this.messageChannel = this.pusher.subscribe(`messages.${this._userService.user.id}`);
    }
  }

  private startNewChatListener(): void {
    this.chatSubject = new Subject<Chat>();
    this.messageChannel.bind('NewChat', (data) => {
      this.chatSubject.next(data[0])
    });
  }

  private startNewMessagesListener(): void {
    this.messageSubject = new Subject<Message>();
    this.messageChannel.bind('NewMessage', (data) => {
      this.messageSubject.next(data[0])
    });
  }

  private startMessageReadListener(): void {
    this.messageReadSubject = new Subject<number>();
    this.messageChannel.bind('MessageRead', (data)=>{ // returns the receiver_id, mark all the messages from that chat as read
      this.messageReadSubject.next(data[0]);
    });
  }

  private startNewBalanceListener(): void {
    this.newBalanceSubject = new Subject<number>();
    this.messageChannel.bind('NewBalance', (data)=>{ // returns the receiver_id, mark all the messages from that chat as read
      this.newBalanceSubject.next(data[0]);
    });
  }

  public listenToNewChats(): Observable<Chat> {
    if(!this.chatSubject) this.startNewChatListener();
    return this.chatSubject.asObservable();
  }

  public listenToNewMessages(): Observable<Message> {
    if(!this.messageSubject) this.startNewMessagesListener();
    return this.messageSubject.asObservable();
  }

  public listenToMessagesRead(): Observable<number> {
    if(!this.messageReadSubject) this.startMessageReadListener();
    return this.messageReadSubject.asObservable();
  }

  public listenWhenIReadAMessage(): Observable<number> {
    if(!this.iReadAMessageSubject) this.iReadAMessageSubject = new Subject<number>();
    return this.iReadAMessageSubject.asObservable();
  }

  public listenNewBalance(): Observable<number> {
    if(!this.newBalanceSubject) this.startNewBalanceListener();
    return this.newBalanceSubject.asObservable();
  }

  public getChats(): Observable<any> {
    return this.http.get('/messages/chats', {Authorization: this._userService.token});
  }

  public getUnreadsCount(): Observable<any> {
    return this.http.get('/messages/unreads/count', {Authorization: this._userService.token});
  }

  public getMessagesPaginated(userId, page: number=1): Observable<any> {
    return this.http.get(`/messages/${userId}?page=${page}`, {Authorization: this._userService.token})
    .pipe(
      map((resp)=>{
        if(resp.ok){
          resp.data.data = resp.data.data.sort((a,b)=> a.id-b.id);
        }
        return resp;
      })
    );
  }

  public sendMessage(receiver_id: number, text: string): Observable<any> {
    return this.http.post('/messages', {receiver_id, text}, {Authorization: this._userService.token});
  }

  public markAsRead(id: number){
    return this.http.put(`/messages/${id}/read`, {}, {Authorization: this._userService.token})
    .pipe(
      map((resp)=>{
        if(this.iReadAMessageSubject) this.iReadAMessageSubject.next(1);
        return resp;
      })
    );
  }

  public markChatAsRead(sender_id: number): Observable<any> {
    return this.http.put(`/messages/chat/${sender_id}/read`, {}, {Authorization: this._userService.token})
    .pipe(
      map((resp)=>{
        if(this.iReadAMessageSubject) this.iReadAMessageSubject.next(resp.data);
        return resp;
      })
    );
  }

  public getUserForNewChat(id: number): Observable<any> {
    return this.http.get(`/messages/user/${id}`, {Authorization: this._userService.token});
  }
}
