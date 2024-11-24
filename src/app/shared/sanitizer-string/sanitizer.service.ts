import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class SanitizerService {
  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Sanitizes HTML content and allows rendering it safely.
   * @param html - The HTML string to be sanitized.
   * @returns SafeHtml
   */
  sanitizeHtml(html: string): SafeHtml {
    if (typeof html !== 'string') return '';
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  /**
   * Removes HTML tags and returns plain text.
   * @param input - The string from which HTML tags should be removed.
   * @returns Plain text
   */
  removeHtmlTags(input: string | null | undefined): string {
    if (!input) {
      return ''; // Return an empty string if input is null or undefined
    }
    // Regex to remove all HTML tags
    return input.replace(/<[^>]*>/g, '');
  }

}
