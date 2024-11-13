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
  @Input() newfileNum: number;

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
      this.getNewFileNumber();
    });
  }

  confirmOkUpload() {
    if (this.selectedFile) {
      const uploadedDocumentsDiv = document.getElementById('uploaded-documents');
      if (uploadedDocumentsDiv) {
        uploadedDocumentsDiv.textContent = `${this.selectedFile.name}`;
      }
      this.callUploadDoc = false;
      const popupWrapper = document.querySelector(".selectDocumentPopUp") as HTMLElement;
      setTimeout(() => {
        if (popupWrapper) {
          popupWrapper.style.display = 'none';
        } else {
          console.error('Element with class not found');
        }
      }, 0);
    } else {
      console.error('No valid PDF file selected.');
    }
  }

  uploadDocument() {
    this.hasValidationErrors = false;
    this.isLoading = true;

    if (!this.selectedFile) {
      this.getErrorMessages('uploadDocument', constants.DocumentAttechment.selectDocument);
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['uploadDocument'];
    }

    if (this.hasValidationErrors) {
      this.firmDetailsService.showErrorAlert(constants.Firm_CoreDetails_Messages.FIRMSAVEERROR);
      this.isLoading = false;
      return;
    }

    if (this.selectedFile) {
      this.getNewFileNumber().pipe(
        switchMap(() => {
          const intranetSitePath = 'https://ictmds.sharepoint.com/sites/QFCRA';
          const filePathAfterDocLib = "";
          const strfileName = this.selectedFile.name;
          const strUserEmailAddress = 'k.thomas@ictmds.onmicrosoft.com';

          return this.sharepointService.uploadFileToSharepoint(
            this.selectedFile,
            intranetSitePath,
            filePathAfterDocLib,
            strfileName,
            strUserEmailAddress
          );
        })
      ).subscribe({
        next: (response: SharePointUploadResponse) => {
          console.log('File uploaded successfully', response);

          const [fileLocation, intranetGuid] = response.result.split(';');
          this.documentUploaded.emit({ fileLocation, intranetGuid });

          const uploadedDocumentsDiv = document.getElementById('uploaded-documents');
          if (uploadedDocumentsDiv) {
            uploadedDocumentsDiv.textContent = `${this.selectedFile.name}`;
          }

          this.callUploadDoc = false;
          const popupWrapper = document.querySelector(".selectDocumentPopUp") as HTMLElement;
          setTimeout(() => {
            if (popupWrapper) {
              popupWrapper.style.display = 'none';
            } else {
              console.error('Element with class not found');
            }
          }, 0);

          this.uploadFileSuccess(constants.DocumentAttechment.saveDocument);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error occurred during file upload', err);
          this.firmDetailsService.showErrorAlert(constants.MessagesLogForm.ERROR_UPLOADING_FILE);
          this.isLoading = false;
        }
      });
    } else {
      console.error('No valid PDF file selected.');
      this.isLoading = false;
    }
  }


  deleteDocument(docID: number, objectId: number, objectInstanceId: number, ObjectInstanceRevNum: number) {
    this.objectWF.deleteDocument(docID, objectId, objectInstanceId, ObjectInstanceRevNum).subscribe({
      next: (response) => {
        console.log('Document deleted successfully:', response);
        if (this.loadDocuments) {
          this.loadDocuments();
        }
      },
      error: (err) => {
        console.error('Error occurred while deleting the document:', err);
      }
    });
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

  getNewFileNumber() {
    return this.logForm.getNewFileNumber(this.firmId, this.currentDate).pipe(
        tap(data => {
            this.newfileNum = data.response.Column1;
        })
    );
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



  showAlertDeleteFile() {
    Swal.fire({
      text: 'Do you really want to delete this attachment?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteDocument(this.tableDoc.DocID, this.pageName, this.param1, this.param2);
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
      const file = input.files[0];
      if (file.type === 'application/pdf') {
        this.selectedFile = file; // Update only if the file is valid
        this.fileError = ''; // Clear any previous error message
        this.selectedFileChange.emit(this.selectedFile);
      } else {
        this.fileError = 'Please select a valid PDF file.';
        this.selectedFileChange.emit(null);
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
