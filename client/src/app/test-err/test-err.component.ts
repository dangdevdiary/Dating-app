import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-test-err',
  templateUrl: './test-err.component.html',
  styleUrls: ['./test-err.component.css'],
})
export class TestErrComponent implements OnInit {
  constructor(private http: HttpClient) {}

  ngOnInit(): void {}
  NotFound() {
    this.http.get('https://localhost:5001/api/buggy/not-found').subscribe({
      next: (res) => {
        console.log(res);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  ServerErr() {
    this.http.get('https://localhost:5001/api/buggy/server-error').subscribe({
      next: (res) => {
        console.log(res);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  AuthErr() {
    this.http.get('https://localhost:5001/api/buggy/auth').subscribe({
      next: (res) => {
        console.log(res);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  BadErr() {
    this.http.get('https://localhost:5001/api/buggy/bad-request').subscribe({
      next: (res) => {
        console.log(res);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  ValidErr() {
    this.http
      .post('https://localhost:5001/api/account/register', {})
      .subscribe({
        next: (res) => {
          console.log(res);
        },
        error: (err) => {
          console.log(err);
        },
      });
  }
}
