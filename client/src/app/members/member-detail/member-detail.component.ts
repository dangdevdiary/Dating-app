import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  NgxGalleryAnimation,
  NgxGalleryImage,
  NgxGalleryOptions,
} from '@kolkov/ngx-gallery';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';
import { take } from 'rxjs';
import { Member } from 'src/app/_model/member';
import { Message } from 'src/app/_model/message';
import { User } from 'src/app/_model/user';
import { AccountService } from 'src/app/_services/account.service';
import { MembersService } from 'src/app/_services/members.service';
import { MessageService } from 'src/app/_services/message.service';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css'],
})
export class MemberDetailComponent implements OnInit, OnDestroy {
  @ViewChild('tab', { static: true }) memberTab?: TabsetComponent;
  member: Member = {} as Member;
  activeTab?: TabDirective;
  galleryOptions: NgxGalleryOptions[] = [];
  galleryImages: NgxGalleryImage[] = [];
  // messages: Message[] = [];
  user?: User;
  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService,
    private accountService: AccountService
  ) {
    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: (user) => {
        if (user) {
          this.user = user;
        }
      },
    });
  }

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

  ngOnDestroy(): void {
    this.messageService.stopHubConnection();
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
  // loadMessThread() {
  //   if (!this.member) return;
  //   this.messageService.loadMessThread(this.member.userName).subscribe({
  //     next: (res) => {
  //       this.messages = res;
  //     },
  //   });
  // }
  onTabActive(e: TabDirective) {
    this.activeTab = e;
    if (this.activeTab.heading === 'Messages' && this.user) {
      // this.loadMessThread();
      this.messageService.createHubConnection(this.user, this.member.userName);
    } else {
      this.messageService.stopHubConnection();
    }
  }
}
