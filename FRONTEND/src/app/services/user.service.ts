import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  recentsUpdated = new EventEmitter<any[]>();
  private apiUrl = `${environment.MAIN_ENDPOINT_URL}`;

  constructor(private http: HttpClient) { }

  getCollection() {
    const token = sessionStorage.getItem('token');
    return this.http.get(`${this.apiUrl}/user_subjects/user_subjects`,
      { headers: { "Authorization": token || '' }}
    );
  }
  getRecentItems() {
    let str = localStorage.getItem('recentItems');
    if (str) {
      return JSON.parse(str);
    }
    return [];
  }
  
  addToRecentItems(item: any) {
    if(!item) return;
    let str = localStorage.getItem('recentItems');
    let recentItems: any[] = [];
    if (str) {
      recentItems = JSON.parse(str) as any[];
      if (recentItems.some((i) => i.id === item.id)) return;
      if (recentItems.length >= 3) {
        recentItems.pop();
      }
      recentItems.unshift(item);
    } else {
      recentItems = [item];
    }
    localStorage.setItem('recentItems', JSON.stringify(recentItems));
    this.recentsUpdated.emit(recentItems);
  }
}
