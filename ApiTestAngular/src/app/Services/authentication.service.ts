import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { TokenApiModel } from '../Models/token-api';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private apiUrl = 'http://localhost:7262/api/Auth'; 
  private jwtHelper = new JwtHelperService();
  private decodedTokenCache: any = null;  // cache decoded token

  constructor(private http: HttpClient, private router: Router) {}

  // Token methods
  storeToken(token: string) {
    localStorage.setItem('token', token);
    this.decodedTokenCache = null; // reset cache when token changes
  }

  storeRefreshToken(refreshToken: string) {
    localStorage.setItem('refreshToken', refreshToken);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Decode once, then cache the result
   decodeToken(): any {
    if (!this.decodedTokenCache) {
      const token = this.getToken();
      this.decodedTokenCache = token ? this.jwtHelper.decodeToken(token) : null;
    }
    return this.decodedTokenCache;
  }

  getFullNameFromToken(): string {
    const decoded = this.decodeToken();
    return decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || decoded?.name || '';
  }

  getRoleFromToken(): string {
    const decoded = this.decodeToken();
    return decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded?.role || '';
  }

  getImageFromToken(): string {
    const decoded = this.decodeToken();
    return decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/imageUrl"] || decoded?.imageUrl || '';
  }

  
  renewToken(tokenApi: TokenApiModel) {
    return this.http.post<any>(`${this.apiUrl}/Refresh`, tokenApi).pipe(
      tap((data :any)=> {
        this.storeToken(data.accessToken);
        this.storeRefreshToken(data.refreshToken);
      })
    );
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    return token ? this.jwtHelper.isTokenExpired(token) : true;
  }

  signOut() {
    localStorage.removeItem('token');
     localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    this.decodedTokenCache = null;
    this.router.navigate(['login']);
  }
}
