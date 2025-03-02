import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubjectService {
  private apiUrl = `${environment.MAIN_ENDPOINT_URL}`;

  updateFollows: any = new EventEmitter<void>();

  constructor(private http: HttpClient) {}

  // Helper method to get headers with Authorization token
  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': token || ''
    });
  }

  // Get subjects with optional search query
  getSubjects(searchQuery: string = ''): Observable<any[]> {
    const url = searchQuery ? `${this.apiUrl}/subjects?q=${searchQuery}` : this.apiUrl + '/subjects';
    return this.http.get<any[]>(url, { headers: this.getHeaders() });
  }

  // Toggle follow status
  toggleFollow(subjectId: string, isFollowed: boolean): Observable<any> {
    if (isFollowed) {
      const url = `${this.apiUrl}/user_subjects/unsubscribe?subject_id=${subjectId}`;
      return this.http.delete(url, { headers: this.getHeaders() }).pipe((rsp) => {
        setTimeout(() => {
          this.updateFollows.emit();
        }, 500);
        return rsp;
    });
    }
    const url = `${this.apiUrl}/user_subjects/join`;
    return this.http.post(url, { subject_id: subjectId }, { headers: this.getHeaders() }).pipe((rsp) => {
      setTimeout(() => {
        this.updateFollows.emit();
      }, 500);
      return rsp;
  });
  }

  getFollowedSubjects(): Observable<any[]> {
    const url = `${this.apiUrl}/user_subjects/user_subjects`;
    return this.http.get<any[]>(url, { headers: this.getHeaders() });
  }
}
