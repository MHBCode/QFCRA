import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateUtilService {

  constructor() { }

  isOverdue(dueDate: string): boolean {
    const today = new Date();
    const taskDueDate = this.convertStringToDate(dueDate);

    if (!taskDueDate) {
      return false; // If date is invalid, assume it's not overdue
    }

    return taskDueDate < today; // Compare the two Date objects
  }


  convertStringToDate(dateStr: string): Date | null {
    if (!dateStr) {
      return null; // Return early if the dateStr is null, undefined, or empty
    }

    const months = {
      Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
      Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
    };

    // Split the date string: "09/Nov/2022"
    const parts = dateStr?.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = months[parts[1]]; // Convert "Nov" to "11"
      const year = parseInt(parts[2], 10);

      // Create a new Date object from the parsed parts
      const formattedDate = `${year}-${month}-${String(day).padStart(2, '0')}`;
      const date = new Date(formattedDate); // This creates a valid Date object in "YYYY-MM-DD" format
      return date;
    } else {
      console.error('Invalid date format:', dateStr);
      return null;
    }
  }

  convertApiDateToStandard(dateStr: string): string {
    if (!dateStr) {
      return '';
    }
    const months = {
      Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
      Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
    };

    const [day, month, year] = dateStr.split('/');
    const monthNumber = months[month];

    // Return the date in 'YYYY-MM-DD' format
    return `${year}-${monthNumber}-${day.padStart(2, '0')}`;
  }


  formatDateToCustomFormat(dateString: string | null): string {
    if (!dateString || isNaN(Date.parse(dateString))) {
      return '01/Jan/0001';
    }
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  convertDateToYYYYMMDD(dateStr: string | Date): string | null {

    if (!dateStr) {
      return null; // Return null if the input is invalid or empty
    }
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;

    if (isNaN(date.getTime())) {
      console.error('Invalid date format:', dateStr);
      return null;
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so add 1
    const day = String(date.getDate()).padStart(2, '0');

    // Only return the date in YYYY-MM-DD format, stripping the time part
    const formattedDate = `${year}-${month}-${day}`;

    return formattedDate;
  }

  addYears(date: string | Date, years: number): Date {
    const newDate = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(newDate.getTime())) {
      throw new Error(`Invalid date: ${date}`);
    }
    newDate.setFullYear(newDate.getFullYear() + years);
    return newDate;
  }

  addDays(date: string | Date, days: number): Date {
    const newDate = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(newDate.getTime())) {
      throw new Error(`Invalid date: ${date}`);
    }
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  }


}
