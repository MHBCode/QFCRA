import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';


@Injectable({
  providedIn: 'root'
})
export class SanitizerService {

  constructor(private sanitizer: DomSanitizer) { }

  getSanitizedNotes(notes: string): SafeHtml {
    if (typeof notes !== 'string') return '';
  
    // Use the sanitizer to bypass security and render the notes as HTML
    return this.sanitizer.bypassSecurityTrustHtml(notes);
  }

  removeHtmlTags(input: string | null | undefined): string {
    // Check if input is null or undefined
    if (!input) {
      return ''; // Return an empty string if input is null or undefined
    }
    // This regex will remove all HTML tags
    return input.replace(/<[^>]*>/g, '');
  }


}

