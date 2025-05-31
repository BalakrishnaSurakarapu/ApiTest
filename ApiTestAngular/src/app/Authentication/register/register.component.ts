import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import ValidateForm from 'src/app/Helper/ValidationForm';
import { ApiService } from 'src/app/Services/api.service';
import { AuthenticationService } from 'src/app/Services/authentication.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  signupForm: FormGroup;
type:string='password';
  isText:boolean=false;
  eyeIcone:string='fa-eye-slash'
   imagePreview: string | ArrayBuffer | null = '';
roleOptions = [
  { id: 1, name: 'Admin' },
  { id: 2, name: 'User' },
  { id: 3, name: 'Manager' }
];
  constructor(private fb: FormBuilder, private authService: AuthenticationService,private router:Router,private http:HttpClient,private api: ApiService) {
    this.signupForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName:['',Validators.required],
      userName:['',Validators.required],
      mobileNo: ['',Validators.required],     
      EmailId: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['', Validators.required],
      imageUrl: [''],
    });
  }
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
get role() {
  return this.signupForm.get('role');
}
    hideshow(){
      this.isText=!this.isText;
      this.isText?this.eyeIcone="fa-eye":this.eyeIcone="fa-eye-slash";
      this.isText? this.type="text":this.type="password";
  }
onSubmit() {debugger
  if (this.signupForm.valid) {
   const selectedRoleId = this.signupForm.value.role;
    const selectedRole = this.roleOptions.find(r => r.id === +selectedRoleId);

    let signUpObj = {
      ...this.signupForm.value,
      role: selectedRole?.name || '',
      token: ''
    };
    this.api.register(signUpObj).subscribe({
      next: (res => {
        console.log(res.message);
        this.signupForm.reset();
        alert(res.message);
        this.router.navigate(['/login']);
      }),
      error: (err => {
        alert(err?.error.message);
      })
    });
  } else {
    ValidateForm.validateAllFormFields(this.signupForm);
  }
}
 onImageUrlChange() {
    const url = this.signupForm.get('imageUrl')?.value;
    this.imagePreview = url;
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
      this.signupForm.patchValue({ imageUrl: reader.result }); // base64 image
    };
    reader.readAsDataURL(file);
  }
  
removeImage() {
  this.imagePreview = null;
  this.signupForm.get('imageFile')?.reset(); // clear the form control
}
}