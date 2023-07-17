import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root',
})
export class BusyService {
  countBusyRequest = 0;
  constructor(private spinner: NgxSpinnerService) {}
  busy() {
    this.countBusyRequest++;
    this.spinner.show(undefined, {
      type: 'line-scale-pulse-out-rapid',
      bdColor: 'rgba(255,255,255,0)',
      color: '#333333',
    });
  }
  idle() {
    this.countBusyRequest--;
    if (this.countBusyRequest <= 0) {
      this.countBusyRequest = 0;
      this.spinner.hide();
    }
  }
}
