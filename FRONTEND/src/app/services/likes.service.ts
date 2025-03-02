import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LikesService {
  private apiUrl = `${environment.MAIN_ENDPOINT_URL}/posts`;

  constructor(private http: HttpClient) {}

  // Helper method to get headers with Authorization token
  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': token || '' });
  }

  // Add a like to a post
  likePost(postId: string): Observable<any> {
    const url = `${this.apiUrl}/${postId}/likes`;
    return this.http.post(url, {}, { headers: this.getHeaders() });
  }

  // Remove a like (requires like ID)
  removeLike(postId: string, likeId: number): Observable<any> {
    const url = `${this.apiUrl}/${postId}/likes/${likeId}`;
    return this.http.delete(url, { headers: this.getHeaders() });
  }

  // Add a dislike to a post
  dislikePost(postId: string): Observable<any> {
    const url = `${this.apiUrl}/${postId}/dislikes`;
    return this.http.post(url, {}, { headers: this.getHeaders() });
  }

  // Remove a dislike (requires dislike ID)
  removeDislike(postId: string, dislikeId: number): Observable<any> {
    const url = `${this.apiUrl}/${postId}/dislikes/${dislikeId}`;
    return this.http.delete(url, { headers: this.getHeaders() });
  }
}
