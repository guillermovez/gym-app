import { Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

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

  private readonly formStatus = toSignal(this.loginForm.statusChanges, {
    initialValue: this.loginForm.status,
  });

  private readonly _buttonState = signal<ButtonState>('idle');

  readonly buttonState = computed<ButtonState>(() => {
    if (this.formStatus() === 'INVALID') return 'disabled';
    return this._buttonState();
  });

  readonly buttonIsDisabled = computed<boolean>(() => {
    if (this._buttonState() === 'disabled' || this._buttonState() === 'loading') return true;
    return false;
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

    try {
      // TODO: Implement authtentication service to api rest
      await new Promise((r) => setTimeout(r, 2000));
    } finally {
      this._buttonState.set('idle');
    }
    console.log(this.loginForm.value);
  }

  isFieldInvalid(fieldName: string) {
    const field = this.loginForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }
}
