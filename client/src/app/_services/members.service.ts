import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Member } from '../_model/member';
import { User } from '../_model/user';
import { map, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MembersService {
  baseUrl = environment.apiUrl;
  members: Member[] = [];
  constructor(private http: HttpClient) {}
  getMembers() {
    if (this.members.length > 0) return of(this.members);
    return this.http.get<Member[]>(this.baseUrl + 'users').pipe(
      map((res) => {
        this.members = res;
        return res;
      })
    );
  }

  getMemberByUserName(userName: string) {
    const member = this.members.find((m) => m.userName == userName);
    if (member) return of(member);
    return this.http.get<Member>(this.baseUrl + 'users/' + userName);
  }
  updateUser(user: Member) {
    return this.http.put(this.baseUrl + 'users', user);
  }
}
