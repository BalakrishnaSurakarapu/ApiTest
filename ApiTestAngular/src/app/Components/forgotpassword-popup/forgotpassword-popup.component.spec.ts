import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotpasswordPopupComponent } from './forgotpassword-popup.component';

describe('ForgotpasswordPopupComponent', () => {
  let component: ForgotpasswordPopupComponent;
  let fixture: ComponentFixture<ForgotpasswordPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ForgotpasswordPopupComponent]
    });
    fixture = TestBed.createComponent(ForgotpasswordPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
