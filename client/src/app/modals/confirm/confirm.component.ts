import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.css'],
})
export class ConfirmComponent implements OnInit {
  title = '';
  message = '';
  btnOkText = '';
  btnCancelText = '';
  result = false;
  constructor(public bsModalRef: BsModalRef) {}

  ngOnInit(): void {}
  confirm() {
    this.result = true;
    this.bsModalRef.hide();
  }
  decline() {
    this.result = false;
    this.bsModalRef.hide();
  }
}
