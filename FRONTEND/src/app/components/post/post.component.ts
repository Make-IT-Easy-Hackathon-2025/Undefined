import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { TextareaModule } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { MessageService } from 'primeng/api';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LikesService } from '../../services/likes.service';
import { PostService } from '../../services/post.service';
import { SidebarStateService } from '../../services/sidebar-state.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [
    CommonModule,
    MarkdownModule,
    CardModule,
    AvatarModule,
    ButtonModule,
    TooltipModule,
    TagModule,
    DividerModule,
    RouterLink,
    TextareaModule,
    FormsModule,
  ],
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss'],
})
export class PostComponent {
  @Input() id!: string;
  @Input() user!: { firstname: string; lastname: string; avatar_url?: string };
  @Input() title!: string;
  @Input() subject!: { subject: string; id: string };
  @Input() content!: string;
  @Input() postDate!: Date;
  @Input() comments!: any[];
  @Input() files?: { id: number; filename: string; url: string }[];
  @Input() likeCount: number = 0;
  @Input() dislikeCount: number = 0;
  @Input() commentCount: number = 0;
  @Input() hideActions: boolean = false;
  @Input() showDetails: boolean = false;

  // Use getters/setters for like/dislike state so that local state is updated when inputs change
  private _likedByCurrentUser: boolean = false;
  @Input()
  set likedByCurrentUser(value: boolean) {
    this._likedByCurrentUser = value;
    this.userLiked = !!value;
  }
  get likedByCurrentUser(): boolean {
    return this._likedByCurrentUser;
  }

  private _dislikedByCurrentUser: boolean = false;
  @Input()
  set dislikedByCurrentUser(value: boolean) {
    this._dislikedByCurrentUser = value;
    this.userDisliked = !!value;
  }
  get dislikedByCurrentUser(): boolean {
    return this._dislikedByCurrentUser;
  }

  maxVisibleFiles = 3;
  isMobile: boolean = window.innerWidth <= 600;
  showDetailDialog: boolean = false;

  MAIN_ENDPOINT_URL = environment.MAIN_ENDPOINT_URL;

  newComment: string = '';
  // Local state that controls icon fill
  userLiked: boolean = false;
  userDisliked: boolean = false;
  likeId: number | null = null;
  dislikeId: number | null = null;

  loggedInUser: any = null;

  constructor(
    private messageService: MessageService,
    private authService: AuthService,
    private likesService: LikesService,
    private postService: PostService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.userLiked = this.likedByCurrentUser;
    this.userDisliked = this.dislikedByCurrentUser;
    this.loadLoggedInUser();
  }

  loadLoggedInUser(): void {
    if (!this.showDetails) return;
    this.authService.getUserInfo().subscribe({
      next: (user) => {
        this.loggedInUser = user;
      },
      error: (error) => {
        console.error('Error loading user info:', error);
      },
    });
  }

  loadPostComments(): void {
    this.postService.getPostById(this.id).subscribe({
      next: (response) => {
        const data =
          Array.isArray(response) && response.length ? response[0] : {};
        this.comments = data.comments || [];
        // Optionally, update this.post if needed: this.post = data.post;
      },
      error: (error) => {
        console.error('Error loading comments:', error);
      },
    });
  }

  onSubmitComment(): void {
    if (!this.newComment.trim()) return;

    const comment = {
      postId: this.id,
      content: this.newComment,
      createdAt: new Date(),
      user: this.loggedInUser,
    };

    this.postService.addCommentToPost(this.id, comment).subscribe({
      next: () => {
        this.newComment = '';
        this.loadPostComments();
      },
      error: (error) => {
        console.error('Error adding comment:', error);
      },
    });
  }

  @HostListener('window:resize', [])
  onResize() {
    this.isMobile = window.innerWidth <= 600;
  }

  get displayedFiles() {
    return this.files ? this.files.slice(0, this.maxVisibleFiles) : [];
  }

  get hiddenFilesCount() {
    return this.files && this.files.length > this.maxVisibleFiles
      ? this.files.length - this.maxVisibleFiles
      : 0;
  }

  shortenFilename(name: string): string {
    if (!name) return '';
    return name.length > 15 ? name.substring(0, 12) + '...' : name;
  }

  // Handle Like click
  onLike() {
    if (this.userLiked && this.likeId !== null) {
      this.likesService.removeLike(this.id, this.likeId).subscribe({
        next: () => {
          this.userLiked = false;
          this.likeId = null;
          this.likeCount = Math.max(0, this.likeCount - 1);
        },
        error: (err) => {
          console.error('Error removing like:', err);
        },
      });
    } else {
      if (this.userDisliked && this.dislikeId !== null) {
        this.likesService.removeDislike(this.id, this.dislikeId).subscribe({
          next: () => {
            this.userDisliked = false;
            this.dislikeId = null;
            this.dislikeCount = Math.max(0, this.dislikeCount - 1);
            this.addLike();
          },
          error: (err) => {
            console.error('Error removing dislike:', err);
          },
        });
      } else {
        this.addLike();
      }
    }
  }

  private addLike() {
    this.likesService.likePost(this.id).subscribe({
      next: (res) => {
        this.userLiked = true;
        this.likeId = res.id;
        this.likeCount++;
      },
      error: (err) => {
        console.error('Error adding like:', err);
      },
    });
  }

  // Handle Dislike click
  onDislike() {
    if (this.userDisliked && this.dislikeId !== null) {
      this.likesService.removeDislike(this.id, this.dislikeId).subscribe({
        next: () => {
          this.userDisliked = false;
          this.dislikeId = null;
          this.dislikeCount = Math.max(0, this.dislikeCount - 1);
        },
        error: (err) => {
          console.error('Error removing dislike:', err);
        },
      });
    } else {
      if (this.userLiked && this.likeId !== null) {
        this.likesService.removeLike(this.id, this.likeId).subscribe({
          next: () => {
            this.userLiked = false;
            this.likeId = null;
            this.likeCount = Math.max(0, this.likeCount - 1);
            this.addDislike();
          },
          error: (err) => {
            console.error('Error removing like:', err);
          },
        });
      } else {
        this.addDislike();
      }
    }
  }

  private addDislike() {
    this.likesService.dislikePost(this.id).subscribe({
      next: (res) => {
        this.userDisliked = true;
        this.dislikeId = res.id;
        this.dislikeCount++;
      },
      error: (err) => {
        console.error('Error adding dislike:', err);
      },
    });
  }

  onComment() {
    this.showDetailDialog = true;
    const openDetailEvent = new CustomEvent('openPostDetail', {
      bubbles: true,
      detail: { postId: this.id },
    });
    window.dispatchEvent(openDetailEvent);
    // this.sidebarStateService.setSidebarState(false);
  }

  onShare() {
    if ('clipboard' in navigator) {
      navigator.clipboard.writeText(`${location.host}/post/${this.id}`);
      this.messageService.add({
        severity: 'success',
        summary: 'Link copied',
        detail: 'Post link copied to clipboard',
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Clipboard API not supported',
      });
    }
  }

  onFileClick() {
    console.log('File clicked', this.id);

    const item = {
      id: this.id,
      title: this.title,
    };

    localStorage.setItem('selectedPostId', this.id);
    this.userService.addToRecentItems(item);
  }

  onTagClick() {
    if (this.subject?.id) {
      this.router.navigate([`/subject/${this.subject.id}`]);
    }
  }
}
