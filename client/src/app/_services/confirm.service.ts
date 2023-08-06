import { Injectable } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { ConfirmComponent } from '../modals/confirm/confirm.component';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConfirmService {
  bsModalRef?: BsModalRef<ConfirmComponent>;
  constructor(private modalService: BsModalService) {}

  confirm(
    title = 'Confirmation',
    message = 'Are you sure you want to do this?',
    btnOkText = 'OK',
    btnCancelText = 'Cancel'
  ): Observable<boolean> {
    const config: ModalOptions = {
      initialState: {
        title,
        message,
        btnOkText,
        btnCancelText,
      },
    };
    this.bsModalRef = this.modalService.show(ConfirmComponent, config);
    return this.bsModalRef.onHidden!.pipe(
      map(() => this.bsModalRef!.content!.result)
    );
  }
}
