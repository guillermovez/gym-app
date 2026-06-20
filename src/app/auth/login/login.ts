import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthApi } from '../auth-api';
import { Router } from '@angular/router';

type ButtonState = 'idle' | 'loading' | 'disabled';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  private readonly authApi = inject(AuthApi);
  private route = inject(Router);

  private readonly formStatus = toSignal(this.loginForm.statusChanges, {
    initialValue: this.loginForm.status,
  });

  private readonly _buttonState = signal<ButtonState>('idle');

  readonly errorMessage = signal<string | null>(null);

  readonly buttonState = computed<ButtonState>(() => {
    if (this.formStatus() === 'INVALID') return 'disabled';
    return this._buttonState();
  });

  readonly buttonIsDisabled = computed<boolean>(() => {
    return this._buttonState() === 'disabled' || this._buttonState() === 'loading';
  });

  readonly buttonClasses = computed(() => {
    switch (this.buttonState()) {
      case 'loading':
        return 'bg-primary text-white opacity-75 cursor-progress';
      case 'disabled':
        return 'bg-primary text-white opacity-50 cursor-not-allowed';
      default:
        return 'bg-primary text-white opacity-100 cursor-pointer';
    }
  });

  async onSubmit() {
    if (this.loginForm.invalid) return;

    this._buttonState.set('loading');
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.value;

    this.authApi.login(email!, password!)
    .subscribe({
      next: (response: any) => {
        this._buttonState.set('idle');
        this.route.navigate(['/app/dashboard']);
      },
      error: (error: any) => {
        this._buttonState.set('idle');
        if (error.status === 401 || error.status === 403) {
          console.log(error);
          this.errorMessage.set('El correo electrónico o la contraseña son incorrectos.');
        } else {
          this.errorMessage.set(
            'No se pudo establecer conexión con el servidor principal.',
          );
        }
      },
    });
  }

  isFieldInvalid(fieldName: string) {
    const field = this.loginForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }
}
