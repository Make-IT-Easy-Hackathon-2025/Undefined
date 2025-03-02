import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError, first } from 'rxjs/operators';
import { AuthService } from './../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class OnboardingGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.getUserInfo().pipe(
      map((user) => {
        if (user && user.firstname && user.firstname.trim() !== '') {
          // User has a fullName, allow access to the dashboard
          return true;
        } else {
          // User does not have a fullName, redirect to onboarding
          this.router.navigate(['/onboarding']);
          return false;
        }
      }),
      catchError((error) => {
        console.error('Error fetching user info:', error);
        // Redirect to onboarding in case of an error
        this.router.navigate(['login'], { queryParams: { returnUrl: state.url } });
        return of(false);
      }),
      first() // Ensure the observable completes after the first emission
    );
  }
}
