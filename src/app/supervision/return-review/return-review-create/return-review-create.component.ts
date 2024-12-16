import { Component, ElementRef, EventEmitter, Input, Output,QueryList,ViewChildren,ChangeDetectorRef  } from '@angular/core';
import { ReturnReviewService } from 'src/app/ngServices/return-review.service';
import { SupervisionService } from '../../supervision.service';
import { SecurityService } from 'src/app/ngServices/security.service';
import { LogformService } from 'src/app/ngServices/logform.service';
import * as constants from 'src/app/app-constants';
import { FirmDetailsService } from 'src/app/firms/firmsDetails.service';
import { ActivatedRoute } from '@angular/router';
import { Bold, ClassicEditor, Essentials, Font, FontColor, FontSize, Heading, Indent, IndentBlock, Italic, Link, List, MediaEmbed, Paragraph, Table, Undo } from 'ckeditor5';
import { ReviewComponent } from 'src/app/shared/review/review.component';
import {ObjectwfService} from 'src/app/ngServices/objectwf.service';
import { ReportScheduleService } from 'src/app/ngServices/report-schedule.service';
import { FrimsObject, ObjectOpType } from 'src/app/app-constants';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
import { FlatpickrService } from 'src/app/shared/flatpickr/flatpickr.service';
@Component({
  selector: 'app-return-review-create',
  templateUrl: './return-review-create.component.html',
  styleUrls: ['./return-review-create.component.scss', '../../../shared/popup.scss', '../../supervision.scss']
})
export class ReturnReviewCreateComponent {
  @Input() firmId: any;
  @Input() firmDetails: any;
  userId = 30;
  isLoading: boolean = false;
  @Output() closeCreatePopup = new EventEmitter<void>();
  errorMessages: { [key: string]: string } = {};
  @Input() review: any;
  firmRevDetails: any;
  ReportingBasis:any;
  RegulatorData:any;
  selectedAppRoleID: number = 0;
  UsersRoleList: any;
  now = new Date();
  currentDate = this.now.toISOString();
  currentDateOnly = new Date(this.currentDate).toISOString().split('T')[0];
  @ViewChildren('dateInputs') dateInputs!: QueryList<ElementRef<HTMLInputElement>>;
  newComments: Array<{ firmRptReviewFindings: Array<{ firmRptReviewFindings: string }> }> = [
    { firmRptReviewFindings: [{ firmRptReviewFindings: '' }] } // Default comment
  ];
  Page = FrimsObject;
  DocSubTypesList: Array<{ DocSubTypeID: number; DocSubTypeDesc: string; checked?: boolean }> = [];


