import { Component, Input } from '@angular/core';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-shared-files-panel',
  standalone: true,
  imports: [SidebarModule, ButtonModule, CardModule, CommonModule],
  templateUrl: './shared-files-panel.component.html',
  styleUrls: ['./shared-files-panel.component.scss']
})
export class SharedFilesPanelComponent {
  @Input() files: { name: string; url: string; id?: number }[] = [];
  
  visible: boolean = false;

  constructor(private router: Router) {}

  togglePanel() {
    this.visible = !this.visible;
  }

  openFile(file: { name: string; url: string; id?: number, postId?: string }) {
    if (file.postId) {
      this.router.navigate(['/post', file.postId]);
      this.visible = false;
    } else {
      window.open(file.url, '_blank');
    }
  }
}
