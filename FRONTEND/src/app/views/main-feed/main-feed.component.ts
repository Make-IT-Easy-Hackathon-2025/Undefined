import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { PostService } from '../../services/post.service';
import { PostComponent } from '../../components/post/post.component';
import { CommonModule } from '@angular/common';
import { PostDetailDialogComponent } from '../../components/post-detail-dialog/post-detail-dialog.component';
import {
  animate,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';

@Component({
  selector: 'app-main-feed',
  templateUrl: './main-feed.component.html',
  styleUrls: ['./main-feed.component.css'],
  standalone: true,
  imports: [PostComponent, CommonModule, PostDetailDialogComponent],
  animations: [
    // Content wrapper animation: Appears with fade and slide-in
    trigger('contentAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(15px)' }),
        animate(
          '500ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),

    // Stagger animation for list items
    trigger('listAnimation', [
      transition(':enter', [
        query(
          '*',
          [
            style({ opacity: 0, transform: 'translateY(20%)' }),
            stagger('10ms', [
              animate(
                '300ms ease-out',
                style({ opacity: 1, transform: 'translateY(0)' })
              ),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),

    // Animation for resetting sections (forces animation restart)
    trigger('sectionChange', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0ms', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class MainFeedComponent implements OnInit, OnDestroy {
  posts: any[] = [];
  selectedPost: any = null;
  showDetailDialog: boolean = false;
  isLoading: boolean = false;
  hasMorePosts: boolean = true;
  pageSize: number = 10;
  currentPage: number = 0;

  constructor(private postService: PostService) {}

  ngOnInit(): void {
    this.loadPosts(); // Load initial posts

    // Listen for the custom event from PostComponent
    window.addEventListener('openPostDetail', this.handleOpenPostDetail);
  }

  ngOnDestroy(): void {
    // Remove event listener when component is destroyed
    window.removeEventListener('openPostDetail', this.handleOpenPostDetail);
  }

  // Load posts from the API
  loadPosts(): void {
    if (this.isLoading || !this.hasMorePosts) return;

    this.isLoading = true;

    this.postService.getPosts('', this.currentPage, this.pageSize).subscribe({
      next: (newPosts) => {
        const mappedPosts = newPosts.map((item: any) => ({
          id: item.post.id,
          user: item.user,
          title: item.post.title,
          subject: {
            subject: item.post.subject_name,
            id: item.post.subject_id,
          },
          content: item.post.content,
          postDate: new Date(item.post.created_at),
          files: item.documents,
          likeCount: item.likes_count,
          likedByCurrentUser: item.liked_by_current_user,
          dislikedByCurrentUser: item.disliked_by_current_user,
          dislikeCount: item.dislikes_count,
          commentCount: item.comments_count,
          comments: item.comments,
        }));

        if (this.currentPage === 0) {
          this.posts = mappedPosts.reverse();
        } else {
          this.posts = [...this.posts, ...mappedPosts.reverse()];
        }

        this.hasMorePosts = newPosts.length === this.pageSize;
        this.currentPage++;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  // Handle infinite scrolling
  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop =
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop;

    if (
      documentHeight - (windowHeight + scrollTop) < 100 &&
      !this.isLoading &&
      this.hasMorePosts
    ) {
      this.loadPosts();
    }
  }

  // Handle opening post detail dialog
  handleOpenPostDetail = (event: any) => {
    const postId = event.detail.postId;
    this.selectedPost = this.posts.find((post) => post.id === postId);
    if (this.selectedPost) {
      this.showDetailDialog = true;
    }
  };

  // Close post detail dialog
  closeDetailDialog(): void {
    this.showDetailDialog = false;
    setTimeout(() => {
      this.selectedPost = null;
    }, 200);
  }
}
