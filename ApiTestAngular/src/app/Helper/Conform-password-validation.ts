import { FormGroup } from "@angular/forms";

export function ConformPasswordValidater(controlName: string, matchingControlName: string) {
  return (formGroup: FormGroup) => {
    const passwordControl = formGroup.controls[controlName];
    const confirmPasswordControl = formGroup.controls[matchingControlName];
    if (confirmPasswordControl.errors && !confirmPasswordControl.errors['passwordMismatch']) {
      return;
    }
    if (passwordControl.value !== confirmPasswordControl.value) {
      confirmPasswordControl.setErrors({ passwordMismatch: true });
    } else {
      confirmPasswordControl.setErrors(null);
    }
  };
}