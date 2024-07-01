import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CameraService } from '../../camera.service';
import { Subscription, interval } from 'rxjs';

interface CameraEvent {
  camera_code: string;
  timestamp: number;
  type: string;
  line_id: string;
}

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css']
})
export class TimelineComponent implements OnInit, OnDestroy {
  events: CameraEvent[] = [];
  filteredEvents: CameraEvent[] = [];
  eventsInHour: CameraEvent[] = [];
  currentTime: string = '';
  hours: string[] = [];
  startOfDay: number = 0;
  endOfDay: number = 0;
  selectedEvent: CameraEvent | null = null;
  formattedEventDate: string = '';
  selectedEventImageUrl: string = '';
  selectedDay: number = new Date().getDate();
  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();
  formattedSelectedDate: string = '';
  fadeClass: string = 'fade-in';
  private timeSubscription: Subscription | null = null;

  days: number[] = Array.from({ length: 31 }, (_, i) => i + 1);
  months: number[] = Array.from({ length: 12 }, (_, i) => i + 1);
  years: number[] = Array.from({ length: 21 }, (_, i) => new Date().getFullYear() - i);
  monthNames: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  constructor(private cameraService: CameraService) {
    this.setDayRange(new Date(this.selectedYear, this.selectedMonth - 1, this.selectedDay));
  }

  ngOnInit(): void {
    this.cameraService.getCameraEvents().subscribe((data: CameraEvent[]) => {
      this.events = data;
      this.filterEvents();
    });
    this.updateTime();
    this.timeSubscription = interval(1000).subscribe(() => this.updateTime());
    this.updateFormattedSelectedDate();
    this.updateHoursDisplay();
    window.addEventListener('resize', this.updateHoursDisplay.bind(this));
  }

  ngOnDestroy(): void {
    if (this.timeSubscription) {
      this.timeSubscription.unsubscribe();
    }
    window.removeEventListener('resize', this.updateHoursDisplay.bind(this));
  }

  setDayRange(date: Date): void {
    const selectedDayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
    const selectedDayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
    this.startOfDay = Math.floor(selectedDayStart.getTime() / 1000);
    this.endOfDay = Math.floor(selectedDayEnd.getTime() / 1000);
    this.generateHours();
    this.filterEvents();
  }

  updateTime(): void {
    const now = new Date();
    now.setUTCHours(now.getUTCHours() + 7);  
    this.currentTime = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC+7';
  }

  filterEvents(): void {
    this.filteredEvents = this.events.filter(event => 
      event.timestamp >= this.startOfDay && event.timestamp <= this.endOfDay
    );
  }

  formatDate(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    date.setUTCHours(date.getUTCHours() + 7);  
    return date.toISOString().replace('T', ' ').substring(0, 19) + ' UTC+7';
  }

  calculatePosition(timestamp: number): string {
    const eventTime = new Date(timestamp * 1000);
    eventTime.setUTCHours(eventTime.getUTCHours() + 7);  
    const hours = eventTime.getUTCHours();
    const minutes = eventTime.getUTCMinutes();
    const seconds = eventTime.getUTCSeconds();
    const position = ((hours * 3600 + minutes * 60 + seconds) / 86400) * 100;
    return `${position}%`;
  }

  calculateVerticalPosition(timestamp: number): string {
    const eventTime = new Date(timestamp * 1000);
    eventTime.setUTCHours(eventTime.getUTCHours() + 7);  
    const minutes = eventTime.getUTCMinutes();
    const seconds = eventTime.getUTCSeconds();
    const position = ((minutes * 60 + seconds) / 3600) * 100;
    return `${position}%`;
  }

  generateHours(showFull: boolean = true): void {
    this.hours = [];
    for (let i = 0; i < 24; i++) {
      const hourString = showFull ? (i < 10 ? `0${i}:00` : `${i}:00`) : i.toString();
      this.hours.push(hourString);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.updateHoursDisplay();
  }

  updateHoursDisplay(): void {
    const screenWidth = window.innerWidth;
    if (screenWidth < 576) {
      this.generateHours(false);
    } else {
      this.generateHours(true);
    }
  }

  onEventClick(event: CameraEvent): void {
    this.selectedEvent = event;
    this.formattedEventDate = this.formatDate(event.timestamp);
    this.selectedEventImageUrl = `assets/${event.type}.jpg`;
    this.filterEventsInHour(event.timestamp);
  }

  onDateChange(): void {
    this.fadeClass = 'fade-out';
    setTimeout(() => {
      const date = new Date(this.selectedYear, this.selectedMonth - 1, this.selectedDay);
      this.setDayRange(date);
      this.updateFormattedSelectedDate();
      this.updateHoursDisplay();
      this.fadeClass = 'fade-in';
    }, 500);
  }

  updateFormattedSelectedDate(): void {
    const date = new Date(this.selectedYear, this.selectedMonth - 1, this.selectedDay);
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    this.formattedSelectedDate = date.toLocaleDateString('vi-VN', options);
  }

  filterEventsInHour(timestamp: number): void {
    const selectedEventDate = new Date(timestamp * 1000);
    const startOfHour = new Date(selectedEventDate.getFullYear(), selectedEventDate.getMonth(), selectedEventDate.getDate(), selectedEventDate.getHours(), 0, 0);
    const endOfHour = new Date(selectedEventDate.getFullYear(), selectedEventDate.getMonth(), selectedEventDate.getDate(), selectedEventDate.getHours(), 59, 59);
    const startTimestamp = Math.floor(startOfHour.getTime() / 1000);
    const endTimestamp = Math.floor(endOfHour.getTime() / 1000);

    this.eventsInHour = this.filteredEvents
      .filter(event => event.timestamp >= startTimestamp && event.timestamp <= endTimestamp)
      .sort((a, b) => a.timestamp - b.timestamp);
  }
}
