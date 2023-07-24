import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { map, of, take } from 'rxjs';
import { PaginatedResult, Pagination } from '../_model/pagination';
import { UserParams } from '../_model/userParams';
import { Member } from '../_model/member';
import { User } from '../_model/user';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root',
})
export class MembersService {
  baseUrl = environment.apiUrl;
  pagination: Pagination | undefined;
  cacheMembers = new Map<string, PaginatedResult<Member[]>>();
  userParams: UserParams | undefined;
  user: User | undefined;
  constructor(
    private http: HttpClient,
    private accountService: AccountService
  ) {
    this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: (res) => {
        if (res) {
          this.user = res;
          this.userParams = new UserParams(this.user);
        }
      },
    });
  }
  getMembers(userParams: UserParams) {
    const membersCache = this.cacheMembers.get(
      Object.values(userParams).join('-')
    );
    if (membersCache) return of(membersCache);
    let params: HttpParams = this.getPaginationResultHeader(
      userParams.pageNumber,
      userParams.pageSize
    );

    params = params.append('maxAge', userParams.maxAge);
    params = params.append('minAge', userParams.minAge);
    params = params.append('gender', userParams.gender);
    params = params.append('orderBy', userParams.orderBy);
    return this.getPaginatedResult<Member[]>(
      this.baseUrl + 'users',
      params
    ).pipe(
      map((res) => {
        if (res.result) {
          this.cacheMembers.set(Object.values(userParams).join('-'), res);
        }
        return res;
      })
    );
  }

  getMemberByUserName(userName: string) {
    const memberMap = [...this.cacheMembers.values()];
    const member = memberMap
      .reduce((prev: Member[], current) => {
        if (current.result) {
          return prev.concat(current.result);
        }
        return prev;
      }, [])
      .find((u) => u.userName === userName);
    if (member) return of(member);
    return this.http.get<Member>(this.baseUrl + 'users/' + userName);
  }
  updateUser(user: Member) {
    return this.http.put(this.baseUrl + 'users', user);
  }
  setAvatar(idImg: number) {
    return this.http.put(this.baseUrl + 'users/set-avatar/' + idImg, {});
  }
  deletePhoto(idImg: number) {
    return this.http.delete(this.baseUrl + 'users/delete-photo/' + idImg);
  }
  getUserParams() {
    if (this.userParams) return this.userParams;
    return;
  }
  setUserParams(userParams: UserParams) {
    if (userParams) this.userParams = userParams;
  }
  resetUserParams() {
    if (this.user) {
      this.userParams = new UserParams(this.user);
      return this.userParams;
    }
    return;
  }

  private getPaginatedResult<T>(url: string, params: HttpParams) {
    let paginatedResult: PaginatedResult<T> = new PaginatedResult<T>();
    return this.http
      .get<T>(url, {
        observe: 'response',
        params,
      })
      .pipe(
        map((res) => {
          if (res.body) {
            paginatedResult.result = res.body;
          }
          const pagination = res.headers.get('Pagination');
          if (pagination) {
            paginatedResult.pagination = JSON.parse(pagination);
          }
          return paginatedResult;
        })
      );
  }

  private getPaginationResultHeader(pageNumber: number, itemsPerPage: number) {
    let params: HttpParams = new HttpParams();
    if (pageNumber && itemsPerPage) {
      params = params.append('pageNumber', pageNumber);
      params = params.append('pageSize', itemsPerPage);
    }
    return params;
  }
}
