import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserStoreService {

private userName$ =new BehaviorSubject<string>("");
 private role$ =new BehaviorSubject<string>("");
 private image$ = new BehaviorSubject<string>("");

  constructor() { }
  
  public getimageFromStore(){
    return this.image$.asObservable();
  }

  public setimageFromStore(image:string){
    this.image$.next(image);
  }
   public getRoleFromStore(){
    return this.role$.asObservable();
  }

  public setRoleFromStore(role:string){
    this.role$.next(role);
  }

    public getFullNameFromStore(){
    return this.userName$.asObservable();
  }

  public setFullNameFromStore(userName:string){
    this.userName$.next(userName);
  }
}
