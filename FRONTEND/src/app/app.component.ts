import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import translationsEN from '../../public/i18n/en.json';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'EduNest';

  public currentLang = 'EN';
  
  constructor(private translate: TranslateService) {
    this.translate.setTranslation('en', translationsEN);
    
    this.translate.setDefaultLang('en');
  }
}
