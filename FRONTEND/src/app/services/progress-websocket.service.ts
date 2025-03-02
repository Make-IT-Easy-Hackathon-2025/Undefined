import { Injectable, NgZone } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProgressWebsocketService {
  private ws: WebSocket | null = null;
  public progress: { [key: string]: number } = {}; // Store progress by chapterIndex or examId

  constructor(private zone: NgZone) {}

  /**
   * Connect to WebSocket and listen for progress updates.
   * @param userId - The user ID used to authenticate WebSocket connection.
   * @param progressCallback - Callback for progress updates, with union type for chapter or exam updates.
   */
  connect(
    userId: string,
    progressCallback?: (data: { chapterIndex?: number; examId?: string; progress: number }) => void
  ): void {
    this.ws = new WebSocket(environment.WEBSOCKET_URL);

    this.ws.onopen = () => {
      this.ws?.send(JSON.stringify({ userId })); // Send user ID upon opening the connection
    };

    this.ws.onmessage = (message) => {
      const parsedData = JSON.parse(message.data);

      // Dynamically handle both examId and chapterIndex
      const { chapterIndex, examId, progress, status } = parsedData;

      // Key can be either examId or chapterIndex to store progress
      const key = chapterIndex !== undefined ? `chapter-${chapterIndex}` : `exam-${examId}`;

      this.zone.run(() => {
        this.progress[key] = progress;

        // Trigger the callback for progress updates if provided
        if (progressCallback) {
          progressCallback({ chapterIndex, examId, progress });
        }
      });
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
    };
  }

  /**
   * Disconnect WebSocket to clean up resources.
   */
  disconnect(): void {
    this.ws?.close();
    this.ws = null;
  }
}