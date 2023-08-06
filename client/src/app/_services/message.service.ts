import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Message } from '../_model/message';
// import { Member } from '../_model/member';
import {
  getPaginatedResult,
  getPaginationResultHeader,
} from './paginationHelper';
import { environment } from 'src/environments/environment';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { User } from '../_model/user';
import { BehaviorSubject, take } from 'rxjs';
import { Group } from '../_model/group';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  hubUrl = environment.hubUrl;
  private hubConnection?: HubConnection;
  private messageThreadSource = new BehaviorSubject<Message[]>([]);
  messageThread$ = this.messageThreadSource.asObservable();
  baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  createHubConnection(user: User, otherUsername: string) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'messages?user=' + otherUsername, {
        accessTokenFactory: () => user.token,
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().catch((error) => console.log(error));

    this.hubConnection.on('ReceiveMessageThread', (messages) => {
      this.messageThreadSource.next(messages.result);
    });

    this.hubConnection.on('UpdatedGroup', (group: Group) => {
      if (group.connections.some((x) => x.userName === otherUsername)) {
        this.messageThread$.pipe(take(1)).subscribe({
          next: (messages) => {
            messages.forEach((message) => {
              if (!message.dateRead) {
                message.dateRead = new Date(Date.now());
              }
            });
            this.messageThreadSource.next([...messages]);
          },
        });
      }
    });

    this.hubConnection.on('NewMessage', (message) => {
      this.messageThread$.pipe(take(1)).subscribe({
        next: (messages) => {
          this.messageThreadSource.next([...messages, message]);
        },
      });
    });
  }
  stopHubConnection() {
    if (this.hubConnection) {
      this.hubConnection.stop().catch((err) => {
        console.log(err);
      });
    }
  }
  getMess(pageNumber: number, pageSize: number, container: string) {
    var params = getPaginationResultHeader(pageNumber, pageSize);
    params = params.append('container', container);
    return getPaginatedResult<Message[]>(
      this.baseUrl + 'messages',
      params,
      this.http
    );
  }
  loadMessThread(userName: string) {
    return this.http.get<Message[]>(
      this.baseUrl + 'messages/thread/' + userName
    );
  }
  sendMess(userName: string, content: string) {
    return this.hubConnection
      ?.invoke('SendMess', {
        recipientUserName: userName,
        content,
      })
      .catch((err) => {
        console.log(err);
      });
  }
  deleteMess(id: number) {
    return this.http.delete(this.baseUrl + 'messages/' + id);
  }
}
