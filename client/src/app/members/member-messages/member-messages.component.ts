import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { Message } from 'src/app/_model/message';
import { MessageService } from 'src/app/_services/message.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-member-messages',
  templateUrl: './member-messages.component.html',
  styleUrls: ['./member-messages.component.css'],
})
export class MemberMessagesComponent implements OnInit {
  @ViewChild('messageForm') messForm?: NgForm;
  @Input() userName?: string;
  messContent: string = '';
  constructor(public messageService: MessageService) {}

  ngOnInit(): void {}
  sendMess() {
    if (!this.userName || !this.messContent) return;
    this.messageService.sendMess(this.userName, this.messContent)?.then(() => {
      this.messForm?.reset();
    });
  }
}
