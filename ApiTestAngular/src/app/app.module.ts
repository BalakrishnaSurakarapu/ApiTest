import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JwtModule } from '@auth0/angular-jwt';
import { LoginComponent } from './Authentication/login/login.component';
import { RegisterComponent } from './Authentication/register/register.component';
import { ResetPasswordComponent } from './Authentication/reset-password/reset-password.component';
import { ForgotpasswordPopupComponent } from './Components/forgotpassword-popup/forgotpassword-popup.component';
import { DashboardComponent } from './Components/dashboard/dashboard.component';
import { AuthTokenInterceptor } from './Intercepters/auth-token.interceptor';
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ResetPasswordComponent,
    ForgotpasswordPopupComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule, 
    HttpClientModule,
    JwtModule
    ],
providers: [
  // {
  //   provide: HTTP_INTERCEPTORS,
  //   useClass: AuthTokenInterceptor,
  //   multi: true
  // }
],
  bootstrap: [AppComponent]
})
export class AppModule { }
