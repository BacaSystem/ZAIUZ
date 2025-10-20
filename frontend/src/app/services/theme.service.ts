import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkThemeSubject = new BehaviorSubject<boolean>(false);
  public isDarkTheme$: Observable<boolean> = this.darkThemeSubject.asObservable();

  constructor() {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('darkTheme');
    const isDarkTheme = savedTheme ? JSON.parse(savedTheme) : false;
    this.setDarkTheme(isDarkTheme);
  }

  setDarkTheme(isDarkTheme: boolean): void {
    this.darkThemeSubject.next(isDarkTheme);
    
    // Save preference to localStorage
    localStorage.setItem('darkTheme', JSON.stringify(isDarkTheme));
    
    // Apply theme to document body
    if (isDarkTheme) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  toggleTheme(): void {
    const currentTheme = this.darkThemeSubject.value;
    this.setDarkTheme(!currentTheme);
  }

  isDarkTheme(): boolean {
    return this.darkThemeSubject.value;
  }
}