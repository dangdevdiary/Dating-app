import { Component, Input, OnInit } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { take } from 'rxjs';
import { Member } from 'src/app/_model/member';
import { Photo } from 'src/app/_model/photo';
import { User } from 'src/app/_model/user';
import { AccountService } from 'src/app/_services/account.service';
import { MembersService } from 'src/app/_services/members.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-photo-editor',
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.css'],
})
export class PhotoEditorComponent implements OnInit {
  @Input() member: Member | undefined;
  uploader: FileUploader | undefined;
  hasBaseDropZoneOver = false;
  baseUrl = environment.apiUrl;
  user: User | undefined;
  constructor(
    private accountService: AccountService,
    private memberService: MembersService
  ) {
    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: (res) => {
        if (res) this.user = res;
      },
    });
  }

  ngOnInit(): void {
    this.initializeUploader();
  }
  fileOverBase(e: any) {
    this.hasBaseDropZoneOver = e;
  }
  initializeUploader() {
    this.uploader = new FileUploader({
      url: this.baseUrl + 'users/add-photo',
      authToken: 'Bearer ' + this.user?.token,
      isHTML5: true,
      maxFileSize: 10 * 1024 * 1024,
      allowedFileType: ['image'],
      autoUpload: false,
      removeAfterUpload: true,
    });
    this.uploader.onAfterAddingFile = (file) => {
      file.withCredentials = false;
    };
    this.uploader.onSuccessItem = (item, res, status, headers) => {
      if (res) {
        const photo = JSON.parse(res);
        this.member?.photos.push(photo);
        if (photo.isMain && this.user && this.member) {
          this.user.avatar = photo.url;
          this.member.avatar = photo.url;
          this.accountService.setCurrentUser(this.user);
        }
      }
    };
  }
  setAvatar(photo: Photo) {
    this.memberService.setAvatar(photo.id).subscribe({
      next: () => {
        if (this.user && this.member) {
          this.user.avatar = photo.url;
          this.accountService.setCurrentUser(this.user);
          this.member.avatar = photo.url;
          this.member.photos.forEach((p) => {
            if (p.isMain && p.id !== photo.id) p.isMain = false;
            if (p.isMain === false && p.id === photo.id) p.isMain = true;
          });
        }
      },
    });
  }
  deletePhoto(idImg: number) {
    this.memberService.deletePhoto(idImg).subscribe({
      next: () => {
        if (this.member) {
          this.member.photos = this.member.photos.filter((p) => p.id !== idImg);
        }
      },
    });
  }
}
