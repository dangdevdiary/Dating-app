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
  constructor(private accountService: AccountService) {}
  ngOnInit(): void {
    this.setCurrentUser();
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
