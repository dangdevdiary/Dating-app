import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router, private toast: ToastrService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err) {
          switch (err.status) {
            case 400:
              const errs = err.error?.errors;
              if (errs) {
                const modelStackErr = [];
                for (let key in errs) {
                  modelStackErr.push(errs[key]);
                }
                throw modelStackErr;
              } else {
                this.toast.error(err.error, err.status.toString());
              }
              break;
            case 401:
              this.toast.error('You are not log in', err.status.toString());
              break;
            case 404:
              this.router.navigateByUrl('/not-found');
              break;
            case 500:
              this.router.navigateByUrl('/server-err', {
                state: {
                  error: err.error,
                },
              });
              break;
            default:
              console.log(err);
              this.toast.error('Something unexpected went wrong!');
          }
        }
        throw err;
      })
    );
  }
}
