import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Message } from '../_model/message';
import { Member } from '../_model/member';
import {
  getPaginatedResult,
  getPaginationResultHeader,
} from './paginationHelper';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}
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
    return this.http.post<Message>(this.baseUrl + 'messages', {
      recipientUserName: userName,
      content,
    });
  }
  deleteMess(id: number) {
    return this.http.delete(this.baseUrl + 'messages/' + id);
  }
}
