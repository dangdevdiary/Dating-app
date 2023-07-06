import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AccountService } from './_services/account.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'Dating app';
  users: any;
  private http: HttpClient;
  constructor(http: HttpClient, private accountService: AccountService) {
    this.http = http;
  }
  ngOnInit(): void {
    this.getUsers();
    this.setCurrentUser();
  }
  /**
   * getUser
   */
  getUsers() {
    this.http.get('https://localhost:5001/api/users').subscribe({
      next: (res) => {
        this.users = res;
      },
      error: (err) => {
        console.log(err);
      },
      complete() {
        // console.log('end');
      },
    });
  }
  /**
   * setCurrentUser
   */
  setCurrentUser() {
    const userLocal = localStorage.getItem('user');
    if (!userLocal) return;
    const user = JSON.parse(userLocal);
    this.accountService.setCurrentUser(user);
  }
}
