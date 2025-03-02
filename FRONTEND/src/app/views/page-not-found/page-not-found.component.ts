import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { trigger, transition, style, animate } from '@angular/animations';
import { ThemeToggleComponent } from '../../components/theme-toggle/theme-toggle.component';
import { CustomLoadingComponent } from '../../components/custom-loading/custom-loading.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-page-not-found',
  imports: [CommonModule, RouterModule, ToastModule, ButtonModule, ThemeToggleComponent, CustomLoadingComponent, TranslateModule],
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.scss',
  animations: [
    trigger('contentAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class PageNotFoundComponent {
  isLoading = false;

  constructor(private translate: TranslateService) {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }
}
