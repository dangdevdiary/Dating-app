import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { User } from '../_model/user';
import { BehaviorSubject, take } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class PresenceService {
  hubUrl = environment.hubUrl;
  private userOnlSource = new BehaviorSubject<string[]>([]);
  usersOnline = this.userOnlSource.asObservable();
  private hubConnection?: HubConnection;
  constructor(private toast: ToastrService, private router: Router) {}

  createHubConnection(user: User) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'presence', {
        accessTokenFactory: () => user.token,
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().catch((err) => {
      console.log(err);
    });

    this.hubConnection.on('UserIsOnline', (userName) => {
      this.userOnlSource.pipe(take(1)).subscribe({
        next: (userNames) => {
          this.userOnlSource.next([...userNames, userName]);
        },
      });
    });

    this.hubConnection.on('UserIsOffline', (userName) => {
      this.userOnlSource.pipe(take(1)).subscribe({
        next: (userNames) => {
          this.userOnlSource.next(userNames.filter((u) => u !== userName));
        },
      });
    });
    this.hubConnection.on('GetOnlineUsers', (userNames) => {
      this.userOnlSource.next(userNames);
    });
    this.hubConnection.on(
      'NewMessageReceived',
      (noti: { userName: string; knownAs: string }) => {
        this.toast
          .success(noti.knownAs + ' has sent a new message! click me to see it')
          .onTap.pipe(take(1))
          .subscribe({
            next: () => {
              this.router.navigateByUrl(
                '/members/' + noti.userName + '?tab=Messages'
              );
            },
          });
      }
    );
  }
  stopHubConnection() {
    this.hubConnection?.stop().catch((err) => {
      console.log(err);
    });
  }
}
