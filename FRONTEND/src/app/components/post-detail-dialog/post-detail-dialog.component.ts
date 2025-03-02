import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { FormsModule } from '@angular/forms';
import { animate, style, transition, trigger } from '@angular/animations';
import { PostComponent } from '../post/post.component';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';
import { UserService } from '../../services/user.service';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-post-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    TextareaModule,
    ButtonModule,
    AvatarModule,
    DividerModule,
    FormsModule,
    PostComponent
  ],
  templateUrl: './post-detail-dialog.component.html',
  styleUrls: ['./post-detail-dialog.component.scss'],
  animations: [
    trigger('dialogAnimation', [
      transition(':enter', [
        style({ transform: 'scale(0.7)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'scale(0.7)', opacity: 0 }))
      ])
    ])
  ]
})
export class PostDetailDialogComponent implements OnInit {
  @Input() post!: any;
  @Output() close = new EventEmitter<void>();
  MAIN_ENDPOINT_URL = environment.MAIN_ENDPOINT_URL;

  isLoading: boolean = true;

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userService.addToRecentItems(this.post);
  }

  onClose(): void {
    this.close.emit();
  }
}
