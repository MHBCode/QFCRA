import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-reference-form',
  templateUrl: './reference-form.component.html',
  styleUrls: ['./reference-form.component.scss']
})
export class ReferenceFormComponent implements OnInit {
  @Input() formReferenceDocs: any[] = [];
  @Input() callRefForm: boolean = false;
  @Input() selectedDocId: string | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() documentReplaced = new EventEmitter<any>();
  @Output() documentDeselected = new EventEmitter<void>();

  ngOnInit() {
    
  }

  closeFormReference() {
    this.callRefForm = false;
    this.close.emit();
  }

  replaceDocument(): void {
    if (this.selectedDocId) {
      const selectedDoc = this.formReferenceDocs.find(doc => doc.DocID === this.selectedDocId);
      if (selectedDoc) {
        this.documentReplaced.emit(selectedDoc);
        this.closeFormReference();
      } else {
        console.error('Selected document not found.');
      }
    } else {
      console.warn('No document selected.');
    }
  }

  deSelectDocument(): void {
    this.selectedDocId = null;
    this.documentDeselected.emit();
    this.closeFormReference();
  }
}
