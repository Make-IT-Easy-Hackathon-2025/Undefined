import { Component } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-theme-toggle',
  imports: [ButtonModule, CommonModule],
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.scss'
})
export class ThemeToggleComponent {
  darkModeIcon = 'pi-moon';
  darkModeText = 'Dark';

  constructor(private themeService: ThemeService) {
    this.themeService.isDarkMode$.subscribe(isDarkMode => {
      this.darkModeIcon = isDarkMode ? 'pi pi-sun' : 'pi pi-moon';
      this.darkModeText = isDarkMode ? 'Light' : 'Dark';
    });
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }
}