import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ResetPassword } from 'src/app/Models/reset-password';
import { ResetPassService } from 'src/app/Services/reset-pass.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
resetpasswordForm!: FormGroup;
  emailToReset!: string;
  emailToken!: string;

  toggleField: { [key: string]: boolean } = {
    password: false,
    confirmPassword: false
  };

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private resetPassService: ResetPassService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.emailToReset = params['email'];
      this.emailToken = params['token'];
    });
      this.resetpasswordForm = this.fb.group({
        password: ['', [Validators.required, Validators.minLength(6),Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/)]],
        confirmPassword: ['', [Validators.required]]
      }, {
        validators: this.passwordMatchValidator,
        updateOn: 'change'
      });
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const { password, confirmPassword } = formGroup.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  getType(field: string): string {
    return this.toggleField[field] ? 'text' : 'password';
  }

  toggleVisibility(field: string): void {
    this.toggleField[field] = !this.toggleField[field];
  }

  onSubmit(): void {
    if (this.resetpasswordForm.invalid) {
      this.resetpasswordForm.markAllAsTouched();
      return;
    }

    const { password, confirmPassword } = this.resetpasswordForm.value;
    const resetObj: ResetPassword = {
      email: this.emailToReset,
      newPassword: password,
      conformPassword: confirmPassword,
      emailToken: this.emailToken
    };

    this.resetPassService.resetPasswordConfirm(resetObj).subscribe({
      next: res => {
        alert('Password reset successful');
        console.log('Response:', res);
      },
      error: err => {
        console.error('Error:', err);
        alert(err?.error?.message || 'Password reset failed. Please try again.');
      }
    });
  }

  // Helpers
  get password() {
    return this.resetpasswordForm.get('password');
  }

  get confirmPassword() {
    return this.resetpasswordForm.get('confirmPassword');
  }
  Reset(){
    this.resetpasswordForm.reset();
  }
}
