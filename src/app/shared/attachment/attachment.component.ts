import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import * as constants from 'src/app/app-constants';
import { SharepointDocumentsService } from 'src/app/ngServices/sharepoint-documents.service';
import { SecurityService } from 'src/app/ngServices/security.service';
import { LogformService } from 'src/app/ngServices/logform.service';
import { ObjectwfService } from 'src/app/ngServices/objectwf.service';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable, tap } from 'rxjs';
import { SharePointUploadResponse } from 'src/app/models/sharepoint-upload-response.interface';

@Component({
  selector: 'app-attachment',
  templateUrl: './attachment.component.html',
  styleUrls: ['./attachment.component.scss']
})
export class AttachmentComponent implements OnInit {
  selectedFile: File | null = null;
  fileError: string = '';
  callUploadDoc: boolean = false;
  hasValidationErrors: boolean = false;
  isLoading: boolean = false;
  errorMessages: { [key: string]: string } = {};
  newfileNum: number;
  firmId: number = 0;
  now = new Date();
  currentDate = this.now.toISOString();
  currentDateOnly = new Date(this.currentDate).toISOString().split('T')[0];


  constructor(
    private router: Router,
    private route: ActivatedRoute, 
    private logForm: LogformService,
    private objectWF: ObjectwfService,
    private securityService: SecurityService,
    private sharepointService: SharepointDocumentsService
  ) {

  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.firmId = +params['id']; 
    })

  }
  /* start of  documents functions */
  confirmOkUpload() {
    if (this.selectedFile) {
      // Display the selected file name in the main section
      const uploadedDocumentsDiv = document.getElementById('uploaded-documents');
      if (uploadedDocumentsDiv) {
        uploadedDocumentsDiv.textContent = `${this.selectedFile.name}`;
      }
      // closes the popup
      this.callUploadDoc = false;
      const popupWrapper = document.querySelector(".selectDocumentPopUp") as HTMLElement;
      setTimeout(() => {
        if (popupWrapper) {
          popupWrapper.style.display = 'none';
        } else {
          console.error('Element with class not found');
        }
      }, 0)
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

    // If validation errors exist, stop the process
    if (this.hasValidationErrors) {
      this.showErrorAlert(constants.Firm_CoreDetails_Messages.FIRMSAVEERROR);
      this.isLoading = false;
      return;
    }

    if (this.selectedFile) {
      const intranetSitePath = 'https://ictmds.sharepoint.com/sites/QFCRA';
      const filePathAfterDocLib = "";
      const strfileName = this.selectedFile.name;
      const strUserEmailAddress = 'k.thomas@ictmds.onmicrosoft.com';

      this.sharepointService.uploadFileToSharepoint(this.selectedFile, intranetSitePath, filePathAfterDocLib, strfileName, strUserEmailAddress).subscribe({
        next: (response: SharePointUploadResponse) => {
          console.log('File uploaded successfully', response);

          const [fileLocation, intranetGuid] = response.result.split(';');
          let documentObj: any;
          // Scope Of Authorisation (Scope Authorised)
          if (this.activeTab === this.Page.Scope && this.tabIndex === 1) {
            docu
            mentObj = this.prepareDocumentObject(this.userId, fileLocation, intranetGuid, constants.DocType.SCOPE, this.Page.Scope, this.fetchedScopeDocSubTypeID.DocSubTypeID, this.ActivityAuth[0].FirmScopeID, this.ActivityAuth[0].ScopeRevNum);
            // Press Release (Core Detail)
          } else if (this.activeTab === this.Page.CoreDetail) {
            documentObj = this.prepareDocumentObject(this.userId, fileLocation, intranetGuid, constants.DocType.FIRM_DOCS, this.Page.CoreDetail, this.fetchedCoreDetailDocSubTypeID.DocSubTypeID, this.firmAppDetailsCurrentAuthorized.FirmApplStatusID, 1);
          }
          this.saveDocument(documentObj);

          const uploadedDocumentsDiv = document.getElementById('uploaded-documents');
          if (uploadedDocumentsDiv) {
            uploadedDocumentsDiv.textContent = `${this.selectedFile.name}`;
          }
          // closes the popup
          this.callUploadDoc = false;
          const popupWrapper = document.querySelector(".selectDocumentPopUp") as HTMLElement;
          setTimeout(() => {
            if (popupWrapper) {
              popupWrapper.style.display = 'none';
            } else {
              console.error('Element with class not found');
            }
          }, 0)
          this.uploadFileSuccess(constants.DocumentAttechment.saveDocument);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error occurred during file upload', err);
          this.showErrorAlert(constants.MessagesLogForm.ERROR_UPLOADING_FILE);
          this.isLoading = false;
          // Handle the error (e.g., display error message)
        }
      });
    } else {
      console.error('No valid PDF file selected.');
      this.isLoading = false;
    }
  }

  // deleteDocument(
  //   docID: number,
  //   objectId: number,
  //   objectInstanceId: number,
  //   objectInstanceRevNum: number,
  //   postDeleteCallback: () => void // Accept a callback function
  // ): Observable<any> {
  //   return this.objectWF.deleteDocument(docID, objectId, objectInstanceId, objectInstanceRevNum).pipe(
  //     tap(response => {
  //       console.log('Document deleted successfully:', response);
  //       postDeleteCallback(); // Call the callback after deletion
  //     })
  //   );
  // }

  deleteDocument(
    docID: number,
    objectId: number,
    objectInstanceId: number,
    objectInstanceRevNum: number,
    postDeleteCallback: () => void // Accept a callback function
  ): Observable<any> {
    return this.objectWF.deleteDocument(docID, objectId, objectInstanceId, objectInstanceRevNum).pipe(
      tap(response => {
        console.log('Document deleted successfully:', response);
        postDeleteCallback(); // Call the callback after deletion
      })
    );
  }

  showUploadConfirmation() {
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

  // fetchSubTypeDocIDs() {
  //   this.securityService.getObjectTypeTable(constants.docSubTypes).subscribe(data => {
  //     // Scope Of Authorsation in Scope Authorised
  //     this.fetchedScopeDocSubTypeID = data.response.find((item: { DocSubTypeID: number }) =>
  //       item.DocSubTypeID === 262
  //     );
  //     // Press Release in Core Detail
  //     this.fetchedCoreDetailDocSubTypeID = data.response.find((item: { DocSubTypeID: number }) =>
  //       item.DocSubTypeID === 263
  //     );
  //   });
  // }


  fetchSubTypeDocIDs(docSubTypeIDs: number[]): Observable<any[]> {
    return this.securityService.getObjectTypeTable(constants.docSubTypes).pipe(
      map(data => {
        return docSubTypeIDs.map(id => 
          data.response.find((item: { DocSubTypeID: number }) => item.DocSubTypeID === id)
        );
      })
    );
  }
  
  prepareDocumentObject(userId: number, fileLocation: string, intranetGuid: string, docType: number, objectId: number, docSubTypeID: number, objectInstanceID: number, objectInstanceRevNum: number) {
    return {
      userId: userId,
      docID: null,
      referenceNumber: null,
      fileName: this.selectedFile.name,
      fileNumber: this.newfileNum.toString(),
      firmId: this.firmId,
      otherFirm: null,
      docTypeID: docType,
      loggedBy: userId,
      loggedDate: this.currentDate,
      receivedBy: userId,
      receivedDate: this.currentDate,
      docRecieptMethodID: constants.LogFormRecieptMethods.InternalDocument,
      checkPrimaryDocID: true,
      fileLocation: fileLocation,
      docAttributeID: null,
      intranetGuid: intranetGuid,
      objectID: objectId,
      objectInstanceID: objectInstanceID,
      objectInstanceRevNum: objectInstanceRevNum,
      docSubType: docSubTypeID
    };
  }

  getNewFileNumber() {
    this.logForm.getNewFileNumber(this.firmId, this.currentDate).subscribe(data => {
      this.newfileNum = data.response.Column1;
    }, error => {
      console.error(error);
    })
  }
  
  saveDocument(documentObj: any, callback?: () => void) {
    this.isLoading = true;
    this.objectWF.insertDocument(documentObj).subscribe(
      response => {
        console.log('Document saved successfully:', response);
  
        // Call the callback function if provided
        if (callback) {
          callback();
        }
  
        this.isLoading = false;
      },
      error => {
        console.error('Error saving document:', error);
        this.isLoading = false;
      }
    );
  }
  

  getErrorMessages(fieldName: string, msgKey: number, activity?: any, placeholderValue?: string) {
    this.logForm.errorMessages(msgKey).subscribe(
      (response) => {
        let errorMessage = response.response;
        // If a placeholder value is provided, replace the placeholder with the actual value
        if (placeholderValue) {
          errorMessage = errorMessage.replace("#Date#", placeholderValue).replace("##DateFieldLabel##", placeholderValue).replace("#ApplicationDate#", placeholderValue);
        }
        this.errorMessages[fieldName] = errorMessage;
        activity.errorMessages[fieldName] = errorMessage;
      },
      (error) => {
        console.error(`Failed to load error message for ${fieldName}.`, error);
      }
    );
  }

  showErrorAlert(messageKey: number) {
    this.logForm.errorMessages(messageKey).subscribe(
      (response) => {
        Swal.fire({
          text: response.response,
          icon: 'error',
          confirmButtonText: 'Ok',
        });
      },
    );
    this.isLoading = false;
  }

}
