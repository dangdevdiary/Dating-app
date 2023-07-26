import { Component, OnInit } from '@angular/core';
import { MembersService } from '../_services/members.service';
import { Member } from '../_model/member';
import { Pagination } from '../_model/pagination';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.css'],
})
export class ListsComponent implements OnInit {
  predicate = 'liked';
  members: Member[] | undefined;
  pagination: Pagination | undefined;
  pageNumber = 1;
  pageSize = 6;
  constructor(private memberService: MembersService) {}

  ngOnInit(): void {
    this.loadLikes();
  }
  loadLikes() {
    this.memberService
      .getLike(this.predicate, this.pageNumber, this.pageSize)
      .subscribe({
        next: (res) => {
          this.members = res.result;
          this.pagination = res.pagination;
        },
      });
  }
  pageChanged(event: PageChangedEvent) {
    if (event.page === this.pageNumber) return;
    this.pageNumber = event.page;
    this.loadLikes();
  }
}
