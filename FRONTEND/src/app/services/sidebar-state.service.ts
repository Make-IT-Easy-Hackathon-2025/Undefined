import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarStateService {
  private sidebarOpenSubject = new BehaviorSubject<boolean>(true);
  sidebarOpen$ = this.sidebarOpenSubject.asObservable();

  setSidebarState(isOpen: boolean) {
    this.sidebarOpenSubject.next(isOpen);
  }
}