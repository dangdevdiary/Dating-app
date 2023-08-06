import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { User } from '../_model/user';
import { environment } from 'src/environments/environment';
import { PresenceService } from './presence.service';
@Injectable({
  providedIn: 'root',
})
export class AccountService {
  baseUrl = environment.apiUrl;
  private currentUser = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUser.asObservable();
  constructor(
    private httpClient: HttpClient,
    private presenceService: PresenceService
  ) {}
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
    const userRole = this.decodeToken(user.token).role;
    if (Array.isArray(userRole)) user.role = userRole;
    else user.role = [userRole];
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.next(user);
    this.presenceService.createHubConnection(user);
  }
  logout() {
    localStorage.removeItem('user');
    this.currentUser.next(null);
    this.presenceService.stopHubConnection();
  }
  register(user: User) {
    return this.httpClient
      .post<User>(this.baseUrl + 'account/register', user)
      .pipe(
        map((res) => {
          const user = res;
          if (user) {
            this.setCurrentUser(user);
          }
        })
      );
  }
  decodeToken(token: string) {
    return JSON.parse(atob(token.split('.')[1]));
  }
}
