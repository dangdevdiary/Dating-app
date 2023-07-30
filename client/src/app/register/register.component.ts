import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { ToastrService } from 'ngx-toastr';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  model: any = {};
  maxDate: Date = new Date();
  errList: string[] | undefined;
  registerForm: FormGroup = new FormGroup({});
  @Output() cancelRegisterEvennt = new EventEmitter();

  constructor(
    private accountService: AccountService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 18);
  }
  initializeForm() {
    this.registerForm = this.fb.group({
      userName: [
        '',
        [
          Validators.required,
          Validators.maxLength(16),
          Validators.minLength(4),
        ],
      ],
      gender: ['male'],
      country: ['', Validators.required],
      knownAs: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      city: ['', Validators.required],
      password: [
        '',
        [Validators.required, Validators.maxLength(8), Validators.minLength(4)],
      ],
      confirmPassword: ['', [Validators.required, this.matchValue('password')]],
    });
    this.registerForm.controls['password'].valueChanges.subscribe({
      next: () => {
        this.registerForm.controls['confirmPassword'].updateValueAndValidity();
      },
    });
  }
  matchValue(matchTo: string): ValidatorFn {
    return (control: AbstractControl) => {
      return control.value === control.parent?.get(matchTo)?.value
        ? null
        : {
            notMatch: true,
          };
    };
  }
  register() {
    let dob = this.getDateOnly(this.registerForm.controls['dateOfBirth'].value);
    let user = { ...this.registerForm.value, dateOfBirth: dob };
    this.accountService.register(user).subscribe({
      next: (res) => {
        // this.cancel();
        this.router.navigateByUrl('/members');
      },
      error: (err) => {
        // this.toast.error(err.error, 'Error');
        this.errList = err;
      },
    });
  }
  cancel() {
    this.cancelRegisterEvennt.emit(false);
  }
  getDateOnly(dob: string | undefined) {
    if (!dob) return;
    let date = new Date(dob);
    let dobRes = new Date(
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
    )
      .toISOString()
      .slice(0, 10);

    return dobRes;
  }
}
