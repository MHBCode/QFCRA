import { Component, EventEmitter, Input, Output,ChangeDetectorRef, ElementRef, QueryList, ViewChildren } from '@angular/core';
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
import { FlatpickrService } from 'src/app/shared/flatpickr/flatpickr.service';

@Component({
  selector: 'app-reg-funds-create',
  templateUrl: './reg-funds-create.component.html',
  styleUrls: ['./reg-funds-create.component.scss','../../../shared/popup.scss', '../../supervision.scss']
})
export class RegFundsCreateComponent {
  @Input() firmId: any;
  @Input() firmDetails: any;
  @Output() closeCreatePopup = new EventEmitter<void>();
  @Output() fundDeleted = new EventEmitter<void>();
  userId = 30;
  TypeOfFunddropdown : any ;
  isLoading: boolean = false;
  RFFundStatusdropdown : any ;
  @ViewChildren('dateInputs') dateInputs!: QueryList<ElementRef<HTMLInputElement>>;
  now = new Date();
  currentDate = this.now.toISOString();
  currentDateOnly = new Date(this.currentDate).toISOString().split('T')[0];

   // Validations
   hasValidationErrors: boolean = false;
   errorMessages: { [key: string]: string } = {};

  constructor(
    private returnReviewService: ReturnReviewService,
    private supervisionService: SupervisionService,
    private securityService: SecurityService,
    private route: ActivatedRoute,
    private logForm : LogformService,
    private registeredFundService: RegisteredfundService,
    private flatpickrService: FlatpickrService,
    private firmDetailsService: FirmDetailsService,
  ) {

  }
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
      //this.isFirmAuthorised();
    });
    this.getTypeOfFunddropdown();
    this.getRFFundStatusdropdown();
    this.updateInitialSubFundFirmId();
  }
  updateInitialSubFundFirmId() {
    // Ensure FirmID in the first subFund matches this.firmId
    this.createRegFundsObj.lstSubFunds[0].FirmID = this.firmId;
    this.createRegFundsObj.lstSubFunds[0].userID = this.userId;
  }
  ngAfterViewInit() {
    this.dateInputs.changes.subscribe(() => {
      this.flatpickrService.initializeFlatpickr(this.dateInputs.toArray());
    });
    this.flatpickrService.initializeFlatpickr(this.dateInputs.toArray());
  }
  onClose(): void {
    this.closeCreatePopup.emit();
  }
  getTypeOfFunddropdown(){
    const userId = this.userId;
    const dropdown = constants.TypeOfFund;
    const OpTypeId = constants.ObjectOpType.Create;

    this.securityService.getObjectTypeTable(userId,dropdown,OpTypeId).subscribe({
      next: (res) => {
        // Assign full response to firmRevDetails
        this.TypeOfFunddropdown = res.response;
        console.log("TypeOfFunddropdown",this.TypeOfFunddropdown)
        this.isLoading=false;
      },
      error: (error) => {
        console.error('Error fetching return review details:', error);
        this.isLoading=false;
      },
    });
  }
  getRFFundStatusdropdown(){
    const userId = this.userId;
    const dropdown = constants.RFFundStatus;
    const OpTypeId = constants.ObjectOpType.Create;

    this.securityService.getObjectTypeTable(userId,dropdown,OpTypeId).subscribe({
      next: (res) => {
        // Assign full response to firmRevDetails
        this.RFFundStatusdropdown = res.response;
        console.log("RFFundStatusdropdown",this.RFFundStatusdropdown)
        this.isLoading=false;
      },
      error: (error) => {
        console.error('Error fetching return review details:', error);
        this.isLoading=false;
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
  createRegFundsObj = {
    FirmID: 0,
    firmName: "",
    typeOfFundID: 0,
    typeOFFundDesc: "",
    fundName: "",
    previousName: "",
    otherEntities: "",
    rfNotes: "", // Notes field bound to CKEditor
    userID: 0,
    createdByName: "",
    createdByDate: "",
    lastModifiedByName: "",
    lastModifieDate: "",
    registeredFundStatusTypeID: 0,
    registeredFundStatusTypeDesc: "",
    registeredFundStatusDate: "",
    registeredFundStatusID: 0,
    statusSetByName: "",
    statusSetDate: "",
    lstSubFunds: [
      {
        subFundID: null,
        subFundName: "",
        dateFrom: "",
        dateTo: "",
        typeOfSubFund: "",
        FirmID:0,
        itemIndex: 0,
        userID: 0,
      },
    ],
  };
  async validateRegFunds(): Promise<boolean> {
    this.hasValidationErrors = false;

    if(this.typeOfFundID == null || this.typeOfFundID == undefined ||this.typeOfFundID == constants.TEXT_ZERO){
      this.loadErrorMessages('FundType', constants.Specify_Valid_Response, 'Type of Fund');
      this.hasValidationErrors = true;
    }
    if(this.createRegFundsObj.fundName == null || this.createRegFundsObj.fundName == '' || this.createRegFundsObj.fundName == undefined){
      this.loadErrorMessages('FundName', constants.Specify_Valid_Response, 'Fund Name');
      this.hasValidationErrors = true;
    }
    if(this.createRegFundsObj.registeredFundStatusTypeID == null || this.createRegFundsObj.registeredFundStatusTypeID == undefined ){
      this.loadErrorMessages('FundStatus', constants.Specify_Valid_Response, 'Status');
      this.hasValidationErrors = true;
    }
    if(this.createRegFundsObj.registeredFundStatusDate == null || this.createRegFundsObj.registeredFundStatusDate == ''){
      this.loadErrorMessages('StatusDate', constants.InvoicesMessages.INVALID_DATA, 'StatusDate');
      this.hasValidationErrors = true;
    }
    return !this.hasValidationErrors;
  }
 async createUpdateRegFunds(){
    const isValid =  await this.validateRegFunds();

    if (!isValid) {
      this.supervisionService.showErrorAlert(constants.MessagesLogForm.ENTER_REQUIREDFIELD_PRIORSAVING, 'error');
      this.isLoading = false;
      return; 
    }
   const saveUpdateRegisteredFundObj = {
      objRF: {
        registeredFundID: null,
        FirmID: this.firmId,
        firmName: this.createRegFundsObj.firmName,
        typeOfFundID: this.createRegFundsObj.typeOfFundID,
        fundNumber: null,
        typeOFFundDesc: "",
        fundName: this.createRegFundsObj.fundName,
        previousName: this.createRegFundsObj.previousName,
        otherEntities: this.createRegFundsObj.otherEntities,
        rfNotes: this.createRegFundsObj.rfNotes,
        userID: this.userId,
        createdByName: "",
        createdByDate: "",
        lastModifiedByName: "",
        lastModifieDate: this.currentDate,
        registeredFundStatusTypeID: this.createRegFundsObj.registeredFundStatusTypeID,
        registeredFundStatusTypeDesc: "",
        registeredFundStatusDate: "",
        registeredFundStatusID: null,
        statusSetByName: "",
        statusSetDate: ""
      },
      lstSubFunds: this.createRegFundsObj.lstSubFunds
    }
    console.log("RegisteredFund object to be save",saveUpdateRegisteredFundObj)
    this.isLoading = true;
    this.registeredFundService.saveUpdateRegisteredFund(saveUpdateRegisteredFundObj).subscribe({
      next: (res) => {
        
        console.log("Registered Fund saved successfully")
        this.isLoading=false;
        this.firmDetailsService.showSaveSuccessAlert(constants.RegisteredFund_Messages.RegisteredFund_Saved_SUCCESSFULLY);
        this.onClose();
        this.fundDeleted.emit();
      },
      error: (error) => {
        console.error('Error saving Registered Fund:', error);
        this.isLoading=false;
      },
    });
  }
  addSubFund() {
    this.createRegFundsObj.lstSubFunds.push({
      subFundID: null,
      subFundName: "",
      dateFrom: "",
      dateTo: "",
      FirmID: this.firmId,
      typeOfSubFund: "",
      itemIndex: this.createRegFundsObj.lstSubFunds.length,
      userID: this.userId,
    });
  }
  removeSubFund(index: number) {
    this.createRegFundsObj.lstSubFunds.splice(index, 1);
  }
//   typeOfFundID: number | null = null; 
// onFundTypeChange(event: Event, RegFundDetials: any): void {
//   const selectedDesc = (event.target as HTMLSelectElement).value;

//   // Find the corresponding ID
//   const selectedOption = this.TypeOfFunddropdown.find(
//     (option) => option.RegisteredFundTypeDesc === selectedDesc
//   );

//   if (selectedOption) {
//     RegFundDetials.RegisteredFundTypeID = selectedOption.RegisteredFundTypeID;
//     this.typeOfFundID = selectedOption.RegisteredFundTypeID; // Store in typeOfFundID
//     console.log('Selected ID stored in typeOfFundID:', this.typeOfFundID);
//   } else {
//     console.warn('No matching ID found for description:', selectedDesc);
//     this.typeOfFundID = null; // Reset if no match
//   }
// }
typeOfFundID: number | null = null;

onFundTypeChange(event: Event, createRegFundsObj: any): void {
  const selectedID = +(event.target as HTMLSelectElement).value; // Get the selected ID as a number

  if (selectedID) {
    const selectedOption = this.TypeOfFunddropdown.find(
      (option) => option.RegisteredFundTypeID === selectedID
    );

    if (selectedOption) {
      createRegFundsObj.typeOfFundID = selectedOption.RegisteredFundTypeID;
      createRegFundsObj.RegisteredFundTypeDesc = selectedOption.RegisteredFundTypeDesc;
      this.typeOfFundID = selectedOption.RegisteredFundTypeID;
      console.log('Selected ID stored in typeOfFundID:', this.typeOfFundID);
    }
  } else {
    console.warn('No valid ID selected');
    createRegFundsObj.typeOfFundID = null;
    createRegFundsObj.RegisteredFundTypeDesc = null;
    this.typeOfFundID = null; // Reset if no valid selection
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

