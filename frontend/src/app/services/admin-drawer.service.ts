import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AdminDrawerService {
  private _isOpen = signal(false);
  
  // Read-only signal for components to subscribe to
  readonly isOpen = this._isOpen.asReadonly();

  toggle(): void {
    this._isOpen.update(open => !open);
  }

  open(): void {
    this._isOpen.set(true);
  }

  close(): void {
    this._isOpen.set(false);
  }
}