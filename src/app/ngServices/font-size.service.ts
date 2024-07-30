import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class FontSizeService {

  constructor() { }

  private fontSizeSubject = new BehaviorSubject<number>(16); // Default font size
  fontSize$ = this.fontSizeSubject.asObservable();

  private resetSize = 16; // Default reset size

  private currentSize = 16; // Track current font size
  
  increaseFontSize() {
    this.currentSize = this.resetSize + 2;
    this.fontSizeSubject.next(this.currentSize);
  }

  setMaxFontSize() {
    this.currentSize = this.resetSize + 4;
    this.fontSizeSubject.next(this.currentSize);
  }

  resetFontSize() {
    this.currentSize = this.resetSize;
    this.fontSizeSubject.next(this.currentSize);
  }

}
