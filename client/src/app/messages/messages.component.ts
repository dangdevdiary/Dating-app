import { Component, OnInit } from '@angular/core';
import { Message } from '../_model/message';
import { MessageService } from '../_services/message.service';
import { Pagination } from '../_model/pagination';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css'],
})
export class MessagesComponent implements OnInit {
  mess?: Message[];
  pagination?: Pagination;
  pageNumber = 1;
  pageSize = 6;
  container = 'Unread';
  loading = false;
  constructor(private messageService: MessageService) {}

  ngOnInit(): void {
    this.loadMess();
  }

  loadMess() {
    this.loading = true;
    this.messageService
      .getMess(this.pageNumber, this.pageSize, this.container)
      .subscribe({
        next: (res) => {
          this.mess = res.result;
          this.pagination = res.pagination;
          this.loading = false;
        },
      });
  }
  pageChanged(e: PageChangedEvent) {
    if (e.page === this.pageNumber) return;
    this.pageNumber = e.page;
    this.loadMess();
  }
  deleteMess(id: number) {
    if (!id) return;
    this.messageService.deleteMess(id).subscribe({
      next: () => {
        this.mess?.splice(
          this.mess.findIndex((m) => m.id === id),
          1
        );
      },
    });
  }
}
