import { Component, OnInit } from '@angular/core';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { Observable, take } from 'rxjs';
import { Member } from 'src/app/_model/member';
import { Pagination } from 'src/app/_model/pagination';
import { User } from 'src/app/_model/user';
import { UserParams } from 'src/app/_model/userParams';
import { AccountService } from 'src/app/_services/account.service';
import { MembersService } from 'src/app/_services/members.service';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css'],
})
export class MemberListComponent implements OnInit {
  members: Member[] = [];
  userParams: UserParams | undefined;
  user: User | undefined;
  pagination: Pagination | undefined;
  genderList = [
    { value: 'male', display: 'Male' },
    { value: 'female', display: 'Female' },
  ];
  constructor(private memberService: MembersService) {
    this.userParams = this.memberService.getUserParams();
  }

  ngOnInit(): void {
    this.loadMember();
  }
  loadMember() {
    if (this.userParams) {
      this.memberService.setUserParams(this.userParams);
      this.memberService.getMembers(this.userParams).subscribe({
        next: (res) => {
          if (res.result) {
            this.members = res.result;
          }
          if (res.pagination) {
            this.pagination = res.pagination;
          }
        },
      });
    }
  }
  resetFilter() {
    this.userParams = this.memberService.resetUserParams();
    this.loadMember();
  }
  pageChanged(event: PageChangedEvent) {
    if (event.page === this.userParams?.pageNumber || !this.userParams) return;
    this.userParams.pageNumber = event.page;
    this.memberService.setUserParams(this.userParams);
    this.loadMember();
  }
}
