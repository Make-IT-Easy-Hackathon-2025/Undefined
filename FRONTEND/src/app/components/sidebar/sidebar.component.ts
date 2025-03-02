import { Component, ElementRef, EventEmitter, HostListener, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MenuItem, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Router, RouterModule } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { AvatarModule } from 'primeng/avatar';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { AuthService } from '../../services/auth.service';
import { WorkspaceService } from '../../services/workspace.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { Subscription } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageSelectorComponent } from '../language-selector/language-selector.component';
import { SkeletonModule } from 'primeng/skeleton';
import { SettingsComponent } from '../settings/settings.component';
import { UserService } from '../../services/user.service';
import { environment } from '../../../environments/environment';
import { SidebarStateService } from '../../services/sidebar-state.service';
import { SubjectService } from '../../services/subject.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, SkeletonModule, InputTextModule, RouterModule, TranslateModule, TextareaModule, DrawerModule, ButtonModule, ThemeToggleComponent, SplitButtonModule, AvatarModule, SidebarModule, DialogModule, ToastModule, ReactiveFormsModule, FormsModule, SettingsComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  providers: [MessageService]
})
export class SidebarComponent implements OnInit, OnDestroy {
  MAIN_ENDPOINT_URL = environment.MAIN_ENDPOINT_URL;
  @Output() sidebarStateChange = new EventEmitter<boolean>();
  @Output() workspaceSelected = new EventEmitter<string>();
  workspaceDeletedSubscription: Subscription | undefined;

  drawerVisible: boolean = true;
  alwaysOpen: boolean = true;
  protected userInfo: any;
  isMobile: boolean = false;
  collection: any[] = [];
  recentItems: any[] = [];

  workspaceForm: FormGroup | any;
  isSubmitting = false;
  isDialogVisible = false;
  isOpen = true;

  @ViewChild('settingsDialog') settingsDialog!: SettingsComponent;

  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private sidebarState: SidebarStateService,
    private userService: UserService,
    private router: Router,
    private elementRef: ElementRef,
    private subjectService: SubjectService,
    private translate: TranslateService) {
    this.workspaceForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.maxLength(200)]]
    });

    this.sidebarState.sidebarOpen$.subscribe(open => {
      this.isOpen = open;
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.authService.getUserInfo().subscribe(user => {
        this.userInfo = user;
      }, error => {
        console.error('Error fetching user info:', error);
      });
    }, 300);

    this.loadWorkspaces();

    this.isMobile = window.innerWidth <= 768; window.innerWidth <= 768
    if (this.isMobile) {
      this.alwaysOpen = false;
      this.drawerVisible = false;
    } else {
      this.sidebarStateChange.emit(this.alwaysOpen);
    }
  }

  ngOnDestroy(): void {
    if (this.workspaceDeletedSubscription) {
      this.workspaceDeletedSubscription.unsubscribe();
    }
  }

  loadWorkspaces(): void {
    this.userService.getCollection().subscribe((collection) => {
      this.collection = (collection as any[]).slice(0, 3);
    });
    this.recentItems = this.userService.getRecentItems();
    this.userService.recentsUpdated.subscribe((items) => {
      this.recentItems = items;
    });
    this.subjectService.updateFollows.subscribe(() => {
      this.userService.getCollection().subscribe((collection) => {
        this.collection = (collection as any[]).slice(0, 3);
      });
    });
  }

  selectWorkspace(workspaceId: string): void {
    localStorage.setItem('selectedWorkspaceId', workspaceId);
    this.workspaceSelected.emit(workspaceId);

    this.onNavigate('workspace-home');
  }

  openCreateWorkspaceDialog(): void {
    this.isDialogVisible = true;
  }

  toggleSidebarMode() {
    this.alwaysOpen = !this.alwaysOpen;

    this.sidebarStateChange.emit(this.alwaysOpen);
    if (!this.alwaysOpen) {
      this.drawerVisible = false;
    }
  }

  onNavigate(route: string): void {
    this.drawerVisible = this.alwaysOpen;

    if (route === 'todo-list') {
      this.router.navigate([`/workspace/${localStorage.getItem('selectedWorkspaceId')}/to-do`]);
      return;
    }

    if (route === 'settings') {
      this.settingsDialog.open();
      return;
    }
  }

  // Ensure drawer doesn't close in always-open mode
  onDrawerHide() {
    if (this.alwaysOpen) {
      this.drawerVisible = true;
    }
  }

  // Mobile Sidebar Toggle (without emitting state change event)
  toggleSidebarModeMobile() {
    this.drawerVisible = !this.drawerVisible;
  }

  // Auto-show sidebar when near the left edge (Only for desktop)
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.alwaysOpen && window.innerWidth >= 768) {
      if (event.clientX <= 50) {
        this.drawerVisible = true;
      } else if (event.clientX > 300) {
        this.drawerVisible = false;
      }
    }
  }

  // Adjust the sidebar mode based on window size
  @HostListener('window:resize', ['$event'])
  adjustSidebarMode() {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      this.alwaysOpen = false;
      this.drawerVisible = false;
    } else {
      this.alwaysOpen = true;
      this.drawerVisible = true;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Only handle clicks when on mobile and drawer is visible
    if (this.isMobile && this.drawerVisible) {
      const clickedInside = this.elementRef.nativeElement.querySelector('.custom-drawer').contains(event.target);
      const clickedToggleButton = this.elementRef.nativeElement.querySelector('.mobile-toggle-btn').contains(event.target);

      // Close drawer if click was outside drawer and not on toggle button
      if (!clickedInside && !clickedToggleButton) {
        this.drawerVisible = false;
      }
    }
  }

  // Prevent drawer from closing when clicking inside it
  @HostListener('click', ['$event'])
  onClick(event: Event) {
    event.stopPropagation();
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.drawerVisible = false;
      this.router.navigate(['/login']);
    });
  }

}
