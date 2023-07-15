import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  NgxGalleryAnimation,
  NgxGalleryImage,
  NgxGalleryOptions,
} from '@kolkov/ngx-gallery';
import { Member } from 'src/app/_model/member';
import { MembersService } from 'src/app/_services/members.service';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css'],
})
export class MemberDetailComponent implements OnInit {
  member: Member | undefined;
  galleryOptions: NgxGalleryOptions[] = [];
  galleryImages: NgxGalleryImage[] = [];
  constructor(
    private memberService: MembersService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getDetailMember();
    this.galleryOptions = [
      {
        width: '500px',
        height: '500px',
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide,
        preview: false,
      },
    ];
  }
  getDetailMember() {
    const userName = this.route.snapshot.paramMap.get('username');
    if (!userName) return;
    this.memberService.getMemberByUserName(userName).subscribe({
      next: (res) => {
        this.member = res;
        this.galleryImages = this.loadImg();
      },
    });
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
}
