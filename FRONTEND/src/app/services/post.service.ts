import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = `${environment.MAIN_ENDPOINT_URL}/posts`;

  constructor(private http: HttpClient) {}

  // Helper method to get headers with Authorization token
  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': token || ''
    });
  }

  // Fetch posts for a subject with backend pagination
  getPosts(subjectId: string, page: number, pageSize: number, searchQuery: string = ''): Observable<any[]> {
    let url = `${this.apiUrl}?subject_id=${subjectId}&page=${page}&pageSize=${pageSize}`;
    if (searchQuery) {
      url += `&q=${searchQuery}`;
    }
    return this.http.get<any[]>(url, { headers: this.getHeaders() });
  }

  // Fetch a single post by ID (including its comments)
  getPostById(id: string): Observable<any> {
    const url = `${this.apiUrl}/?id=${id}`;
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }

  // Create a new post
  createPost(title: string, subject: number, body: string, files: any[]): Observable<any> {
    let formData = new FormData();
    formData.append('title', title);
    formData.append('subject_id', subject.toString());
    formData.append('content', body);
    files.forEach((file) => {
      formData.append('documents[]', file);
    });
    return this.http.post(this.apiUrl, formData, { headers: this.getHeaders() });
  }

  // Add a comment to a post (assumes backend supports POST /posts/{postId}/comments)
  addCommentToPost(postId: string, comment: any): Observable<any> {
    const url = `${this.apiUrl}/${postId}/comments`;
    return this.http.post(url, comment, { headers: this.getHeaders() });
  }
}
