import { Inject, Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { UserProfileComponent } from '../users/user-profile/user-profile.component';
import { ConfirmService } from '../_services/confirm.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PreventUnsavedChangesGuard
  implements CanDeactivate<UserProfileComponent>
{
  constructor(private confirmService: ConfirmService) {}
  canDeactivate(
    component: UserProfileComponent
  ): Observable<boolean> | boolean {
    if (component.editProfileForm?.dirty) {
      return this.confirmService.confirm();
    }
    return true;
  }
}
