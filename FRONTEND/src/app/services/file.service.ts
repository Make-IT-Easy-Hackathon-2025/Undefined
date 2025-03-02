import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private apiUrl = `${environment.MAIN_ENDPOINT_URL}`;

  constructor(private http: HttpClient) {}

  // Helper method to get headers with Authorization token
  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    return new HttpHeaders({
      Authorization: token || '',
    });
  }

  getTitles(documentId: string): any {
    return this.http.get<any>(`${this.apiUrl}/chapters/titles?document_id=${documentId}`, {
      headers: this.getHeaders(),
    });
  }

  getFileContent(documentId: string): any {
    return this.http.get<any>(`${this.apiUrl}/chapters/document_chapters?document_id=${documentId}`, {
      headers: this.getHeaders(),
    });
  }

  generateChapter(documentId: string, chapterId: string): any {
    return this.http.post<any>(`${this.apiUrl}/documents/${documentId}/chapters/${chapterId}/generate_data`, {}, {
      headers: this.getHeaders(),
    });
  }

  generateExam(documentId: string, examId: string): any {
    return this.http.post<any>(`${this.apiUrl}/documents/${documentId}/chapters/${examId}/generate_data`, {}, {
      headers: this.getHeaders(),
    });
  }

  submitExam(data: any): any {
    return this.http.post<any>(`${this.apiUrl}/exam_submissions`, data, {
      headers: this.getHeaders(),
    });
  }

  getExamSubmissionByFileAndChapter(fileId: string, chapterId: string): any {
    return this.http.get<any>(`${this.apiUrl}/exam_submissions/by_document_and_chapter?document_id=${fileId}&chapter_id=${chapterId}`, {
      headers: this.getHeaders(),
    });
  }
}
