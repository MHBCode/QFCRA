import { Component, ElementRef, EventEmitter, Input, Output,QueryList,ViewChildren } from '@angular/core';
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
import { FrimsObject, ObjectOpType } from 'src/app/app-constants';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
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

  now = new Date();
  currentDate = this.now.toISOString();
  currentDateOnly = new Date(this.currentDate).toISOString().split('T')[0];
  @ViewChildren('dateInputs') dateInputs!: QueryList<ElementRef<HTMLInputElement>>;
  newComments: Array<{ firmRptReviewFindings: Array<{ firmRptReviewFindings: string }> }> = [
    { firmRptReviewFindings: [{ firmRptReviewFindings: '' }] } // Default comment
  ];
  Page = FrimsObject;


  constructor(
    private returnReviewService: ReturnReviewService,
    private supervisionService: SupervisionService,
    private securityService: SecurityService,
    private route: ActivatedRoute,
    private logForm : LogformService,
    private objectwfService: ObjectwfService,

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
    this.getUserRoles();
    this.getDocumentType();
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
  
  // getReturnReviewDetail() {
  //   this.isLoading=true;
  //   const firmRptReviewId= this.review.RptReviewID;
  //   const firmRptReviewRevNum= this.review.RptReviewRevNum;
  //   const roleId= 5001;
  //   const objectOpTypeId= constants.ObjectOpType.View;

  //   this.returnReviewService.getReturnReviewDetilas(firmRptReviewId,firmRptReviewRevNum,roleId,objectOpTypeId).subscribe({
  //     next: (res) => {
  //       // Assign full response to firmRevDetails
  //       this.firmRevDetails = res.response;
  //       console.log("firmRevDetails:", this.firmRevDetails);
        
  //       this.isLoading=false;
  //     },
  //     error: (error) => {
  //       console.error('Error fetching return review details:', error);
  //       this.isLoading=false;
  //     },
  //   });
  // }
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
  ReportReviewed : any;
  showOtherDropdown : boolean = false;
  ReportReviewedStartWithNum : boolean = false;
  SelectedReportReviewed(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;

    if (selectedValue === 'Other') {
      this.showOtherDropdown = true; // Show the secondary dropdown
      this.ReportReviewed = selectedValue; // Set the "Other" value
      console.log('Other report option selected');
    } else {
      this.showOtherDropdown = false; // Hide the secondary dropdown
      this.ReportReviewed = selectedValue; // Set the selected report
      console.log('Selected Report:', selectedValue);
    }
    if (/^\d/.test(selectedValue)){
      this.ReportReviewedStartWithNum = true;
    }
  }

  /// commit section 
  addNewCommentsOnReviseMode() {
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
  
  saveComments() {
    this.firmRevDetails.firmRptReviewItems.forEach((item, index) => {
      item.firmRptReviewFindings = [...this.newComments[index].firmRptReviewFindings];
    });
  
    console.log('Updated firmRptReviewItems:', this.firmRevDetails.firmRptReviewItems);
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

  saveFollowUpItems() {
    // Logic to save follow-up items (e.g., send to backend or update database)
    console.log('Saved follow-up items:', this.followUpItems);
  }
  UsersRoleList: any;
  getUserRoles(){
    const userId = this.userId;
    this.securityService.getUserRoles(userId).subscribe({
      next: (res) => {
        this.UsersRoleList = res.response;
        console.log("UsersRoleList",this.UsersRoleList)
        this.isLoading = false;
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
  OtherReportTypeList : any;
  getDocumentType() {
    // Observables for fetching document types
    const objAMLDictionary = this.logForm.getDocumentType(constants.DocType_DocCategory.AMLMLROReports);
    const objSUPDictionary = this.logForm.getDocumentType(constants.DocType_DocCategory.RptSchedule);
  
    // Log the observables
    console.log("objAMLDictionary :", objAMLDictionary);
    console.log("objSUPDictionary :", objSUPDictionary);
  
    // Combine both observables using forkJoin
    forkJoin([objAMLDictionary, objSUPDictionary]).subscribe({
      next: ([amlDictionary, supDictionary]) => {
        console.log("AML Dictionary Data:", amlDictionary);
        console.log("SUP Dictionary Data:", supDictionary);
  
        const firmTypeId = this.firmDetails.FirmTypeID;
        const filteredRoles = this.getFilteredUserRoles(3009);
  
        if (filteredRoles.length > 0) {
          console.log("Filtered Roles exist:", filteredRoles);
          this.OtherReportTypeList = [...amlDictionary]; 
          console.log("this.OtherReportTypeList",this.OtherReportTypeList)
        } else {
          if(firmTypeId == 1){
            this.OtherReportTypeList = Array.from(
              new Set([...amlDictionary, ...supDictionary]) // Combine data
            );
            console.log("this.OtherReportTypeList",this.OtherReportTypeList)
          }
          
        }
  
        console.log("OtherReportTypeList:", this.OtherReportTypeList);
      },
      error: (err) => {
        console.error("Error fetching document types:", err);
      },
    });
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


}
