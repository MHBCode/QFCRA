import { ElementRef, Injectable } from '@angular/core';
import flatpickr from 'flatpickr';

@Injectable({
  providedIn: 'root'
})
export class FlatpickrService {

  constructor() { }
  initializeFlatpickr(dateInputs: ElementRef<HTMLInputElement>[]) {
    dateInputs.forEach((input: ElementRef<HTMLInputElement>) => {
      input.nativeElement.placeholder = 'DD/Mon/YYYY';
      flatpickr(input.nativeElement, {
        allowInput: true,
        dateFormat: 'd/M/Y', // Adjust date format as needed
        onChange: (selectedDates, dateStr) => {
          input.nativeElement.value = dateStr;
        }
      });
    });
  }
}
