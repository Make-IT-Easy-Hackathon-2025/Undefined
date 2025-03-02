import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly darkModeClass = 'my-app-dark';
  private readonly themeKey = 'theme-preference';
  private isDarkModeSubject = new BehaviorSubject<boolean>(false);

  isDarkMode$ = this.isDarkModeSubject.asObservable();

  constructor() {
    const savedTheme = localStorage.getItem(this.themeKey);
    if (savedTheme === 'dark') {
      this.enableDarkMode();
    } else if (savedTheme === 'light') {
      this.disableDarkMode();
    } else {
      this.setSystemPreference();
    }
  }

  toggleDarkMode() {
    const element = document.querySelector('html');
    if (element?.classList.contains(this.darkModeClass)) {
      this.disableDarkMode();
    } else {
      this.enableDarkMode();
    }
  }

  private enableDarkMode() {
    const element = document.querySelector('html');
    element?.classList.add(this.darkModeClass);
    localStorage.setItem(this.themeKey, 'dark');
    this.isDarkModeSubject.next(true);
  }

  private disableDarkMode() {
    const element = document.querySelector('html');
    element?.classList.remove(this.darkModeClass);
    localStorage.setItem(this.themeKey, 'light');
    this.isDarkModeSubject.next(false);
  }

  private setSystemPreference() {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.enableDarkMode();
    } else {
      this.disableDarkMode();
    }
  }
}