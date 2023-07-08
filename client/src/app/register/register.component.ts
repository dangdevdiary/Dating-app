import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  model: any = {};

  @Output() cancelRegisterEvennt = new EventEmitter();

  constructor(
    private accountService: AccountService,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {}
  register() {
    this.accountService.register(this.model).subscribe({
      next: (res) => {
        this.cancel();
      },
      error: (err) => {
        this.toast.error(err.error, 'Error');
      },
    });
  }
  cancel() {
    this.cancelRegisterEvennt.emit(false);
  }
}
