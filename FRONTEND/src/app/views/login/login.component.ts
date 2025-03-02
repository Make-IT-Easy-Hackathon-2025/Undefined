import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastModule } from 'primeng/toast';
import { ThemeToggleComponent } from '../../components/theme-toggle/theme-toggle.component';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    MessageModule,
    ToastModule,
    ThemeToggleComponent,
    TranslateModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers: [MessageService]
})
export class LoginComponent {
  isLogin = true;
  loading = false;
  authForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  toggleMode() {
    this.isLogin = !this.isLogin;
    // if (!this.isLogin) {
    //   this.authForm.get('name')?.setValidators([Validators.required]);
    // } else {
    //   this.authForm.get('name')?.clearValidators();
    // }
    // this.authForm.get('name')?.updateValueAndValidity();
    this.authForm.reset();
  }

  onSubmit() {
    if (this.authForm.valid) {
      this.loading = true;
      const { email, password} = this.authForm.value;

      const authAction = this.isLogin
        ? this.authService.login(email, password)
        : this.authService.register(email, password);

      authAction.subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: response.user
          });
          this.authForm.reset();
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error.message || 'An error occurred'
          });
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill all required fields correctly'
      });
    }
  }

  signInWithGoogle(): void {
    // this.authService.signInWithGoogle();
  }

  signInWithApple() {
    // Implement Apple sign-in
    console.log('Apple sign-in');
  }
}
