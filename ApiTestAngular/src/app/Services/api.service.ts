import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TestUser } from '../Models/user';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'https://localhost:7262/api/Auth/';

  constructor(private http: HttpClient) {}

  register(userobj: any): Observable<any> {
    return this.http.post(`${this.apiUrl}register`, userobj);
  }
  login(loginobj: any): Observable<any> {
    return this.http.post(`${this.apiUrl}login`, loginobj);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}`);
  }
  getAllUsers(): Observable<any[]> {
    return this.http.get<TestUser[]>(`${this.apiUrl}All`);
  }

  getUserById(id: number): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}${id}`);
  }
  updateUser(id: number,data: any): Observable<any> {
    return this.http.put<any[]>(`${this.apiUrl}${id}`, data);
  }
}
