import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import Swal from 'sweetalert2';
import * as constants from 'src/app/app-constants';
import { FrimsObject, ObjectOpType } from 'src/app/app-constants';
import { SharepointDocumentsService } from 'src/app/ngServices/sharepoint-documents.service';
import { SecurityService } from 'src/app/ngServices/security.service';
import { LogformService } from 'src/app/ngServices/logform.service';
import { ObjectwfService } from 'src/app/ngServices/objectwf.service';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable, switchMap, tap } from 'rxjs';
import { SharePointUploadResponse } from 'src/app/models/sharepoint-upload-response.interface';
import { FirmDetailsService } from 'src/app/firms/firmsDetails.service';

@Component({
  selector: 'app-attachment',
  templateUrl: './attachment.component.html',
  styleUrls: ['./attachment.component.scss']
})
export class AttachmentComponent implements OnInit {
  @Input() loadDocuments: (documentObj?: any) => void;
  @Input() isEdit: boolean = false;

  @Input() documentObj: any;
  @Input() DocSubTypeID: any = {};
  @Input() tableDoc;
  @Input() pageName;
  @Input() param1;
  @Input() param2;
  @Input() selectedFile: File | null = null;
  @Input() selectedFiles: File[] = [];
  @Input() newfileNum: number;
  @Input() documentTypes: any = [];
  @Input() ismultiple: boolean = false;

  intranetSitePath = 'https://ictmds.sharepoint.com/sites/QFCRA';
  filePathAfterDocLib = "";
  strUserEmailAddress = 'k.thomas@ictmds.onmicrosoft.com';
  @Input() FileLoc: string = '';
  fileLocation: string = '';

