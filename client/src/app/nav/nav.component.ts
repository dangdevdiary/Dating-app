import { Component, OnInit } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { BsDropdownConfig } from 'ngx-bootstrap/dropdown';
import { BehaviorSubject } from 'rxjs';
@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
  providers: [
    {
      provide: BsDropdownConfig,
      useValue: { isAnimated: true, autoClose: true },
    },
  ],
})
export class NavComponent implements OnInit {
  model: any = {};
  loggedIn = false;
  constructor(public accountService: AccountService) {}

  ngOnInit(): void {
    this.getCurrentUser();
  }
  /**
   * getCurrentUser
   */
  public getCurrentUser() {
    this.accountService.currentUser$.subscribe({
      next: (user) => {
        this.loggedIn = !!user;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  login() {
    this.accountService.login(this.model).subscribe({
      next: (res) => {
        this.loggedIn = true;
      },
      error(err) {
        console.log(err);
      },
    });
  }
  logout() {
    this.loggedIn = false;
    this.accountService.logout();
  }
}
