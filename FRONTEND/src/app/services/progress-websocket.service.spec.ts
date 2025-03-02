import { TestBed } from '@angular/core/testing';

import { ProgressWebsocketService } from './progress-websocket.service';

describe('ProgressWebsocketService', () => {
  let service: ProgressWebsocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProgressWebsocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
