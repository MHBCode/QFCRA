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
    const months = {
      Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
      Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
    };
  
    // Split the date string: "09/Nov/2022"
    const parts = dateStr.split('/');
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
    const months = {
      Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
      Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
    };

    const [day, month, year] = dateStr.split('/');
    const monthNumber = months[month];

    // Return the date in 'YYYY-MM-DD' format
    return `${year}-${monthNumber}-${day.padStart(2, '0')}`;
  }
}
