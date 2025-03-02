import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import Material from '@primeng/themes/material';
import Nora from '@primeng/themes/nora';
import { routes } from './app.routes';
import { definePreset } from '@primeng/themes';
import Lara from '@primeng/themes/lara';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MERMAID_OPTIONS, provideMarkdown } from 'ngx-markdown';

const httpLoaderFactory: (http: HttpClient) => TranslateHttpLoader = (
  http: HttpClient
) => new TranslateHttpLoader(http, './i18n/', '.json');

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#f5f3ff',  // Lightest Violet
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#7c3aed',  // Default Violet
      600: '#6d28d9',
      700: '#5b21b6',
      800: '#4c1d95',
      900: '#3a0d75',  // Darkest Violet
      950: '#290f59'   // Deepest Violet
    }
  }
});

export const appConfig: ApplicationConfig = {
  providers: [
    MessageService,
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(),
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: MyPreset,
        options: {
          darkModeSelector: '.my-app-dark',
        }
      },
      ripple: true
    }),
    provideTranslateService({
      loader: {
        provide: TranslateLoader,
        useFactory: () => httpLoaderFactory,
        deps: [HttpClient],
      }
    }),
    provideMarkdown({
      mermaidOptions: {
        provide: MERMAID_OPTIONS,
        useValue: {
          darkMode: true,
          look: 'handDrawn',
        },
      },
    }), 
    // provideServiceWorker('ngsw-worker.js', {
    //         enabled: !isDevMode(),
    //         registrationStrategy: 'registerWhenStable:30000'
    //       }),
  ]
};
