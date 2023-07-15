import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Member } from '../_model/member';
import { User } from '../_model/user';

@Injectable({
  providedIn: 'root',
})
export class MembersService {
  baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}
  getMembers() {
    return this.http.get<Member[]>(this.baseUrl + 'users');
  }

  getMemberByUserName(userName: string) {
    return this.http.get<Member>(this.baseUrl + 'users/' + userName);
  }
}
