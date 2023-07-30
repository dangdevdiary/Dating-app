import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  NgxGalleryAnimation,
  NgxGalleryImage,
  NgxGalleryOptions,
} from '@kolkov/ngx-gallery';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';
import { Member } from 'src/app/_model/member';
import { Message } from 'src/app/_model/message';
import { MembersService } from 'src/app/_services/members.service';
import { MessageService } from 'src/app/_services/message.service';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css'],
})
export class MemberDetailComponent implements OnInit {
  @ViewChild('tab', { static: true }) memberTab?: TabsetComponent;
  member: Member = {} as Member;
  activeTab?: TabDirective;
  galleryOptions: NgxGalleryOptions[] = [];
  galleryImages: NgxGalleryImage[] = [];
  messages: Message[] = [];

  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService
  ) {}
  ngOnInit(): void {
    this.route.data.subscribe({
      next: (res) => {
        this.member = res['member'];
      },
    });
    this.route.queryParams.subscribe({
      next: (res) => {
        if (this.memberTab) {
          res['tab'] && this.selectTab(res['tab']);
        }
      },
    });
    this.galleryOptions = [
      {
        width: '500px',
        height: '500px',
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide,
        preview: false,
      },
    ];
    this.galleryImages = this.loadImg();
  }

  selectTab(heading: string) {
    if (this.memberTab) {
      this.memberTab.tabs.find((h) => h.heading === heading)!.active = true;
    }
  }

  loadImg() {
    if (!this.member) return [];
    const imgUrls = [];
    for (const img of this.member.photos) {
      imgUrls.push({
        small: img.url,
        medium: img.url,
        big: img.url,
      });
    }
    return imgUrls;
  }
  loadMessThread() {
    if (!this.member) return;
    this.messageService.loadMessThread(this.member.userName).subscribe({
      next: (res) => {
        this.messages = res;
      },
    });
  }
  onTabActive(e: TabDirective) {
    this.activeTab = e;
    if (this.activeTab.heading === 'Messages') {
      this.loadMessThread();
    }
  }
}
