import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResetPassword } from '../Models/reset-password';

@Injectable({
  providedIn: 'root'
})
export class ResetPassService {

    private apiUrl = 'https://localhost:7262/api/Auth';
  constructor(private http: HttpClient) { }

  sendResetPasswordLink(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/ResetPassword?email=${encodeURIComponent(email)}`, {});
  }

  resetPasswordConfirm(data: ResetPassword): Observable<any> {
    return this.http.post<any>( `${this.apiUrl}/ResetPasswordConfirm`, data);
  }
}
