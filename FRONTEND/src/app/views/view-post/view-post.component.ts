// view-post.component.ts
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PostComponent } from '../../components/post/post.component';
import { PostService } from '../../services/post.service';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service'; // Import AuthService

@Component({
  selector: 'app-view-post',
  standalone: true,
  imports: [CommonModule, PostComponent, ToastModule, ProgressSpinnerModule],
  templateUrl: './view-post.component.html',
  styleUrls: ['./view-post.component.scss']
})
export class ViewPostComponent {
  private readonly route = inject(ActivatedRoute);
  isLoading: boolean = true;
  item: any = null;
  isAuthenticated: boolean = true;

  constructor(
    private postService: PostService,
    private userService: UserService,
    private authService: AuthService // Inject AuthService
  ) {}

  ngOnInit() {
    // Check authentication status
    this.authService.checkAuthStatus().subscribe((isAuthenticated) => {
      this.isAuthenticated = isAuthenticated;
    });

    const postId = this.route.snapshot.params['postId'];
    this.postService.getPostById(postId).subscribe({
      next: (post) => {
        this.item = post[0];
        this.isLoading = false;
        this.userService.addToRecentItems(post[0].post);
        this.updateRecentlyViewed(post);
      },
      error: (err) => {
        console.error('Error loading post:', err);
        this.isLoading = false;
      }
    });
  }

  // Save the post info in localStorage, keeping max 4 items
  updateRecentlyViewed(post: any): void {
    let recentPosts = JSON.parse(localStorage.getItem('recentPosts') || '[]');
    recentPosts = recentPosts.filter((p: any) => p.id !== post.id);
    recentPosts.unshift({ id: post.id, title: post.title, timestamp: new Date().getTime() });
    if (recentPosts.length > 4) {
      recentPosts = recentPosts.slice(0, 4);
    }
    localStorage.setItem('recentPosts', JSON.stringify(recentPosts));
  }
}