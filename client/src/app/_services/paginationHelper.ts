import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs';
import { PaginatedResult } from '../_model/pagination';

export function getPaginatedResult<T>(
  url: string,
  params: HttpParams,
  http: HttpClient
) {
  let paginatedResult: PaginatedResult<T> = new PaginatedResult<T>();
  return http
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

export function getPaginationResultHeader(
  pageNumber: number,
  itemsPerPage: number
) {
  let params: HttpParams = new HttpParams();
  if (pageNumber && itemsPerPage) {
    params = params.append('pageNumber', pageNumber);
    params = params.append('pageSize', itemsPerPage);
  }
  return params;
}
