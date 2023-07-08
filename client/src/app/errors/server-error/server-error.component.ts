import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-server-error',
  templateUrl: './server-error.component.html',
  styleUrls: ['./server-error.component.css'],
})
export class ServerErrorComponent implements OnInit {
  error: any = null;
  constructor(private router: Router) {
    const navigate = this.router.getCurrentNavigation();
    this.error = navigate?.extras?.state?.['error'];
  }

  ngOnInit(): void {}
}
