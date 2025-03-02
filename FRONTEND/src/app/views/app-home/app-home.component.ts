import { Component, HostListener, OnInit } from '@angular/core';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SidebarStateService } from '../../services/sidebar-state.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-app-home',
  imports: [CommonModule, SidebarComponent, RouterModule, ToastModule],
  templateUrl: './app-home.component.html',
  styleUrl: './app-home.component.scss'
})
export class AppHomeComponent {
  postDate = new Date();

  isSidebarOpen: boolean = false;
  selectedWorkspaceId: string | null = null;
  isCourseCreationWizardActive: boolean = false;
  isAuthenticated: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private authService: AuthService,
    private themeService: ThemeService,
    private sidebarStateService: SidebarStateService
  ) {}

  ngOnInit(): void {
    this.authService.checkAuthStatus().subscribe((isAuthenticated) => {
      this.isAuthenticated = isAuthenticated;
    });
  }

  onSidebarStateChange(isOpen: boolean): void {
    this.isSidebarOpen = isOpen;
    this.sidebarStateService.setSidebarState(isOpen);
  }

  @HostListener('window:resize', ['$event'])
  adjustSidebarMode() {
    const isMobile = window.innerWidth <= 768;
    if (isMobile && this.isSidebarOpen) {
      this.isSidebarOpen = false;
    }
  }
}
