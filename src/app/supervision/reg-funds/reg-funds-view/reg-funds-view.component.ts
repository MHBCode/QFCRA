import { Component, EventEmitter, Input, Output, ChangeDetectorRef, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { ReturnReviewService } from 'src/app/ngServices/return-review.service';
import { SupervisionService } from '../../supervision.service';
import { SecurityService } from 'src/app/ngServices/security.service';
import { LogformService } from 'src/app/ngServices/logform.service';
import * as constants from 'src/app/app-constants';
import { FirmDetailsService } from 'src/app/firms/firmsDetails.service';
import { ActivatedRoute } from '@angular/router';
import { RegisteredfundService } from 'src/app/ngServices/registeredfund.service';
import { Bold, ClassicEditor, Essentials, Font, FontColor, FontSize, Heading, Indent, IndentBlock, Italic, Link, List, MediaEmbed, Paragraph, Table, Undo } from 'ckeditor5';
import Swal from 'sweetalert2';
import { ObjectwfService } from 'src/app/ngServices/objectwf.service';
import { FlatpickrService } from 'src/app/shared/flatpickr/flatpickr.service';
import { SanitizerService } from 'src/app/shared/sanitizer-string/sanitizer.service';
import { SafeHtml } from '@angular/platform-browser';
import { tap } from 'rxjs';
import { FrimsObject } from 'src/app/app-constants';

@Component({
  selector: 'app-reg-funds-view',
  templateUrl: './reg-funds-view.component.html',
  styleUrls: ['./reg-funds-view.component.scss', '../../../shared/popup.scss', '../../supervision.scss']
})
export class RegFundsViewComponent {
  @Input() reg: any;
  @Input() firmId: any;
  @Input() firmDetails: any;
  @Output() closeRegPopup = new EventEmitter<void>();
  @Output() fundDeleted = new EventEmitter<void>();
  isEditable: boolean = false;
  isLoading: boolean = true;
  userId = 30;
  RegisteredFundDetials: any = [];
  RegisteredFundStatusDetials: any = [];
  TypeOfFunddropdown: any;
  RFFundStatusdropdown: any;
  SubFundData: any;
  now = new Date();
  currentDate = this.now.toISOString();
  currentDateOnly = new Date(this.currentDate).toISOString().split('T')[0];

  //Documents
  regFundsDoc: any[] = [];
  fetchedDocumentTypes: any = [];
  fileLocation: string = '';
  FileLoc: string = '';
  documentObj: any;
  // selectedFiles: File[] = [];
  newfileNum: number;
  selectedFile: File | null = null;
  fileError: string = '';

  Page = FrimsObject;


  @ViewChildren('dateInputs') dateInputs!: QueryList<ElementRef<HTMLInputElement>>;

  // Validations
  hasValidationErrors: boolean = false;
  errorMessages: { [key: string]: string } = {};


  constructor(
    private returnReviewService: ReturnReviewService,
    private supervisionService: SupervisionService,
    private securityService: SecurityService,
    private route: ActivatedRoute,
    private logForm: LogformService,
    private registeredFundService: RegisteredfundService,
    private firmDetailsService: FirmDetailsService,
    private objectwfService: ObjectwfService,
    private flatpickrService: FlatpickrService,
    private sanitizerService: SanitizerService,

  ) {

  }
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
      //this.isFirmAuthorised();
    });
    console.log(this.reg)
    //this.loadAssignedUserRoles();
    this.getTypeOfFunddropdown();
    this.getRFFundStatusdropdown();
    this.getRegisteredFundDetail();
    this.initializeDefaults();
    this.loadDocuments();
  }
  ngAfterViewInit() {
    this.dateInputs.changes.subscribe(() => {
      this.flatpickrService.initializeFlatpickr(this.dateInputs.toArray());
    });
    this.flatpickrService.initializeFlatpickr(this.dateInputs.toArray());
  }
  onClose(): void {
    this.closeRegPopup.emit();
  }

  cancelReg() {
    this.isEditable = false;
    this.getRegisteredFundDetail();
  }

  getRegisteredFundDetail() {
    this.isLoading = true;

    const RegisteredFundID = this.reg.RegisteredFundID;
    const firmId = this.firmId;
    const userId = this.userId;

    this.registeredFundService.getFIRMRegisteredFundDetials(userId, firmId, RegisteredFundID).subscribe({
      next: (res) => {
        // Assign full response to firmRevDetails
        this.RegisteredFundDetials = res.response;
        console.log("RegisteredFundDetials", this.RegisteredFundDetials)
        if (this.RegisteredFundDetials && this.RegisteredFundDetials[0].RegisteredFundTypeID) {
          this.typeOfFundID = this.RegisteredFundDetials[0].RegisteredFundTypeID;
          console.log('Initialized typeOfFundID with original ID:', this.typeOfFundID);
        }
        this.getRegisteredFundStatus();
        this.getSubFundData();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching return review details:', error);
      },
    });
  }
  getRegisteredFundStatus() {
    const RegisteredFundID = this.reg.RegisteredFundID;
    this.registeredFundService.getRegisteredFundStatus(RegisteredFundID).subscribe({
      next: (res) => {
        // Assign full response to firmRevDetails
        this.RegisteredFundStatusDetials = res.response;
        console.log("RegisteredFundStatusDetials", this.RegisteredFundStatusDetials)
      },
      error: (error) => {
        console.error('Error fetching return review details:', error);
      },
    });
  }

  getSubFundData() {
    const RegisteredFundID = this.reg.RegisteredFundID;
    this.registeredFundService.getSubFundData(RegisteredFundID).subscribe({
      next: (res) => {
        this.SubFundData = res.response; // Assign the response
        console.log('SubFundData:', this.SubFundData);
      },
      error: (error) => {
        console.error('Error fetching sub-fund data:', error);
      },
    });
  }
  addSubFund() {
    if (!this.SubFundData) {
      this.SubFundData = [];
    }
    this.SubFundData.push({
      subFundID: 0, // Set to 0 for new items
      subFundName: "",
      dateFrom: "",
      dateTo: "",
      FirmID: this.firmId,
      typeOfSubFund: "",
      userID: this.userId,
    });
  }

  // Remove a Sub-Fund
  removeSubFund(index: number) {
    this.SubFundData.splice(index, 1);
  }
  confirmDeleteRegisteredFund() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Are you sure you want to delete this record ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteRegisteredFund();
      }
    });
  }

  deleteRegisteredFund() {
    const RegisteredFundID = this.reg.RegisteredFundID;
    this.isLoading = true; // Optionally show a loader
    this.registeredFundService.deleteRegisteredFund(RegisteredFundID).subscribe({
      next: (res) => {
        this.isLoading = false;
        Swal.fire(
          'Deleted!',
          'Registered Fund has been deleted successfully.',
          'success'
        );
        this.onClose();
        this.fundDeleted.emit();
      },
      error: (error) => {
        this.isLoading = false;
        Swal.fire(
          'Error!',
          'Error occurred while deleting the Registered Fund details.',
          'error'
        );
        console.error('Error deleting RegisteredFund', error);
      },
    });
  }




  public Editor = ClassicEditor;

  public config = {
    toolbar: [
      'undo', 'redo', '|',
      'heading', '|', 'bold', 'italic', '|',
      'fontSize', 'fontColor', '|',
      'link', 'insertTable', 'mediaEmbed', '|',
      'bulletedList', 'numberedList', 'indent', 'outdent'
    ],
    plugins: [
      Bold,
      Essentials,
      Heading,
      Indent,
      IndentBlock,
      Italic,
      Link,
      List,
      MediaEmbed,
      Paragraph,
      Table,
      Undo,
      Font,
      FontSize,
      FontColor
    ],
    licenseKey: ''
  };
  getTypeOfFunddropdown() {
    this.isLoading = true
    const userId = this.userId;
    const dropdown = constants.TypeOfFund;
    const OpTypeId = constants.ObjectOpType.Create;

    this.securityService.getObjectTypeTable(userId, dropdown, OpTypeId).subscribe({
      next: (res) => {
        // Assign full response to firmRevDetails
        this.TypeOfFunddropdown = res.response;
        console.log("TypeOfFunddropdown", this.TypeOfFunddropdown)
      },
      error: (error) => {
        console.error('Error fetching return review details:', error);

      },
    });
  }
  getRFFundStatusdropdown() {
    const userId = this.userId;
    const dropdown = constants.RFFundStatus;
    const OpTypeId = constants.ObjectOpType.Create;

    this.securityService.getObjectTypeTable(userId, dropdown, OpTypeId).subscribe({
      next: (res) => {
        // Assign full response to firmRevDetails
        this.RFFundStatusdropdown = res.response;
        console.log("RFFundStatusdropdown", this.RFFundStatusdropdown)
      },
      error: (error) => {
        console.error('Error fetching return review details:', error);
      },
    });
  }

  editRegFunds() {
    this.isEditable = true
    this.getDocumentTypes();
  }

  editlstSubFunds = {
    lstSubFunds: [
      {
        subFundID: 0,
        subFundName: "",
        dateFrom: "",
        dateTo: "",
        typeOfSubFund: "",
        itemIndex: 0,
      },
    ],
  };

  async validateRegFunds(): Promise<boolean> {
    this.hasValidationErrors = false;

    if (this.typeOfFundID == null || this.typeOfFundID == undefined || this.typeOfFundID == constants.TEXT_ZERO) {
      this.loadErrorMessages('FundType', constants.Specify_Valid_Response, 'Type of Fund');
      this.hasValidationErrors = true;
    }
    if (this.RegisteredFundDetials[0].FundName == null || this.RegisteredFundDetials[0].FundName == '' || this.RegisteredFundDetials[0].FundName == undefined) {
      this.loadErrorMessages('FundName', constants.Specify_Valid_Response, 'Fund Name');
      this.hasValidationErrors = true;
    }
    if (this.RegisteredFundDetials[0].RegisteredFundStatusTypeDesc == '' || this.RegisteredFundDetials[0].RegisteredFundStatusTypeDesc == undefined || this.RegisteredFundDetials[0].RegisteredFundStatusTypeDesc == null) {
      this.loadErrorMessages('FundStatus', constants.Specify_Valid_Response, 'Status');
      this.hasValidationErrors = true;
    }
    if (this.RegisteredFundDetials[0].RegisteredFundStatusDate == null || this.RegisteredFundDetials[0].RegisteredFundStatusDate == '') {
      this.loadErrorMessages('StatusDate', constants.InvoicesMessages.INVALID_DATA, 'StatusDate');
      this.hasValidationErrors = true;
    }
    return !this.hasValidationErrors;
  }
  async SaveUpdateRegFunds() {
    this.isLoading = true;
    const isValid = await this.validateRegFunds();

    if (!isValid) {
      this.supervisionService.showErrorAlert(constants.MessagesLogForm.ENTER_REQUIREDFIELD_PRIORSAVING, 'error');
      this.isLoading = false;
      return; // Prevent further action if validation fails or the user cancels
    }

    const saveUpdateRegisteredFundObj = {
      objRF: {
        registeredFundID: this.RegisteredFundDetials[0].RegisteredFundID,
        FirmID: this.firmId,
        firmName: this.firmDetails.firmName,
        typeOfFundID: this.typeOfFundID || 1,
        fundNumber: this.RegisteredFundDetials[0].RegisteredFundNumber,
        typeOFFundDesc: "",
        fundName: this.RegisteredFundDetials[0].FundName,
        userID: this.userId,
        createdByName: this.RegisteredFundDetials[0].CreatedByName,
        createdByDate: "",
        rfNotes: this.RegisteredFundDetials[0].RegisteredFundNotes,
        previousName: this.RegisteredFundDetials[0].PreviousNames,
        otherEntities: this.RegisteredFundDetials[0].OtherRelatedEntityName,
        lastModifiedByName: this.RegisteredFundDetials[0].LastModifiedByName,
        lastModifieDate: this.currentDate,
        registeredFundStatusTypeID: this.registeredFundStatusTypeID || 1,
        registeredFundStatusTypeDesc: this.RegisteredFundDetials[0].RegisteredFundStatusTypeDesc,
        registeredFundStatusDate: this.RegisteredFundDetials[0].RegisteredFundStatusDate,
        registeredFundStatusID: this.RegisteredFundDetials[0].RegisteredFundStatusID,
        statusSetByName: "",
        statusSetDate: ""
      },
      lstSubFunds: this.SubFundData
    }
    console.log("RegisteredFund object to be save", saveUpdateRegisteredFundObj)

    this.registeredFundService.saveUpdateRegisteredFund(saveUpdateRegisteredFundObj).subscribe({
      next: (res) => {

        console.log("Registered Fund saved successfully")
        this.firmDetailsService.showSaveSuccessAlert(constants.RegisteredFund_Messages.RegisteredFund_Saved_SUCCESSFULLY);
        this.onClose();
        this.fundDeleted.emit();
      },
      error: (error) => {
        console.error('Error saving Registered Fund:', error);
      },
    });
  }

  initializeDefaults(): void {
    this.RegisteredFundDetials.forEach((detail) => {
      // Ensure RegisteredFundTypeID is set
      if (!detail.RegisteredFundTypeID && this.TypeOfFunddropdown.length > 0) {
        const defaultType = this.TypeOfFunddropdown.find(
          (option) => option.RegisteredFundTypeDesc === detail.RegisteredFundTypeDesc
        );
        detail.RegisteredFundTypeID = defaultType?.RegisteredFundTypeID || this.TypeOfFunddropdown[0].RegisteredFundTypeID;
      }

      // Ensure RegisteredFundStatusTypeID is set
      if (!detail.RegisteredFundStatusTypeID && this.RFFundStatusdropdown.length > 0) {
        const defaultStatus = this.RFFundStatusdropdown.find(
          (option) => option.RegisteredFundStatusTypeDesc === detail.RegisteredFundStatusTypeDesc
        );
        detail.RegisteredFundStatusTypeID =
          defaultStatus?.RegisteredFundStatusTypeID || this.RFFundStatusdropdown[0].RegisteredFundStatusTypeID;
      }
    });
  }

  typeOfFundID: number | null = null;
  onFundTypeChange(event: Event, RegFundDetials: any): void {
    const selectedDesc = (event.target as HTMLSelectElement).value;

    // Find the corresponding ID
    const selectedOption = this.TypeOfFunddropdown.find(
      (option) => option.RegisteredFundTypeDesc === selectedDesc
    );

    if (selectedOption) {
      RegFundDetials.RegisteredFundTypeID = selectedOption.RegisteredFundTypeID;
      this.typeOfFundID = selectedOption.RegisteredFundTypeID; // Store in typeOfFundID
      console.log('Selected ID stored in typeOfFundID:', this.typeOfFundID);
    } else {
      console.warn('No matching ID found for description:', selectedDesc);
      this.typeOfFundID = null; // Reset if no match
    }
  }
  registeredFundStatusTypeID: number | null = null;
  onSatusTypeChange(event: Event, RegFundDetials: any): void {
    const selectedDesc = (event.target as HTMLSelectElement).value;

    // Find the corresponding ID
    const selectedOption = this.RFFundStatusdropdown.find(
      (option) => option.RegisteredFundStatusTypeDesc === selectedDesc
    );

    if (selectedOption) {
      RegFundDetials.RegisteredFundStatusTypeID = selectedOption.RegisteredFundStatusTypeID;
      this.registeredFundStatusTypeID = selectedOption.RegisteredFundStatusTypeID; // Store in typeOfFundID
      console.log('Selected ID stored in typeOfFundID:', this.registeredFundStatusTypeID);
    } else {
      console.warn('No matching ID found for description:', selectedDesc);
      this.registeredFundStatusTypeID = null; // Reset if no match
    }
  }
  ///// docs 
  loadDocuments() {
    this.objectwfService.getDocument(this.Page.RegisteredFunds, this.reg?.RegisteredFundID, 1).pipe(
    ).subscribe(
      data => {
        this.regFundsDoc = data.response;
        this.FileLoc = '';

        this.logForm.constructDocUrl(this.regFundsDoc).subscribe(
          response => {
            if (response) {
              this.regFundsDoc = this.regFundsDoc.map((doc, index) => ({
                ...doc,
                fileLoc: response.response[index]?.fileLoc || ''
              }));
            }
          },
          error => {
            console.error('Error constructing document URL:', error);
          }
        );
      },
      error => {
        console.error('Error loading document:', error);
        this.regFundsDoc = [];
      }
    );
  }

  getDocumentTypes() {
    const docTypeId = constants.FrimsObject.RegisteredFunds;
    this.objectwfService.getDocumentType(docTypeId).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.fetchedDocumentTypes = res.response;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error deleting RegisteredFund', error);
      },
    });
  }

  async onDocumentUploaded(uploadedDocument: any) {
    this.isLoading = true;

    try {
      // Call getNewFileNumber and wait for it to complete
      await this.getNewFileNumber().toPromise();

      // Continue with the rest of the code after getNewFileNumber completes
      const { fileLocation, intranetGuid } = uploadedDocument;
      this.documentObj = this.prepareDocumentObject(
        this.userId,
        fileLocation,
        intranetGuid,
        constants.DocType.RegisteredFund,
        this.Page.RegisteredFunds,
        this.fetchedDocumentTypes.DocSubTypeID,
        this.reg?.RegisteredFundID,
        1 // constant
      );

      this.objectwfService.insertDocument(this.documentObj).subscribe(
        response => {
          this.loadDocuments();
          this.isLoading = false;
        },
        error => {
          console.error('Error updating enforcement attachment:', error);
          this.isLoading = false;
        }
      );
    } catch (error) {
      console.error('Error in getNewFileNumber:', error);
      this.isLoading = false;
    }
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
    return this.logForm.getNewFileNumber(this.firmId, this.currentDate).pipe(
      tap(data => {
        this.newfileNum = data.response.Column1;
      })
    );
  }


  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizerService.sanitizeHtml(html);
  }
  loadErrorMessages(fieldName: string, msgKey: number, placeholderValue?: string) {
    this.supervisionService.getErrorMessages(fieldName, msgKey, null, placeholderValue).subscribe(
      () => {
        this.errorMessages[fieldName] = this.supervisionService.errorMessages[fieldName];
      },
      error => {
        console.error(`Error loading error message for ${fieldName}:`, error);
      }
    );
  }
}
