import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TestUser } from '../Models/user';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
private apiUrl = 'https://localhost:7262/api/Auth/';
  

  constructor(private http: HttpClient) {}

    register(userobj:any): Observable<any>{
    return this.http.post(`${this.apiUrl}register`,userobj);
  }
  login(loginobj:any): Observable<any>{
    return this.http.post(`${this.apiUrl}login`,loginobj)
  }
  getAllUsers(): Observable<TestUser[]> {debugger
    return this.http.get<TestUser[]>(`${this.apiUrl}All`);
  }
}
