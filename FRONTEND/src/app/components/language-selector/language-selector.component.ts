import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-language-selector',
  imports: [CommonModule, DropdownModule, FormsModule, SelectModule],
  templateUrl: './language-selector.component.html',
  styleUrl: './language-selector.component.scss'
})
export class LanguageSelectorComponent {
  selectedLanguage: string = 'en';
  languages = [
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'gr', name: 'Ελληνικά', flag: '🇬🇷' },
    { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
    { code: 'in', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'ro', name: 'Română', flag: '🇷🇴' }
  ];

  constructor(private translate: TranslateService) { }

  ngOnInit(): void {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      this.selectedLanguage = savedLanguage;
      this.translate.use(savedLanguage);
    } else {
      const browserLang = this.translate.getBrowserLang();
      const defaultLang = this.languages.find(lang => lang.code === browserLang)
        ? browserLang
        : 'en';

      if (defaultLang) {
        this.setLanguage(defaultLang);
      }      
    }
  }

  setLanguage(lang: string): void {
    this.selectedLanguage = lang;
    this.translate.use(lang);
    localStorage.setItem('language', lang);
  }
}
