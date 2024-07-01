import { Component } from '@angular/core';

declare var showSearchResult:boolean;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  [x: string]: any;
  name: string | undefined;
  showSearchResult:boolean = showSearchResult
}
