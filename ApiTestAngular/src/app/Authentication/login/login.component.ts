import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/Services/api.service';
import { AuthenticationService } from 'src/app/Services/authentication.service';
import { ResetPassService } from 'src/app/Services/reset-pass.service';
import { UserStoreService } from 'src/app/Services/user-store.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
loginForm: FormGroup;
 type:string='password';
  isText:boolean=false;
  eyeIcone:string='fa-eye-slash'
  submitted = false;
  public resetPasswordEmail!:string;
  public isValidEmail!:boolean;

  constructor(private fb: FormBuilder, private authService: AuthenticationService,private router: Router,private http:HttpClient,private api: ApiService,//private toast: NgToastService,
    private resetpassword:ResetPassService,
    private userstore:UserStoreService) {
    this.loginForm = this.fb.group({
      //emailId: ['', [Validators.required, Validators.email]],
      userName:['',Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
//     this.resetPasswordForm = this.fb.group({
//      emailId: ['', [Validators.required, Validators.email]]
// });
  }
  
  ngOnInit(): void {
  
  }
  get f() { return this.loginForm.controls; }

  hideshow(){
    this.isText=!this.isText;
    this.isText?this.eyeIcone="fa-eye":this.eyeIcone="fa-eye-slash";
    this.isText? this.type="text":this.type="password";
  }
  login() {debugger
  if (this.loginForm.valid) {
    this.api.login(this.loginForm.value).subscribe({
      next: (res:any) => {
        alert("login success");
      // this.toast.success('Registration complete');
        this.loginForm.reset();
        this.authService.storeToken(res.accessToken);
        this.authService.storeRefreshToken(res.refreshToken)
        let tokenPayload =this.authService.decodeToken();
        this.userstore.setFullNameFromStore(tokenPayload.name);
        this.userstore.setRoleFromStore(tokenPayload.role);
        this.userstore.setimageFromStore(tokenPayload.imageUrl);
        //alert(login success);
    //  this.toast.success('Registration complete');
        this.router.navigate(['/dashboard']);
      },
      error: (err:any) => {
        alert('login failed');
    //this.toast.success('Registration complete');

        // this.toastr.error({detail: 'Login failure!', summary: 'Something went wrong', duration: 5000});
        console.error('Login error:', err); // Log error for debugging
      }
    });
  }
}

ConformToSend(): void {
  if (this.checkValidEmail(this.resetPasswordEmail)) {
    this.resetpassword.sendResetPasswordLink(this.resetPasswordEmail).subscribe({
      next: (res: any) => {
        alert('Success');
        alert(res.message);
        console.log('Sending reset link to:', res);
       // this.resetPasswordForm.reset();
        const buttonRef = document.getElementById('closeBtn');
        buttonRef?.click();
      },
      error: (err) => {
        console.error('Error sending reset link:', err);
        alert('Error sending reset link');
      }
    });
  }
}
checkValidEmail(event: string): boolean {
  const pattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,3}$/;
  this.isValidEmail = pattern.test(event);
  return this.isValidEmail;
}

 showModal = false;

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }
}
