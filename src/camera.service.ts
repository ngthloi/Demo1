import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface CameraEvent {
  camera_code: string;
  timestamp: number;
  type: string;
  line_id: string;
  imageUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  getEventImageUrl(line_id: string) {
    throw new Error('Method not implemented.');
  }
  getCameraEventsInRange(startOfDay: number, endOfDay: number) {
    throw new Error('Method not implemented.');
  }
  private apiUrl = 'http://localhost:3000/Camera';

  constructor(private http: HttpClient) {}

  getCameraEvents(): Observable<CameraEvent[]> {
    return this.http.get<CameraEvent[]>(this.apiUrl);
  }
}
