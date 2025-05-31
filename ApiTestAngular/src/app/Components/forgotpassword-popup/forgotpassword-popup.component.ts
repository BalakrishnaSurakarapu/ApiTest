import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ResetPassService } from 'src/app/Services/reset-pass.service';

@Component({
  selector: 'app-forgotpassword-popup',
  templateUrl: './forgotpassword-popup.component.html',
  styleUrls: ['./forgotpassword-popup.component.css'],
})
export class ForgotpasswordPopupComponent {
  @Output() close = new EventEmitter<void>();

  forgotpass!: FormGroup;
  public resetPasswordEmail!: string;
  isValidEmail = true;
  constructor(
    private fb: FormBuilder,
    private resetPassword: ResetPassService,
    private router: Router
  ) {
    this.forgotpass = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  checkValidEmail(email: string): boolean {
    const pattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,3}$/;
    this.isValidEmail = pattern.test(email);
    return this.isValidEmail;
  }
  onSubmit(): void {
    if (this.forgotpass.valid) {
      const email = this.forgotpass.get('email')?.value;
      if (this.checkValidEmail(email)) {
        this.resetPassword.sendResetPasswordLink(email).subscribe({
          next: (res: any) => {
            alert('Success: ' + res.message);
            this.forgotpass.reset();
            this.onClose(); // trigger close popup
            this.router.navigate(['/login']);
          },
          error: (err) => {
            console.error('Error details:', err);
            alert(
              'Error: ' + (err.error?.message || 'Failed to send reset link')
            );
          },
        });
      } else {
        alert('Invalid email format');
      }
    }
  }
  onClose() {
    this.close.emit();
  }
}
