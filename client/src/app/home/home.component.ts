import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  registerMode: boolean = false;
  users: any;
  constructor() {}

  ngOnInit(): void {}
  toggleRegister() {
    this.registerMode = !this.registerMode;
  }

  cancelRegister(e: boolean) {
    this.registerMode = e;
  }
}
