import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { Token } from '@angular/compiler';
import { TokenApiModel } from '../Models/token-api';
import { AuthenticationService } from '../Services/authentication.service';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {

  constructor(private auth: AuthenticationService,  private router: Router) {}
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
     const myToken = this.auth.getToken();
    if(myToken){
      request = request.clone({
        setHeaders: {Authorization:`Bearer ${myToken}`}  // "Bearer "+myToken
      });
    }
    return next.handle(request).pipe(
      catchError((err:any)=>{
        if(err instanceof HttpErrorResponse){
          if(err.status === 401){         
           //this.toast.warning('Token is expired, Please login again');
            //this.router.navigate(['login'])
            //handle
            return this.handleUnAuthorizedError(request,next);
          }
        }
        return throwError(()=> err)
      })
    );
  }
  handleUnAuthorizedError(req: HttpRequest<any>, next: HttpHandler){
  let tokeApiModel = new TokenApiModel();
  tokeApiModel.accessToken = this.auth.getToken()!;
  tokeApiModel.refreshToken = this.auth.getRefreshToken()!;
  return this.auth.renewToken(tokeApiModel)
  .pipe(
    switchMap((data:TokenApiModel)=>{
      this.auth.storeRefreshToken(data.refreshToken);
      this.auth.storeToken(data.accessToken);
      const clonedReq = req.clone({
        setHeaders: {Authorization:`Bearer ${data.accessToken}`}
      });
      return next.handle(clonedReq);
    }),
    catchError((err)=>{
      // this.toast.warning("Token is expired, Please Login again");
      this.router.navigate(['login']);
      return throwError(() => err);
    })
  )
}
}
