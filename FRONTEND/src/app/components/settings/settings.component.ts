import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TabViewModule } from 'primeng/tabview';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-settings',
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    TabViewModule,
    InputTextModule,
    CardModule,
    DividerModule,
    ToggleButtonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  visible = false;
  userInfo: any = {};
  preferences = {
    emailNotifications: true,
    soundEffects: true
  };
  isSaving = false;

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.loadUserInfo();
    this.loadPreferences();
  }

  loadUserInfo() {
    this.authService.getUserInfo().subscribe(
      user => this.userInfo = user,
      error => console.error('Error loading user info:', error)
    );
  }

  loadPreferences() {
    // Load preferences from your service
  }

  saveGeneralSettings() {
    this.isSaving = true;
    // Implement save logic
    setTimeout(() => this.isSaving = false, 1000);
  }

  savePreferences() {
    this.isSaving = true;
    // Implement save logic
    setTimeout(() => this.isSaving = false, 1000);
  }

  onClose() {
    this.visible = false;
  }

  open() {
    this.visible = true;
  }

}
