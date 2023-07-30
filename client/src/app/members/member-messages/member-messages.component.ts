import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Message } from 'src/app/_model/message';
import { MessageService } from 'src/app/_services/message.service';

@Component({
  selector: 'app-member-messages',
  templateUrl: './member-messages.component.html',
  styleUrls: ['./member-messages.component.css'],
})
export class MemberMessagesComponent implements OnInit {
  @ViewChild('messageForm') messForm?: NgForm;
  @Input() userName?: string;
  @Input() messages: Message[] = [];
  messContent: string = '';
  constructor(private messageService: MessageService) {}

  ngOnInit(): void {}
  sendMess() {
    if (!this.userName || !this.messContent) return;
    this.messageService.sendMess(this.userName, this.messContent).subscribe({
      next: (res) => {
        this.messages.push(res);
        this.messForm?.reset();
      },
    });
  }
}
