// ViewSubjectComponent.ts

import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PostService } from '../../services/post.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import {
  animate,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputTextModule } from 'primeng/inputtext';
import { PostComponent } from '../../components/post/post.component';
import { PostDetailDialogComponent } from '../../components/post-detail-dialog/post-detail-dialog.component';
import { CustomLoadingComponent } from '../../components/custom-loading/custom-loading.component';
import { SharedFilesPanelComponent } from '../../components/shared-files-panel/shared-files-panel.component';

/**
 * ViewSubjectComponent loads and displays posts related to a subject.
 * The component now subscribes to route parameter changes. When the "id"
 * parameter changes in the URL, it resets the posts and reloads them accordingly.
 */
@Component({
  selector: 'app-subject',
  templateUrl: './view-subject.component.html',
  styleUrls: ['./view-subject.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    PaginatorModule,
    InputGroupAddonModule,
    InputGroupModule,
    ProgressSpinnerModule,
    InputTextModule,
    PostComponent,
    CustomLoadingComponent,
    SharedFilesPanelComponent,
    PostDetailDialogComponent,
  ],
  animations: [
    trigger('listAnimation', [
      transition(':enter', [
        query(
          '*',
          [
            style({ opacity: 0, transform: 'translateY(20%)' }),
            stagger('30ms', [
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
  ],
})
export class ViewSubjectComponent implements OnInit, OnDestroy {
  posts: any[] = [];
  subjectId: string | null = null;
  searchQuery: string = '';
  isLoading: boolean = false;
  hasMorePosts: boolean = true;
  pageSize: number = 10;
  currentPage: number = 0;
  selectedPost: any = null;
  showDetailDialog: boolean = false;
  
  // Subscription for route param changes
  private routeSub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService
  ) {}

  get allSharedFiles() {
    return this.posts.reduce((acc: any[], post: any) => {
      if (post.files && post.files.length) {
        return acc.concat(post.files);
      }
      return acc;
    }, []);
  }

  // Event handler to open the post detail dialog when the custom event is dispatched.
  handleOpenPostDetail = (event: any) => {
    const postId = event.detail.postId;
    this.selectedPost = this.posts.find((post) => post.id === postId);
    if (this.selectedPost) {
      this.showDetailDialog = true;
    }
  };

  /**
   * Subscribes to route parameter changes to detect when the subject "id" changes.
   * On a change, it resets the current posts and loads posts for the new subject.
   */
  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe((params) => {
      this.subjectId = params.get('id');
      if (this.subjectId) {
        // Reset posts and pagination before loading new posts.
        this.posts = [];
        this.currentPage = 0;
        this.hasMorePosts = true;
        this.loadPosts();
      } else {
        this.router.navigate(['/subjects']);
      }
    });
    // Add listener for the custom event
    window.addEventListener('openPostDetail', this.handleOpenPostDetail);
  }

  /**
   * Unsubscribes from route parameter changes and removes the custom event listener
   * to prevent memory leaks.
   */
  ngOnDestroy(): void {
    window.removeEventListener('openPostDetail', this.handleOpenPostDetail);
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  loadPosts(): void {
    if (this.isLoading || !this.hasMorePosts) return;

    this.isLoading = true;

    this.postService
      .getPosts(
        this.subjectId!,
        this.currentPage,
        this.pageSize,
        this.searchQuery
      )
      .subscribe({
        next: (newPosts) => {
          const mappedPosts = newPosts.map((item: any) => ({
            id: item.post.id,
            user: item.user,
            title: item.post.title,
            content: item.post.content,
            postDate: new Date(item.post.created_at),
            files: item.documents.map((doc: any) => ({
              name: doc.filename,
              url: doc.url,
              id: doc.id,
              postId: item.post.id,
            })),
            comments: item.comments,
            likeCount: item.likes_count,
            dislikeCount: item.dislikes_count,
            commentCount: item.comments_count,
          }));

          this.posts = [...this.posts, ...mappedPosts];
          this.hasMorePosts = newPosts.length === this.pageSize;
          this.currentPage++;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  // Handle search when Enter is pressed
  onSearch(): void {
    this.posts = [];
    this.currentPage = 0;
    this.hasMorePosts = true;
    this.loadPosts();
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

  // Close post detail dialog
  closeDetailDialog(): void {
    this.showDetailDialog = false;
    setTimeout(() => {
      this.selectedPost = null;
    }, 200);
  }
}
