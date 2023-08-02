import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-roles-modal',
  templateUrl: './roles-modal.component.html',
  styleUrls: ['./roles-modal.component.css'],
})
export class RolesModalComponent implements OnInit {
  userName = '';
  availableRoles: any[] = [];
  selectedRoles: any[] = [];
  constructor(public bsModalRef: BsModalRef) {}

  ngOnInit(): void {}

  updateChecked(value: string) {
    const index = this.selectedRoles.indexOf(value);
    index !== -1
      ? this.selectedRoles.splice(index, 1)
      : this.selectedRoles.push(value);
  }
}
