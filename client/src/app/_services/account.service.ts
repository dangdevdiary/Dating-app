import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { User } from '../_model/user';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root',
})
export class AccountService {
  baseUrl = environment.apiUrl;
  private currentUser = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUser.asObservable();
  constructor(private httpClient: HttpClient) {}
  login(model: any) {
    return this.httpClient
      .post<User>(this.baseUrl + 'account/login', model)
      .pipe(
        map((res) => {
          const user = res;
          if (user) {
            this.setCurrentUser(user);
          }
        })
      );
  }
  setCurrentUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.next(user);
  }
  logout() {
    localStorage.removeItem('user');
    this.currentUser.next(null);
  }
  register(user: User) {
    return this.httpClient.post<User>(this.baseUrl + 'account/register', user);
  }
}
