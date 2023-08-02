import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { User } from 'src/app/_model/user';
import { AdminService } from 'src/app/_services/admin.service';
import { RolesModalComponent } from 'src/app/modals/roles-modal/roles-modal.component';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
})
export class UserManagementComponent implements OnInit {
  users: {
    id: string;
    userName: string;
    roles: string[];
  }[] = [];

  bsModalRef: BsModalRef<RolesModalComponent> =
    new BsModalRef<RolesModalComponent>();

  availableRoles = ['moderator', 'member', 'admin'];

  constructor(
    private adminService: AdminService,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {
    this.getRoles();
  }

  getRoles() {
    this.adminService.getUsersWithRoles().subscribe({
      next: (user) => {
        if (user) this.users = user;
      },
    });
  }
  openModal(user: { userName: string; roles: string[] }) {
    const config = {
      class: 'modal-dialog-centered',
      initialState: {
        userName: user.userName,
        availableRoles: this.availableRoles,
        selectedRoles: [...user.roles],
      },
    };
    this.bsModalRef = this.modalService.show(RolesModalComponent, config);
    this.bsModalRef.onHide?.subscribe({
      next: () => {
        const selectedRoles = this.bsModalRef.content?.selectedRoles;
        if (!this.arrayEqual(selectedRoles!, user.roles)) {
          console.log(this.arrayEqual(selectedRoles!, user.roles));
          this.adminService
            .updateUserRole(user.userName, selectedRoles!)
            .subscribe({
              next: (role) => {
                user.roles = role;
              },
            });
        }
      },
    });
  }
  private arrayEqual(arr1: any[], arr2: any[]): boolean {
    return arr1.sort().toString() === arr2.sort().toString();
  }
}