  constructor(
    private returnReviewService: ReturnReviewService,
    private supervisionService: SupervisionService,
    private securityService: SecurityService,
    private route: ActivatedRoute,
    private logForm : LogformService,
    private objectwfService: ObjectwfService,
    private reportSchedule: ReportScheduleService,
    private flatpickrService: FlatpickrService,
    private cdr: ChangeDetectorRef
  ) {

  }
  
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
      //this.isFirmAuthorised();
    });
    console.log("firmDetails",this.firmDetails)
    console.log("review",this.review)
    this.getReportingBasis();
    this.getRegulatorData();
    this.getReportsReceived();
    //this.getUserRoles();
    //this.getDocumentType();
    this.getUserRoles(() => {
      this.getDocumentType();
    });
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
  
 
  getReportingBasis(){
    const firmId = this.firmId;
    this.returnReviewService.getReportingBasis(firmId).subscribe({
      next: (res) => {
          this.ReportingBasis = res.response;
          console.log("Reporting Basis",this.ReportingBasis)
      },
       error: (error) => {
        console.error('Error fetching Reporting Basis:', error);
        this.isLoading=false;
      },
    }) 
  }
  getRegulatorData(){
    const firmId = this.firmId;
    this.returnReviewService.getRegulatorData(firmId).subscribe({
      next: (res) => {
          this.RegulatorData = res.response;
          console.log("Regulator Data",this.RegulatorData) 
      },
       error: (error) => {
        console.error('Error fetching Reporting Basis:', error);
        this.isLoading=false;
      },
    }) 
  }
  ReportsReceivedList:any;
  getReportsReceived(){
    const firmId = this.firmId;
    const userId = this.userId;
    this.returnReviewService.getReportsReceived(firmId,userId).subscribe({
      next: (res) => {
          this.ReportsReceivedList = res.response;
          console.log("Reports Received List Data",this.ReportsReceivedList) 
      },
       error: (error) => {
        console.error('Error fetching ReportsReceivedList:', error);
        this.isLoading=false;
      },
    }) 
  }
  ReportReviewed: any;
  showOtherDropdown: boolean = false;
  firmRptSchItemId: number | null = null; // To store the selected firmRptSchItemId
  docTypeId: number | null = null; // To store the selected docTypeId
  
  SelectedReportReviewed(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement)?.value;
  
    if (selectedValue === '') {
      console.log('No value selected');
      this.ReportReviewed = ''; // Explicitly reset
      this.showOtherDropdown = false;
      this.firmRptSchItemId = undefined;
      this.docTypeId = undefined;
      return;
    }
  
    if (selectedValue === 'Other') {
      this.showOtherDropdown = true; // Show the secondary dropdown
      this.ReportReviewed = selectedValue; // Set the "Other" value
      this.firmRptSchItemId = undefined; // Clear previous selections
      this.docTypeId = undefined;
  
      // Reset dDocTypeesc and docTypeId in firmRptReviewItems
      const currentItem = this.firmRptReviewItems;
      if (currentItem) {
        currentItem[0].dDocTypeesc = '';
        currentItem[0].docTypeId = null;
      }
     
      console.log('Other report option selected');
      return;
    }
  
    this.showOtherDropdown = false; // Hide the secondary dropdown
    this.ReportReviewed = selectedValue; // Set the selected report
    this.firmRptReviewItems[0].strRptSchID_RptRecivedID = selectedValue;
    // Split the concatenated value to get firmRptSchItemId and docTypeId
    const [firmRptSchItemId, docTypeId] = selectedValue.split(',').map(Number);
  
    if (firmRptSchItemId && docTypeId) {
      this.firmRptSchItemId = firmRptSchItemId;
      this.docTypeId = docTypeId;
  
      // Bind to firmRptReviewItems
      const currentItem = this.firmRptReviewItems;
      if (currentItem) {
        currentItem[0].dDocTypeesc = 'Selected from UI'; // Replace with actual description if available
        currentItem[0].docTypeId = this.docTypeId;
        
      }
  
      // Call the method to handle firmRptSchItemId
      this.getFirmReportScheduleItem(this.firmRptSchItemId);
      console.log('Selected firmRptSchItemId:', this.firmRptSchItemId);
      console.log('Selected docTypeId:', this.docTypeId);
    } else {
      console.error('Invalid selection value:', selectedValue);
    }
  }
  ReportScheduleItem:any;
  reportingPeriodStartDate = '';
  reportingPeriodEndDate = '';
  getFirmReportScheduleItem(firmRptSchItemId){
    //const firmRptSchItemID = this.review.FirmRptSchItemID;
    this.reportSchedule.getFirmReportScheduleItem(firmRptSchItemId).subscribe({
      next: (res) => {
         this.ReportScheduleItem = res.response;
         console.log("ReportScheduleItem",this.ReportScheduleItem)
         if(this.ReportScheduleItem != null){
          this.reportingPeriodStartDate = this.ReportScheduleItem[0].RptPeriodFromDate;
          this.reportingPeriodEndDate = this.ReportScheduleItem[0].RptPeriodToDate;
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error("Error fetching DocSubTypesList:", error);
      },
    });
    
  }
  OtherReportTypeList : any;
  getDocumentType() {
    this.OtherReportTypeList = [];
    const amlPromise = new Promise((resolve, reject) => {
      this.getAMLDocumentType(resolve, reject);
    }); 
    const supPromise = new Promise((resolve, reject) => {
      this.getSUPDocumentType(resolve, reject);
    });
    Promise.all([amlPromise, supPromise]).then(() => {
      const firmTypeId = this.firmDetails.FirmTypeID;
      const filteredRoles = this.getFilteredUserRoles(3009);
      const amlDictionary = Array.isArray(this.objAMLDictionary) ? this.objAMLDictionary : [];
      const supDictionary = Array.isArray(this.objSUPDictionary) ? this.objSUPDictionary : []; 
      if (filteredRoles.length > 0) {
        this.OtherReportTypeList = amlDictionary;
      } else {
        const mergedList = [...amlDictionary];
        supDictionary.forEach((itemSUP: any) => {
          const isDuplicate = mergedList.some(
            (itemAML: any) => itemAML.DocTypeID === itemSUP.DocTypeID
          );
          if (!isDuplicate) {
            mergedList.push(itemSUP);
          }
        }); 
        this.OtherReportTypeList = mergedList;
      } 
      console.log("OtherReportTypeList:", this.OtherReportTypeList);
    }).catch((error) => {
      console.error("Error fetching document types:", error);
    });
  }
  /////// commit section 
  addNewComments() {
    // Add a new empty comment to the first review item's findings for simplicity
    const newComment = { firmRptReviewFindings: '' };
    
    if (this.newComments.length > 0) {
      this.newComments[0].firmRptReviewFindings.push(newComment);
    } else {
      this.newComments.push({ firmRptReviewFindings: [newComment] });
    }
    
    console.log("After adding a new comment:", this.newComments);
  }
  
  removeComment(itemIndex: number, commentIndex: number) {
    if (this.newComments[itemIndex]?.firmRptReviewFindings) {
      this.newComments[itemIndex].firmRptReviewFindings.splice(commentIndex, 1);
    }
    
    console.log("After removing a comment:", this.newComments);
  }
  
  // folowUp Items

  followUpItems: Array<{
    item: string;
    actionsTaken: string;
    dueDate: string;
    closedDate: string;
    resolution: string;
  }> = [];
  addFollowUpItem() {
    this.followUpItems.push({
      item: '',
      actionsTaken: '',
      dueDate: '',
      closedDate: '',
      resolution: '',
    });
    console.log('After adding a new item:', this.followUpItems);
  }

  removeFollowUpItem(index: number) {
    this.followUpItems.splice(index, 1);
    console.log('After removing an item:', this.followUpItems);
  }

  getUserRoles(callback: () => void){
    const userId = this.userId;
    this.securityService.getUserRoles(userId).subscribe({
      next: (res) => {
        this.UsersRoleList = res.response;
        console.log("UsersRoleList",this.UsersRoleList)
        this.isLoading = false;
        callback();
      },
      error: (error) => {
        console.error('Error fitching UsersRoleList', error);
        this.isLoading = false;
      },
    });
  }
  getFilteredUserRoles(roleId: number): any[] {
    const filteredRoles = this.UsersRoleList.filter((s: any) => s.AppRoleId === roleId);
    console.log('Filtered Roles:', filteredRoles);
    return filteredRoles;
  }
  objAMLDictionary:any;
  getAMLDocumentType(resolve: Function, reject: Function) {
    const docCategoryTypeID = constants.DocType_DocCategory.AMLMLROReports;
    this.logForm.getDocumentType(docCategoryTypeID).subscribe({
      next: (res) => {
        this.objAMLDictionary = res.response;
        resolve();
      },
      error: (error) => {
        console.error("Error fetching objAMLDictionary:", error);
        reject(error);
      },
    });
  }
  objSUPDictionary:any;
  getSUPDocumentType(resolve: Function, reject: Function) {
    const docCategoryTypeID = constants.DocType_DocCategory.RptSchedule;
    this.logForm.getDocumentType(docCategoryTypeID).subscribe({
      next: (res) => {
        this.objSUPDictionary = res.response;
        resolve();
      },
      error: (error) => {
        console.error("Error fetching objSUPDictionary:", error);
        reject(error);
      },
    });
  }


  onDropdownChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement; // Cast to HTMLSelectElement
    const selectedDocTypeId = parseInt(selectElement.value, 10); // Get the value and parse it to an integer
  
    if (selectedDocTypeId && selectedDocTypeId !== 0) {
      // Call the method to fetch subtypes for the selected document type
      this.getReportsReceivedDocSubTypes(selectedDocTypeId);
  
      // Find the selected document type from the list
      const selectedDocType = this.OtherReportTypeList.find(item => item.DocTypeID === selectedDocTypeId);
  
      if (selectedDocType) {
        // Bind the selected DocTypeID and description to firmRptReviewItems
        const currentItem = this.firmRptReviewItems;
        if (currentItem) {
          currentItem[0].dDocTypeesc = selectedDocType.DocTypeDesc;
          currentItem[0].docTypeId = selectedDocType.DocTypeID;
          console.log('Updated firmRptReviewItems:', currentItem);
        } else {
          console.warn('No matching firmRptReviewItem found for firmRptSchItemId:', this.firmRptSchItemId);
        }
      } else {
        console.error('Selected DocTypeID not found in OtherReportTypeList:', selectedDocTypeId);
      }
    } else {
      console.warn("Invalid DocTypeID selected");
    }
  }

 // DocSubTypesList: any[] = []; // Initialize as an empty array

  getReportsReceivedDocSubTypes(docTypeId: number) {
    this.returnReviewService.getReportsReceivedDocSubTypes(docTypeId).subscribe({
      next: (res) => {
        // Add a `checked` property to track the checkbox state
        this.DocSubTypesList = res.response.map((item: any) => ({
          ...item,
          checked: false,
        }));
        console.log("DocSubTypesList:", this.DocSubTypesList);
      },
      error: (error) => {
        console.error("Error fetching DocSubTypesList:", error);
      },
    });
  }
