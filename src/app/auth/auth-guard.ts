import { CanActivateChildFn, Router } from '@angular/router';
import { AuthApi } from './auth-api';
import { inject } from '@angular/core';
import { map } from 'rxjs';

export const authGuard: CanActivateChildFn = (childRoute, state) => {
  const authApi = inject(AuthApi);
  const router = inject(Router);

  return authApi.isLoggedIn().pipe(
    map((isLogged) => {
      if (!isLogged) {
        router.navigate(['/']);
        return false;
      }
      return true;
    })
  )
};
