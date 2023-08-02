import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  baseUrl = environment.apiUrl + 'admin/';
  constructor(private http: HttpClient) {}
  getUsersWithRoles() {
    return this.http.get<
      {
        id: string;
        userName: string;
        roles: string[];
      }[]
    >(this.baseUrl + 'users-with-roles');
  }
  updateUserRole(userName: string, roles: string[]) {
    return this.http.post<string[]>(this.baseUrl + 'edit-roles', {
      userName,
      roles,
    });
  }
}
