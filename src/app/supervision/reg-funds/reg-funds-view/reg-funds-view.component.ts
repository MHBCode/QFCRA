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
import {ObjectwfService} from 'src/app/ngServices/objectwf.service';
import { FlatpickrService } from 'src/app/shared/flatpickr/flatpickr.service';

@Component({
  selector: 'app-reg-funds-view',
  templateUrl: './reg-funds-view.component.html',
  styleUrls: ['./reg-funds-view.component.scss' ,'../../../shared/popup.scss', '../../supervision.scss']
})
export class RegFundsViewComponent {
  @Input() reg: any;
  @Input() firmId: any;
  @Input() firmDetails: any;
  @Output() closeRegPopup = new EventEmitter<void>();
  @Output() fundDeleted = new EventEmitter<void>();
  isEditable: boolean = false;
  isLoading: boolean = false;
  userId = 30;
  RegisteredFundDetials:any =[];
  RegisteredFundStatusDetials:any = [];
  TypeOfFunddropdown : any ;
  RFFundStatusdropdown : any ;
  now = new Date();
  currentDate = this.now.toISOString();
  currentDateOnly = new Date(this.currentDate).toISOString().split('T')[0];
  @ViewChildren('dateInputs') dateInputs!: QueryList<ElementRef<HTMLInputElement>>;
  constructor(
    private returnReviewService: ReturnReviewService,
    private supervisionService: SupervisionService,
    private securityService: SecurityService,
    private route: ActivatedRoute,
    private logForm : LogformService,
    private registeredFundService: RegisteredfundService,
    private firmDetailsService: FirmDetailsService,
    private objectwfService: ObjectwfService,
    private flatpickrService: FlatpickrService,

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
    this.getDocumentType();
    this.initializeDefaults();
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
  getRegisteredFundDetail(){
    this.isLoading=true;
     
    const  RegisteredFundID= this.reg.RegisteredFundID;
    const  firmId= this.firmId;
    const  userId= this.userId;
  
    this.registeredFundService.getFIRMRegisteredFundDetials(userId,firmId,RegisteredFundID).subscribe({
      next: (res) => {
        // Assign full response to firmRevDetails
        this.RegisteredFundDetials = res.response;
        console.log("RegisteredFundDetials",this.RegisteredFundDetials)
        this.getRegisteredFundStatus();
        this.getSubFundData();
        this.isLoading=false;
      },
      error: (error) => {
        console.error('Error fetching return review details:', error);
        this.isLoading=false;
      },
    });
  }
  getRegisteredFundStatus(){
    const  RegisteredFundID= this.reg.RegisteredFundID;
    this.registeredFundService.getRegisteredFundStatus(RegisteredFundID).subscribe({
      next: (res) => {
        // Assign full response to firmRevDetails
        this.RegisteredFundStatusDetials = res.response;
        console.log("RegisteredFundStatusDetials",this.RegisteredFundStatusDetials)
        this.isLoading=false;
      },
      error: (error) => {
        console.error('Error fetching return review details:', error);
        this.isLoading=false;
      },
    });
  }
  SubFundData : any;
  getSubFundData() {
    const RegisteredFundID = this.reg.RegisteredFundID;
    this.registeredFundService.getSubFundData(RegisteredFundID).subscribe({
      next: (res) => {
        this.SubFundData = res.response; // Assign the response
        console.log('SubFundData:', this.SubFundData);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching sub-fund data:', error);
        this.isLoading = false;
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
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!'
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
  editRegFunds() {
    
    this.isEditable = true
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
  // fundName: this..fundName,
  //        previousName: this..previousName,
  //        otherEntities: this..otherEntities,
  //        rfNotes: this..rfNotes,
  SaveUpdateRegFunds(){
    const saveUpdateRegisteredFundObj = {
       objRF: {
         registeredFundID: this.RegisteredFundDetials[0].RegisteredFundID,
         FirmID: this.firmId,
         firmName: this.firmDetails.firmName,
         typeOfFundID: this.typeOfFundID || 1,
         fundNumber: this.RegisteredFundDetials[0].RegisteredFundNumber,
         typeOFFundDesc: "",
         fundName : this.RegisteredFundDetials[0].FundName,
         userID: this.userId,
         createdByName: this.RegisteredFundDetials[0].CreatedByName,
         createdByDate: "",
         rfNotes: this.RegisteredFundDetials[0].RegisteredFundNotes,
         previousName:this.RegisteredFundDetials[0].PreviousNames,
         otherEntities:this.RegisteredFundDetials[0].OtherRelatedEntityName,
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
DocumentTypeList :any;
getDocumentType(){
  const docTypeId = constants.FrimsObject.RegisteredFunds;
  this.objectwfService.getDocumentType(docTypeId).subscribe({
    next: (res) => {
      this.isLoading = false;
      this.DocumentTypeList = res.response;
      console.log("DocumentTypeList",this.DocumentTypeList)
    },
    error: (error) => {
      this.isLoading = false;
      console.error('Error deleting RegisteredFund', error);
    },
  });
}
TheDocument : any;
getDocument(){
  const objectId = constants.FrimsObject.RegisteredFunds;
  const objectInstanceId = this.RegisteredFundDetials[0].RegisteredFundID
  this.TheDocument.getDocument(objectId,objectInstanceId).subscribe({
    next: (res) => {
      this.isLoading = false;
      this.TheDocument = res.response;
    },
    error: (error) => {
      this.isLoading = false;
      console.error('Error deleting RegisteredFund', error);
    },
  });
}


}
