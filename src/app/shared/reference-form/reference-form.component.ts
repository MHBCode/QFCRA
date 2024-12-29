import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LogformService } from 'src/app/ngServices/logform.service';

@Component({
  selector: 'app-reference-form',
  templateUrl: './reference-form.component.html',
  styleUrls: ['./reference-form.component.scss', '../../shared/popup.scss']
})
export class ReferenceFormComponent implements OnInit {
  @Input() firmId: number = 0; 
  @Input() documentDetails: any = {}; 
  @Input() docTypes: string; 
  @Input() Page: number = 0;
  @Output() documentSelected = new EventEmitter<any>();
  @Output() documentDeselected = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  selectedDocId: string | null = null;
  formReferenceDocs: any[] = []; 
  isLoading: boolean = false; 

  constructor(private logForm: LogformService) { }

  ngOnInit(): void {
    this.getFormReferenceDocuments();
  }

  getFormReferenceDocuments(): void {
    this.isLoading = true;

    const docTypeString = this.docTypes;

    this.logForm.getDocListByFirmDocType(this.firmId, docTypeString, this.Page).subscribe(
      (data) => {
        this.formReferenceDocs = data.response || [];

        const existingDoc = this.formReferenceDocs.find(
          (doc) => doc.FILENAME === this.documentDetails?.FileName
        );
        if (existingDoc) {
          this.selectedDocId = existingDoc.DocID;
        }
        this.isLoading = false;
      },
      (error) => {
        console.error('Error Fetching Form Reference Docs:', error);
        this.formReferenceDocs = [];
        this.isLoading = false;
      }
    );
    setTimeout(() => {
      const popupWrapper = document.querySelector('.ReferenceFormPopUp') as HTMLElement;
      if (popupWrapper) {
        popupWrapper.style.display = 'flex';
      } else {
        console.error('Element with class .ReferenceFormPopUp not found');
      }
    }, 0)
  }

  replaceDocument(): void {
    if (this.selectedDocId) {
      const selectedDoc = this.formReferenceDocs.find(
        (doc) => doc.DocID === this.selectedDocId
      );
      if (selectedDoc) {
        this.documentSelected.emit(selectedDoc); 
        this.closeFormReference();
      } else {
        console.error('Selected document not found.');
      }
    } else {
      console.warn('No document selected.');
      this.closeFormReference();
    }
  }

  deSelectDocument(): void {
    this.selectedDocId = null;
    this.documentDeselected.emit(); 
    this.closeFormReference();
  }

  closeFormReference(): void {
    this.close.emit(); 
    const popupWrapper = document.querySelector('.ReferenceFormPopUp') as HTMLElement;
    if (popupWrapper) {
      popupWrapper.style.display = 'none';
    } else {
      console.error('Element with class .ReferenceFormPopUp not found');
    }
  }
}