  Page = FrimsObject;
  fileError: string = '';
  callUploadDoc: boolean = false;
  hasValidationErrors: boolean = false;
  isLoading: boolean = false;
  errorMessages: { [key: string]: string } = {};
  firmId: number = 0;
  now = new Date();
  currentDate = this.now.toISOString();
  currentDateOnly = new Date(this.currentDate).toISOString().split('T')[0];
  @Output() documentUploaded = new EventEmitter<any>();
  @Output() selectedFileChange = new EventEmitter<File | null>();
  @Output() selectedFilesChange = new EventEmitter<File | File[] | null>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private logForm: LogformService,
    private objectWF: ObjectwfService,
    private securityService: SecurityService,
    private sharepointService: SharepointDocumentsService,
    private firmDetailsService: FirmDetailsService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
    });
  }

  confirmOkUpload() {
    if (this.ismultiple) {
      if (Array.isArray(this.selectedFiles) && this.selectedFiles.length > 0) {
        const uploadedDocumentsDiv = document.getElementById('uploaded-documents');
        if (uploadedDocumentsDiv) {
          uploadedDocumentsDiv.textContent = this.selectedFiles.map(file => file.name).join(', ');
        }
        this.closeUploadPopup();
      } else {
        console.error('No valid PDF files selected.');
      }
    } else {
      if (this.selectedFile) {
        const uploadedDocumentsDiv = document.getElementById('uploaded-documents');
        if (uploadedDocumentsDiv) {
          uploadedDocumentsDiv.textContent = `${this.selectedFile.name}`;
        }
        this.closeUploadPopup();
      } else {
        console.error('No valid PDF file selected.');
      }
    }
  }

  private closeUploadPopup() {
    this.callUploadDoc = false;
    const popupWrapper = document.querySelector(".selectDocumentPopUp") as HTMLElement;
    setTimeout(() => {
      if (popupWrapper) {
        popupWrapper.style.display = 'none';
      } else {
        console.error('Element with class not found');
      }
    }, 0);
  }

  uploadDocument() {
    this.hasValidationErrors = false;
    this.isLoading = true;

    if (this.ismultiple) {
      if (!this.selectedFiles.length) {
        this.getErrorMessages('uploadDocument', constants.DocumentAttechment.selectDocument);
        this.hasValidationErrors = true;
      } else {
        delete this.errorMessages['uploadDocument'];
      }
    } else {
      if (!this.selectedFile) {
        this.getErrorMessages('uploadDocument', constants.DocumentAttechment.selectDocument);
        this.hasValidationErrors = true;
      } else {
        delete this.errorMessages['uploadDocument'];
      }
    }

    if (this.hasValidationErrors) {
      this.firmDetailsService.showErrorAlert(constants.Firm_CoreDetails_Messages.FIRMSAVEERROR);
      this.isLoading = false;
      return;
    }

    if (this.ismultiple) {
      this.selectedFiles.forEach((file, index) => {
        this.uploadSingleFile(file, index === this.selectedFiles.length - 1); // Ensure the last file toggles the loading flag
      });
    } else if (this.selectedFile) {
      this.uploadSingleFile(this.selectedFile, true); // Single file case
    }
  }

  uploadSingleFile(file: File, isLastFile: boolean) {
    const strfileName = file.name;
    debugger;
    this.sharepointService.uploadFileToSharepoint(
      file,
      this.intranetSitePath,
      this.filePathAfterDocLib,
      strfileName,
      this.strUserEmailAddress
    ).subscribe({
      next: (response: SharePointUploadResponse) => {
        console.log('File uploaded successfully', response);

        const [fileLocation, intranetGuid] = response.result.split(';');
        this.fileLocation = fileLocation;
        this.documentUploaded.emit({ fileLocation, intranetGuid });

        const uploadedDocumentsDiv = document.getElementById('uploaded-documents');
        if (uploadedDocumentsDiv) {
          const currentFiles = uploadedDocumentsDiv.textContent || '';
          uploadedDocumentsDiv.textContent = this.ismultiple
            ? `${currentFiles}${currentFiles ? ', ' : ''}${file.name}`
            : file.name;
        }

        if (isLastFile) {
          this.closeUploadPopup();
          this.uploadFileSuccess(constants.DocumentAttechment.saveDocument);
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Error occurred during file upload', err);
        this.firmDetailsService.showErrorAlert(constants.MessagesLogForm.ERROR_UPLOADING_FILE);
        if (isLastFile) this.isLoading = false;
      },
    });
  }


  deleteDocument(docID: number, objectId: number, objectInstanceId: number, ObjectInstanceRevNum: number, fileLoc: string) {
    if (fileLoc) {
      this.isLoading = true;
      this.sharepointService.deleteFileFromSharepoint(this.intranetSitePath, fileLoc).subscribe({
        next: () => {
          console.log('File deleted from SharePoint successfully');

          this.objectWF.deleteDocument(docID, objectId, objectInstanceId, ObjectInstanceRevNum).subscribe({
            next: (response) => {
              console.log('Document deleted from database successfully:', response);

              this.loadDocuments();
              this.isLoading = false;
            },
            error: (err) => {
              console.error('Error occurred while deleting the document from the database:', err);
              this.isLoading = false;
            }
          });
        },
        error: (err) => {
          console.error('Error deleting file from SharePoint:', err);
          this.isLoading = false;
        }
      });
    } else {
      console.error('No file location available for SharePoint deletion');
      this.isLoading = false;
    }
  }


  showUploadConfirmation(documentObj: any) {
    Swal.fire({
      text: 'Are you sure you want to upload the scope of authorisation, please verify the below scope changes and then upload the file?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok',
      cancelButtonText: 'Cancel',
      reverseButtons: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.uploadDocument();
      }
    });
  }

  uploadFileSuccess(messageKey: number) {
    this.isLoading = true;
    this.logForm.errorMessages(messageKey).subscribe(
      (response) => {
        Swal.fire({
          title: 'Success!',
          text: response.response,
          icon: 'success',
          confirmButtonText: 'Ok',
        });
      },
    );
    this.isLoading = false;
  }

  shouldShowInputs(): boolean {
    // Hide dropdown and buttons if files exist and the page is CoreDetail or Scope
    return !(
      (this.pageName === this.Page.Scope || this.pageName === this.Page.CoreDetail) &&
      this.tableDoc?.length > 0
    );
  }

  shouldShowButtons(): boolean {
    if (this.pageName === this.Page.Scope || this.pageName === this.Page.CoreDetail) {
      // Hide buttons if there's an uploaded file
      return !this.tableDoc?.length;
    } else if 
    (
      this.pageName === this.Page.Enforcement || this.pageName === this.Page.SupervisionJournal ||
      this.pageName === this.Page.RegisteredFunds
    ) {
      // Always show buttons on these pages
      return true;
    }
    return false; // Default to hiding if no condition is met
  }
  

  getErrorMessages(fieldName: string, msgKey: number, placeholderValue?: string) {
    this.logForm.errorMessages(msgKey).subscribe(
      (response) => {
        let errorMessage = response.response;
        this.errorMessages[fieldName] = errorMessage;
      },
      (error) => {
        console.error(`Failed to load error message for ${fieldName}.`, error);
      }
    );
  }



  showAlertDeleteFile(doc: any) {
    Swal.fire({
      text: 'Do you really want to delete this attachment?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        // Use doc.DocID for the correct deletion logic
        this.deleteDocument(doc.DocID, this.pageName, this.param1, this.param2, doc.FileLoc);

        // Reload documents after deletion
        this.loadDocuments();
      } else if (result.isDismissed) {
        return;
      }
    });
  }



  selectDocument() {
    this.callUploadDoc = true;
    setTimeout(() => {
      const popupWrapper = document.querySelector('.selectDocumentPopUp') as HTMLElement;
      if (popupWrapper) {
        popupWrapper.style.display = 'flex';
      } else {
        console.error('Element with class .selectDocumentPopUp not found');
      }
    }, 0)
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      if (this.ismultiple) {
        const validFiles: File[] = [];
        const invalidFiles: string[] = [];

        Array.from(input.files).forEach(file => {
          if (file.type === 'application/pdf') {
            validFiles.push(file);
          } else {
            invalidFiles.push(file.name);
          }
        });

        if (validFiles.length > 0) {
          this.fileError = invalidFiles.length
            ? `Some files are not valid PDFs: ${invalidFiles.join(', ')}`
            : '';
          this.selectedFilesChange.emit(validFiles); // Emit array of valid files
        } else {
          this.fileError = 'Please select valid PDF files.';
          this.selectedFilesChange.emit(null); // Emit null for no valid files
        }
      } else {
        const file = input.files[0]; // Single file
        if (file.type === 'application/pdf') {
          this.fileError = '';
          this.selectedFileChange.emit(file); // Emit the single valid file
        } else {
          this.fileError = 'Please select a valid PDF file.';
          this.selectedFileChange.emit(null); // Emit null for invalid file
        }
      }
    }
  }


  closeSelectDocument() {
    this.callUploadDoc = false;
    this.selectedFile = null;
    const popupWrapper = document.querySelector(".selectDocumentPopUp") as HTMLElement;
    setTimeout(() => {
      if (popupWrapper) {
        popupWrapper.style.display = 'none';
      } else {
        console.error('Element with class not found');
      }
    }, 0)
  }
}
