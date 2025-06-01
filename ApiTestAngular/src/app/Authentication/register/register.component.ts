import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import ValidateForm from 'src/app/Helper/ValidationForm';
import { ApiService } from 'src/app/Services/api.service';
import { AuthenticationService } from 'src/app/Services/authentication.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  signupForm: FormGroup;
  type: string = 'password';
  isText: boolean = false;
  eyeIcone: string = 'fa-eye-slash';
  imagePreview: string | ArrayBuffer | null = '';
  userId: number = 0;

  roleOptions = [
    { id: 1, name: 'Admin' },
    { id: 2, name: 'User' },
    { id: 3, name: 'Manager' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private router: Router,
    private http: HttpClient,
    private api: ApiService,
    private route: ActivatedRoute 
  ) {
    this.signupForm = this.fb.group({}); 
  }

  ngOnInit(): void {
  this.initForm();
  const paramId = this.route.snapshot.paramMap.get('id');
  this.userId = paramId ? +paramId : 0;

if (this.userId) {
  this.api.getUserById(this.userId).subscribe(user => {
    const roleId = this.roleOptions.find(r => r.name === user.role)?.id;

    this.signupForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      userName: user.userName,
      mobileNo: user.mobileNo,
      emailId: user.emailId,
      password: user.password,
      role: roleId,
      imageUrl: user.imageUrl
    });

    this.imagePreview = user.imageUrl;
    this.signupForm.get('imageUrl')?.setValue(user.imageUrl);
  });
}
}
 initForm(): void {
  this.signupForm = this.fb.group({
    firstName: ['', Validators.required],
  lastName: ['', Validators.required],
  userName: ['', Validators.required],
  mobileNo: ['', Validators.required],
  emailId: ['', [ Validators.required,
    Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]],
  password: ['', Validators.required],
  role: ['', Validators.required],
  imageUrl: ['']
  });
}

  get role() {
    return this.signupForm.get('role');
  }

  hideshow(): void {
    this.isText = !this.isText;
    this.eyeIcone = this.isText ? "fa-eye" : "fa-eye-slash";
    this.type = this.isText ? "text" : "password";
  }

 onSubmit(): void {
  if (this.signupForm.valid) {debugger
    const selectedRoleId = this.signupForm.value.role;
    const selectedRole = this.roleOptions.find(r => r.id === +selectedRoleId);

    const formData = {
      ...this.signupForm.value,
      role: selectedRole?.name || '',
      token: ''
    };

    if (this.userId > 0) {debugger
      this.api.updateUser(this.userId, formData).subscribe(() => {
        alert('User updated successfully');
        this.router.navigate(['/dashboard']);
      });
    } else {
      this.api.register(formData).subscribe({
        next: (res) => {
          alert(res.message);
          this.signupForm.reset();
          this.router.navigate(['/login']);
        },
        error: (err) => {
          alert(err?.error?.message || 'Registration failed');
        }
      });
    }
  } else {
    ValidateForm.validateAllFormFields(this.signupForm);
  }
}
  onImageUrlChange(): void {
    const url = this.signupForm.get('imageUrl')?.value;
    this.imagePreview = url;
  }

 onFileSelected(event: Event): void {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    this.imagePreview = reader.result;
    this.signupForm.patchValue({ imageUrl: reader.result }); // base64
  };
  reader.readAsDataURL(file);
}

  removeImage(): void {
  this.imagePreview = null;
  this.signupForm.get('imageUrl')?.reset();
}

 Reset(): void {
  if (this.userId > 0) {
    this.router.navigate(['/dashboard']);
  } else {
    this.signupForm.reset();
    this.imagePreview = null;
  }
}
}