getSelectedSubTypes() {
  return this.DocSubTypesList.filter((subType) => subType.checked);
}


//// Review 
  
  onRoleChange(event: Event, index: number) {
    const selectedAppRoleID = this.reviews[index].roleAssignedTo;
    console.log('Selected AppRoleID:', selectedAppRoleID);
    this.getUsersInRole(this.selectedAppRoleID);
  }

    
  UsersInRoleList: any;
  getUsersInRole(selectedAppRoleID){
    const objectID = constants.FrimsObject.ReturnsReview;
    const roleId = selectedAppRoleID;
    this.securityService.getUsersInRole(objectID,roleId).subscribe({
      next: (res) => {
        this.UsersInRoleList = res.response;
        console.log("UsersInRoleList",this.UsersInRoleList)
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fitching UsersInRoleList', error);
        this.isLoading = false;
      },
    });
  }
  taskRolesList:any;
  getWorkflowTaskRoles(){
    const objectTaskTypeID = this.UserObjectWfTasks.ObjectTaskTypeID;
    const objectID = constants.FrimsObject.ReturnsReview;
    const notificationFlag = 0;
    const objectWFTaskDefID = this.UserObjectWfTasks.ObjectWFTaskDefID;
    this.objectwfService.getWorkflowTaskRoles(objectTaskTypeID,objectID,notificationFlag,objectWFTaskDefID).subscribe({
      next: (res) => {
        this.taskRolesList = res.response;
        console.log("taskRolesList",this.taskRolesList)
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fitching taskRolesList', error);
        this.isLoading = false;
      },
    });
  }
  
  UserObjectWfTasks : any;
  getUserObjectWfTasks(){
    const ObjectWFStatusID = this.review.ObjectWFStatusID;
    this.objectwfService.getUserObjectWfTasks(ObjectWFStatusID).subscribe({
      next: (res) => {
        this.UserObjectWfTasks = res.response;
        console.log("UserObjectWfTasks",this.UserObjectWfTasks)
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fitching UserObjectWfTasks', error);
        this.isLoading = false;
      },
    });
  }
  
  // Add a new review form
  reviews: Array<{
    
    reason: string;
    task: string;
    roleAssignedTo: string;
    userAssignedTo: string;
    email: string;
    dueDate: string;
  }> = [
    {
      
      reason: '',
      task: 'Review',
      roleAssignedTo: '',
      userAssignedTo: '',
      email: '',
      dueDate: '',
    },
  ];

  // Handle showing/hiding additional review fields
  addNewReview() {
    this.reviews.push({
      reason: '',
      task: 'Review',
      roleAssignedTo: '',
      userAssignedTo: '',
      email: '',
      dueDate: '',
    });
  }

  // Remove a review form
  removeReview(index: number) {
    Swal.fire({
      text: "Your selection of 'No' for the 'Additional Review Required' field indicates that your review of this submission is complete. If your review of this report has not been completed, please select 'Yes'.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#982B1C',
      cancelButtonColor: '#982B1C',
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.reviews.splice(index, 1);
      }
    });
  }
  firmRptReviewItems= [
      {
        actionItemDesc: "",
        firmID: 0,
        firmName: "",
        firmRptReviewItemId: 0,
        firmRptReviewId: 0,
        lateFeeImposed: true,
        firmRptReviewRevNum: 0,
        firmRptFrequency: "",
        objectStatusTypeID: 0,
        objectStatusTypeDesc: "",
        dDocTypeesc: '',
        firmRptSchItemId: 0,
        showAdminFee: true,
        showAdminPanel: 0,
        showException: true,
        docTypeId: 0,
        rptDocID: 0, // from the selected doc popup
        rptDocReferenceID: 0,  
        rptPeriodFrom: "11/Dec/2015",  //this.reportingPeriodStartDate,
        rptPeriodTo: "31/Dec/2015", //this.reportingPeriodEndDate,
        rptDueDate: "",
        createdBy: 0,
        createdDate: "",
        lastModifiedBy: 0,
        lastModifiedDate: "",
        wfirmRptPublishCommentId: 0,
        materiallyComplete: null,
        materiallyCompleteDate: "",
        materiallyCompleteCheckedBy: null,
        resubmissionRequired: null,
        resubmissionRequestedDate: "",
        resubmissionRequestedBy: null,
        firmRptAdminFeeId: 0,
        contraventionExists: true,
        resubmissionDueDate: "",
        docConsistency: true,
        docConsistencyMessage: "",
        wFileAttached: true,
        resubmissionRequestedByName: "",
        dueOrResubmissionDueDate: "",
        reportReceivedDesc: "",
        strRptSchID_RptRecivedID: "",
        showRptReceivedEnabled: true,
        intranetGUID: "",
        strDocSubType: "",
        isReportTypeDue: 0,
        wPublishedComments: "",
        wPublishedBy: 0,
        wPublishedByUserName: "",
        wPublishedDate: "",
        canPublishComments: true,
        wAllowResubmit: true,
        actionItemRefPublishCommentID: 0,
        objectActionItemID: 0,
        commentsAsActionItemFlag: true,
        reportLoc: "",
        maxRevisionNum: 0,
        report: "",
        receivedDate: "",
        reportReviewState: 2,
        isUpdate: true,
        isWFileAttachedUpdate: true,
      }
    ]
      firmRptReviewFindings= [
        {
          firmRptReviewFindingId: 0,
          firmRptReviewFindings: "",
          firmRptReviewItemId: 0,
          createdBy: 0,
          reportCommentState: 0,
          firmRptReviewFindingDesc: "",
        },
      ];
      firmRptReviewSubItems= [
        {
          firmRptReviewSubItemId: 0,
          firmRptReviewItemId: 0,
          docSubTypeId: 0,
          docSubTypeDesc: "string",
          createdBy: 0,
        },
      ];
  /////// save create Frim Report Review 
   CreateReportReviewObject = {
    firmRptReviewId: 0,
    firmRptReviewRevNum: 0,
    firmId: 0,
    objectWfstatusId: 0,
    createdBy: this.userId,
    createdDate:this.currentDate ,
    lastModifiedBy: 0,
    lastModifiedDate: "2024-12-11T13:02:54.081Z",
    addtlReviewRequired: true,
    maxRevisionNum: 0,
    addtlReviewRequiredDecisionMadeBy: this.userId,
    addtlReviewRequiredDecisionMadeByName: "string",
    addtlReviewRequiredDecisionMadeOn: "2024-12-11T13:02:54.081Z",
    returnReviewWFStatusId: 0,
  };
  getSelectedSubItems(): Array<{
    firmRptReviewSubItemId: number;
    firmRptReviewItemId: number;
    docSubTypeId: number;
    docSubTypeDesc: string;
    createdBy: number;
  }> {
    return this.DocSubTypesList.filter((subType) => subType.checked).map((subType) => ({
      firmRptReviewSubItemId: 0, // Default ID
      firmRptReviewItemId: 0, // Update if required based on business logic
      docSubTypeId: subType.DocSubTypeID,
      docSubTypeDesc: subType.DocSubTypeDesc,
      createdBy: this.userId,
    }));
  }
  saveUpdateFirmReportReview(){
    this.isLoading = true;
    const firmRptReviewFindings = this.newComments.flatMap((reviewItem, reviewItemIndex) =>
      reviewItem.firmRptReviewFindings.map((finding, findingIndex) => ({
        firmRptReviewFindingId: 0, // Default ID
        firmRptReviewItemID: this.firmRevDetails?.firmRptReviewItems?.[reviewItemIndex]?.firmRptReviewItemId || 0,
        firmRptReviewFindingDesc: finding.firmRptReviewFindings, // Bind the CKEditor input
        firmRptReviewFindings: finding.firmRptReviewFindings, // Bind the CKEditor input
        createdBy: this.userId,
        reportCommentState: 2, // Assuming this is the default state
      }))
    );
    const firmRptReviewSubItems = this.getSelectedSubItems();
   const ReportReviewObject = {
    firmRptReviewId: 0,
    firmRptReviewRevNum: 0,
    firmId: this.firmId,
    objectWfstatusId: 0,
    createdBy: this.userId,
    createdDate: this.currentDate ,
    lastModifiedBy: this.userId,
    lastModifiedDate: this.currentDate,
    addtlReviewRequired: true,
    maxRevisionNum: 0,
    addtlReviewRequiredDecisionMadeBy: this.userId,
    addtlReviewRequiredDecisionMadeByName: "",
    addtlReviewRequiredDecisionMadeOn: this.currentDate,
    returnReviewWFStatusId: null,
    firmRptReviewItems: this.firmRptReviewItems,
    firmRptReviewFindings: firmRptReviewFindings,
    firmRptReviewSubItems: firmRptReviewSubItems,
    }
    console.log("ReportReviewObjectToBeSaved",ReportReviewObject)
    this.returnReviewService.saveUpdateFirmReportReview(ReportReviewObject).subscribe({
      next: (res) => {
        this.isLoading = false;
        // SweetAlert success
        Swal.fire({
          icon: 'success',
          title: 'Saved Successfully',
          text: 'The firm report review has been saved successfully!',
          confirmButtonText: 'OK',
          confirmButtonColor: '#B8001F',
        });
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error Saving Report Review', error);
        // SweetAlert error
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred while saving the report review.',
          confirmButtonText: 'OK',
          confirmButtonColor: '#B8001F',
        });
      },
    });
  }

  callRefForm: boolean = false;
  ////////// call Form Reference

  OpenDocumentPopup(){
    this.callRefForm = true;
  }
  closeFormReference(){
    this.callRefForm = false;
  }
  deSelectDocument(){

  }
  replaceDocument(){

  }
}
