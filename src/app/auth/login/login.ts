import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginApi } from './login-api';

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
    //HACK: regresar al minglength de 6 en producción
    password: new FormControl('', [Validators.required, Validators.minLength(4)]),
  });

  private readonly loginApi = inject(LoginApi);

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

    this.loginApi.login(email!, password!)
    .subscribe({
      next: (response: any) => {
        this._buttonState.set('idle');
        //HACK: borrar el log
        console.log('Login successful:', response);
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
