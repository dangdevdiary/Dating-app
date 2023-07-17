import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { UserProfileComponent } from '../users/user-profile/user-profile.component';

@Injectable({
  providedIn: 'root',
})
export class PreventUnsavedChangesGuard implements CanDeactivate<unknown> {
  canDeactivate(component: UserProfileComponent): boolean {
    if (component.editProfileForm?.dirty) {
      return confirm('Are you sure? Any unsaved changes will lost!');
    }
    return true;
  }
}
