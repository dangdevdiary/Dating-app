import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';
import { Member } from 'src/app/_model/member';
import { User } from 'src/app/_model/user';
import { AccountService } from 'src/app/_services/account.service';
import { MembersService } from 'src/app/_services/members.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent implements OnInit {
  @ViewChild('editForm') editProfileForm: NgForm | undefined;
  @HostListener('window:beforeunload', ['$event']) unloadNotification(
    $event: any
  ) {
    if (this.editProfileForm?.dirty) {
      return ($event.returnValue = true);
    }
    return false;
  }
  memberProfile: Member | undefined;
  user: User | null = null;
  constructor(
    private accountService: AccountService,
    private memberService: MembersService,
    private toast: ToastrService
  ) {
    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: (res) => {
        this.user = res;
      },
    });
  }

  ngOnInit(): void {
    this.loadUser();
  }
  loadUser() {
    if (!this.user) return;
    this.memberService.getMemberByUserName(this.user.userName).subscribe({
      next: (res) => {
        this.memberProfile = res;
      },
    });
  }
  updateProfile() {
    this.memberService.updateUser(this.editProfileForm?.value).subscribe({
      next: (_) => {
        this.toast.success('Update profile successfully!');
        this.editProfileForm?.reset(this.memberProfile);
      },
    });
  }
}
