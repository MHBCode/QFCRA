import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FontSizeService {

  constructor() { }

  private fontSizeSubject = new BehaviorSubject<number>(16); // Default font size
  fontSize$ = this.fontSizeSubject.asObservable();

  private currentSize = 16; // Track current font size

  increaseFontSize() {
    if (this.currentSize < 25)
    this.currentSize += 2;
    this.fontSizeSubject.next(this.currentSize);
  }

  decreaseFontSize() {
    if (this.currentSize > 8)
    this.currentSize -= 2;
    this.fontSizeSubject.next(this.currentSize);
  }

  resetFontSize() {
    this.currentSize = 16;
    this.fontSizeSubject.next(this.currentSize);
  }

}
