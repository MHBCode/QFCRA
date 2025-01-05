import { Component, EventEmitter, Input, Output, ChangeDetectorRef, ElementRef, QueryList, ViewChildren } from '@angular/core';
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
import {ActionItemsService} from 'src/app/ngServices/action-items.service';
import { FrimsObject, ObjectOpType } from 'src/app/app-constants';
import { SanitizerService } from 'src/app/shared/sanitizer-string/sanitizer.service';
import { SafeHtml } from '@angular/platform-browser';
import { ReportScheduleService } from 'src/app/ngServices/report-schedule.service'
import Swal from 'sweetalert2';
@Component({
  selector: 'app-return-review-view',
  templateUrl: './return-review-view.component.html',
  styleUrls: ['./return-review-view.component.scss', '../../../shared/popup.scss', '../../supervision.scss']
})
export class ReturnReviewViewComponent {
  @Input() review: any;
  @Input() ReviewRevision: any;
  @Input() firmId: any;
  @Input() firmDetails: any;
  @Output() closeRevPopup = new EventEmitter<void>();
  reportPeriodTypes: any;
  Page = FrimsObject;
  firmRevDetails : any;
  financialReportingPeriod:any;
  userId = 30;
  isLoading: boolean = false;
  ReportingBasis :any;
  /* user access and security */
  assignedUserRoles: any = [];
  reportingBasis: string = '';
  reportReceivedDate: string='';
  RegulatorData:any;
  ActionItems :any;
  NewVersion:any;
  isReviseMode : boolean = false;
  isEditable: boolean = false;
  newComments: any[] = [];
  DocSubTypesList: Array<{ DocSubTypeID: number; DocSubTypeDesc: string; checked?: boolean }> = [];
  now = new Date();
  currentDate = this.now.toISOString();
  currentDateOnly = new Date(this.currentDate).toISOString().split('T')[0];
  @ViewChildren('dateInputs') dateInputs!: QueryList<ElementRef<HTMLInputElement>>;
  // newComments: Array<{ firmRptReviewFindings: Array<{ firmRptReviewFindings: string }> }> = [
  //   { firmRptReviewFindings: [{ firmRptReviewFindings: '' }] } // Default comment
  // ];
  errorMessages: { [key: string]: string } = {};
  constructor(
    private returnReviewService: ReturnReviewService,
    private supervisionService: SupervisionService,
    private securityService: SecurityService,
    private route: ActivatedRoute,
    private logForm : LogformService,
    private objectwfService: ObjectwfService,
    private actionItemsService: ActionItemsService,
    private sanitizerService: SanitizerService,
    private reportSchedule: ReportScheduleService,
    private cdr: ChangeDetectorRef,
    private firmDetailsService: FirmDetailsService,
  ) {

  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
      //this.isFirmAuthorised();
    });
    console.log(this.review)
    //this.loadAssignedUserRoles();
 
      this.getReturnReviewDetail();
      this.getObjectActionItems();
      
      this.getObjectWorkflow();
      
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
  onClose(): void {
    this.closeRevPopup.emit();
  }
  
  getReturnReviewDetail() {
    this.isLoading=true;
    const firmRptReviewId= this.review.RptReviewID;
    const firmRptReviewRevNum= this.review.RptReviewRevNum;
    const roleId= 5001;
    const objectOpTypeId= constants.ObjectOpType.View;

  
    this.returnReviewService.getReturnReviewDetilas(firmRptReviewId,firmRptReviewRevNum,roleId,objectOpTypeId).subscribe({
      next: (res) => {
        // Assign full response to firmRevDetails
        this.firmRevDetails = res.response;
        console.log("firmRevDetails:", this.firmRevDetails);
        // Extract the `reportReceivedDesc` and parse `reportingBasis`
        const reportDesc = this.firmRevDetails?.firmRptReviewItems?.[0]?.reportReceivedDesc;
        this.reportReceivedDate = this.firmRevDetails?.firmRptReviewItems?.[0]?.receivedDate;
        if (reportDesc) {
          const match = reportDesc.match(/\(([^)]+)\)/);
          this.reportingBasis = match ? match[1] : '';
        }
        this.getFirmReportScheduleItem(this.firmRevDetails.firmRptReviewItems[0].firmRptSchItemId)
        this.getReportsReceivedDocSubTypes(this.firmRevDetails.firmRptReviewItems[0].docTypeId)
        this.getReportingBasis();
        this.getRegulatorData();
        this.newComments = this.firmRevDetails.firmRptReviewItems.map(item => ({
          firmRptReviewFindings: [...item.firmRptReviewFindings]
        }));
        console.log("Initial newComments:", this.newComments);

        console.log("newComments", this.newComments);
        this.getUserObjectWfTasks();
        console.log('firmRevDetails:', this.firmRevDetails);
        //console.log('Extracted Reporting Basis:', this.reportingBasis);
        
        this.isLoading=false;
      },
      error: (error) => {
        console.error('Error fetching return review details:', error);
        this.isLoading=false;
      },
    });
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

  UserObjectWfTasks : any[]=[];
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
DocumentFileServerPaths: any; 
openLinkToReport(item){
  console.log(item.rptDocID,item.docTypeId)
  this.logForm.getDocumentFileServerPathByDocId(item.rptDocID).subscribe({
    next: (res) => {
      this.DocumentFileServerPaths = res.response; 
      console.log(`Document File Server Path for item :`, res.response);
      this.getDocumentType(item);
      
    },
    error: (error) => {
      console.error(`Error fetching Document File Server Path for item :`, error);

    },
  });
}


DocumentType: any[] = [];
getDocumentType(item){
  if (this.firmRevDetails && this.firmRevDetails.firmRptReviewItems && this.firmRevDetails.firmRptReviewItems.length > 0){
     this.DocumentType = [];
     this.isLoading = true; 
      const docCategoryTypeID = constants.DocType_DocCategory.XBRLTYPES;
      this.logForm.getDocumentType(docCategoryTypeID).subscribe({
        next: (res) => {
          this.DocumentType = res.response; 
          this.CheckXbrlReportTypes(item);
          if (this.DocumentType.length === this.firmRevDetails.firmRptReviewItems.length) {
            this.isLoading = false; 
          }
        },
        error: (error) => {
          console.error(`Error fetching Document Type for item :`, error);
          this.isLoading = false;
        },
      });

  }else {
    console.error("No firmRptReviewItems to process");
  }
}
CheckXbrlReportTypes(item): boolean {
  if (this.firmRevDetails && this.firmRevDetails.firmRptReviewItems && this.firmRevDetails.firmRptReviewItems.length > 0) {
    const documentTypeIds = this.DocumentType.map(doc => doc.DocTypeID);
   
   const exists = documentTypeIds.includes(item.docTypeId)
   
   console.log(`At least one Document Type exists: ${exists}`);
    
    if (exists) {
      this.linkToXbrlReportMaker(item);
    } else {
      console.error("No docTypeId(s) match the DocumentType records.");
      this.linkToReportMaker(item)
      this.isLoading = false;
    }
    return exists;
  } else {
    console.error("No firmRptReviewItems to process or firmRevDetails is not defined");
    
    return false;
  }
}
fullLinkToReport :any;
linkToXbrlReportMaker(item) {
  if (this.DocumentFileServerPaths && this.firmRevDetails && this.firmRevDetails.firmRptReviewItems) {
    this.fullLinkToReport = this.DocumentFileServerPaths + constants.SLASH_FORWORD + item.reportLoc;
    console.log("Generated fullLinkToXbrlReport:", this.fullLinkToReport);
    this.isLoading = false;
  } else {
    console.error("Unable to generate link: Missing data in DocumentFileServerPaths or firmRptReviewItems.");
    this.isLoading = false;
  }
}
linkToReportMaker(item){
  let fileLocation = item.reportLoc.split('/');
  let filingId = '';
  if (fileLocation.length > 1) {
    if (fileLocation[3] && fileLocation[3].trim() !== '') {
        filingId = fileLocation[3];
    }

    if (fileLocation[4] && fileLocation[4].trim() !== '') {
        fileLocation[4] = constants.FileType.HTML.toString();
    }
  }
  item.FilingID = filingId;
  if (filingId && filingId.trim() !== '') {
    this.fullLinkToReport = this.logForm.getMessageProperty(constants.ReportingScheduleMessages.XBRLService.toString()) +
        constants.SLASH_FORWORD +
        fileLocation.join(constants.SLASH_FORWORD);
        console.log("fullLinkToReport",this.fullLinkToReport)
  }
}

getObjectActionItems() {
  const objectId = constants.FrimsObject.ReturnsReview;
  const objectInstanceId = this.review.RptReviewID;
  const objectInstanceRevNum = this.review.RptReviewRevNum;
  const objectOpTypeId = constants.ObjectOpType.View;

  this.actionItemsService.getObjectActionItems(objectId, objectInstanceId, objectInstanceRevNum, objectOpTypeId)
  .subscribe({
    next: (res) => {
      this.ActionItems = res.response; 
      console.log(`Document File Server Path for item :`, res.response);
      console.log("ActionItems",this.ActionItems)
    },
    error: (error) => {
      console.error(`Error fetching ActionItem :`, error);

    },
  });
}
WorkflowStatus: any;
getObjectWorkflow(){
  const objectId = constants.FrimsObject.ReturnsReview;
  const objectInstanceId = this.review.RptReviewID;
  const objectInstanceRevNum = this.review.RptReviewRevNum;
  this.objectwfService.getObjectWorkflow(objectId, objectInstanceId, objectInstanceRevNum).subscribe({
    next: (res) => {   
        this.WorkflowStatus = res.response;
        console.log("WorkflowStatus",this.WorkflowStatus)
    },
    error: (error) => {
      console.error(`Error fetching ActionItem:`, error);
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
  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizerService.sanitizeHtml(html || '');
  }


  /// Revise Section

  CreateNewVerisionConfirmation() {
    Swal.fire({
      title: 'Alert!',
      text: 'Do you want to create a new version of this record?',
      showCancelButton: true,
      confirmButtonText: 'Ok',
      cancelButtonText: 'Cancel',
      confirmButtonColor: 'hsl(345.9deg 100% 35.88%)',
      cancelButtonColor: 'hsl(345.9deg 100% 35.88%)'
    }).then((result) => {
      if (result.isConfirmed) {
        // Call the function to create a new version
        this.CreateNewVersion();
      }
    });
  }
  
  CreateNewVersion() {
    this.isLoading = true;
    this.isReviseMode = true;
  
    const rptObjectId = Number(constants.FrimsObject.ReturnsReview);
    const rptReviewID = Number(this.review.RptReviewID);
    const rptReviewRevNum = Number(this.review.RptReviewRevNum);
    const userId = Number(30);
    const roleId = Number(5001);
  
    this.returnReviewService
      .SaveNewRevisonNum(rptObjectId, rptReviewID, rptReviewRevNum, userId, roleId)
      .subscribe({
        next: (res) => {
          this.NewVersion = res.response;
          console.log('NewVersion', this.NewVersion);
          this.isLoading = false;
        },
        error: (error) => {
          console.error(`Error creating NewVersion:`, error);
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to create a new version. Please try again later.',
          });
        },
      });
  }
  
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



  /////////// Edit section 
  
  EditMode(){
    this.isEditable = true;
  }
  ReportScheduleItem:any;
  reportingPeriodStartDate:any;
  reportingPeriodEndDate:any;
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
  ////////////////////////// sub Items
  // getReportsReceivedDocSubTypes(docTypeId: number) {
  //   this.returnReviewService.getReportsReceivedDocSubTypes(docTypeId).subscribe({
  //     next: (res) => {
  //       // Add a `checked` property to track the checkbox state
  //       this.DocSubTypesList = res.response.map((item: any) => ({
  //         ...item,
  //         checked: false,
  //       }));
  //       console.log("DocSubTypesList:", this.DocSubTypesList);
  //     },
  //     error: (error) => {
  //       console.error("Error fetching DocSubTypesList:", error);
  //     },
  //   });
  // }
  getReportsReceivedDocSubTypes(docTypeId: number) {
    this.returnReviewService.getReportsReceivedDocSubTypes(docTypeId).subscribe({
        next: (res) => {
            // Add a `checked` property to reflect the selection state
            this.DocSubTypesList = res.response.map((item: any) => ({
                ...item,
                checked: this.firmRevDetails?.firmRptReviewItems?.[0]?.firmRptReviewSubItems?.some(
                    (subItem: any) => subItem.docSubTypeId === item.DocSubTypeID
                ) || false,
            }));
            console.log("DocSubTypesList with check state:", this.DocSubTypesList);
        },
        error: (error) => {
            console.error("Error fetching DocSubTypesList:", error);
        },
    });
}
getSelectedSubTypes() {
  return this.DocSubTypesList.filter((subType) => subType.checked);
}

  ////////////////////////// item Action 

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

  createActionFromComment : boolean = false;
  FlagcreateActionFromComment(){
    this.createActionFromComment = true;
  }

    ///////////////////////////////////// Comment to be Publish
    CommentsToPublishObject = {
    
      wFirmRptPublishCommentID: 0,
      firmRptReviewItemID: 0,
      wPublishedComments: "",
      wPublishedBy: 0,
      wPublishedDate: "",
      firmRptSchItemID: 0,
      wAllowResubmit: true,
      objectActionItemID: 0,
      commentAsActionItemFlag: true
    
  }
  saveCommentsToPublish(){
   const commitListDetails = {
     wFirmRptPublishCommentID: 0,
     wPublishedComments : this.CommentsToPublishObject.wPublishedComments,
     wPublishedBy: this.userId,
     wPublishedDate: this.currentDate,
     firmRptSchItemID: 0,
     wAllowResubmit: true,
     objectActionItemID: 0,
     commentAsActionItemFlag: true

    }
    this.returnReviewService.saveCommentsToPublish(commitListDetails).subscribe({
      next: (res) => {
        this.isLoading = false;
         console.log("Comment Published Successfully")
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error Comment Published', error);
      },
    });
  }
  /////////////////////////////////// Edit 
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
RptReviewDates ={
RptDueDate: "",
rptPeriodFrom:"",
rptPeriodTo:"",
reportingPeriodStartDate:"",
reportingPeriodEndDate:"",
materiallyCompleteDate:"",
resubmissionRequestedDate:"",
resubmissionDueDate:"",
}
firmRptReviewItems: any[] = [];
   hasValidationErrors: boolean = false;
    validationsaveUpdateFirmReportReview(){
      return new Promise<void>((resolve, reject) => {
        this.errorMessages = {}; // Clear previous error messages
        this.hasValidationErrors = false;
        if (!this.firmRevDetails.firmRptReviewItems[0].documentDetails || 
          !this.firmRevDetails.firmRptReviewItems[0].documentDetails.FileName || 
          this.firmRevDetails.firmRptReviewItems[0].documentDetails.FileName.trim() === '') {
          this.loadErrorMessages('documentDetails', constants.ReturnReviewMessages.NO_DOCUMENT_SELECTED);
          this.hasValidationErrors = true;
        }
        if (!this.firmRevDetails.firmRptReviewItems[0].dDocTypeesc || this.firmRevDetails.firmRptReviewItems[0].dDocTypeesc == null || this.firmRevDetails.firmRptReviewItems[0].dDocTypeesc == " ") {
           this.loadErrorMessages('RptReviewed', constants.ReturnReviewMessages.SELECT_REPORTRECEIVED);
           this.hasValidationErrors = true;
        }
        if (!this.firmRevDetails.firmRptReviewItems[0].rptPeriodFrom || this.firmRevDetails.firmRptReviewItems[0].rptPeriodFrom == null || this.firmRevDetails.firmRptReviewItems[0].rptPeriodFrom == " ") {
          this.loadErrorMessages('rptPeriodFrom', constants.ReturnReviewMessages.ENTER_PERIODFROM);
          this.hasValidationErrors = true;
        }
        if (!this.firmRevDetails.firmRptReviewItems[0].rptPeriodTo || this.firmRevDetails.firmRptReviewItems[0].rptPeriodTo == null || this.firmRevDetails.firmRptReviewItems[0].rptPeriodTo == " ") {
          this.loadErrorMessages('rptPeriodTo', constants.ReturnReviewMessages.ENTER_PERIODTO);
          this.hasValidationErrors = true;
        }
        
        if (this.hasValidationErrors) {
          resolve(); // Form is invalid
        } else {
          resolve(); // Form is valid
        }
      });
    }
   saveUpdateFirmReportReview(){
          this.validationsaveUpdateFirmReportReview();
      
          if (this.hasValidationErrors) {
            this.firmDetailsService.showErrorAlert(constants.Firm_CoreDetails_Messages.FIRMSAVEERROR);
            this.isLoading = false;
            return;
          }
      this.isLoading = true;
      const firmRptReviewFindings = this.newComments.flatMap(
        (reviewItem, reviewItemIndex) =>
          reviewItem.firmRptReviewFindings.map((finding) => ({
            firmRptReviewFindingId: 0, // Default ID
            firmRptReviewItemID:
              this.firmRevDetails?.firmRptReviewItems?.[reviewItemIndex]
                ?.firmRptReviewItemId || 0,
            firmRptReviewFindingDesc: finding.firmRptReviewFindings,
            createdBy: this.userId,
            reportCommentState: 2, // Default state
          }))
      );
    
      const firmRptReviewSubItems = this.getSelectedSubItems();
    
      // Ensure `firmRptReviewItems` reflects the updated form data
      const ReportReviewObject = {
        firmRptReviewId: this.firmRevDetails.firmRptReviewId || null,
        firmRptReviewRevNum: this.firmRevDetails.firmRptReviewRevNum || null,
        firmId: this.firmId,
        objectWfstatusId: null,
        createdBy: this.userId,
        createdDate: this.currentDate,
        lastModifiedBy: this.userId,
        lastModifiedDate: this.currentDate,
        addtlReviewRequired: true,
        maxRevisionNum: this.firmRevDetails.maxRevisionNum || 0,
        addtlReviewRequiredDecisionMadeBy: this.userId,
        addtlReviewRequiredDecisionMadeByName: '',
        addtlReviewRequiredDecisionMadeOn: this.currentDate,
        returnReviewWFStatusId: this.firmRevDetails.returnReviewWFStatusId || null,
        firmRptReviewItems: this.firmRevDetails.firmRptReviewItems, // Bind updated items
        firmRptReviewFindings: firmRptReviewFindings,
        firmRptReviewSubItems: firmRptReviewSubItems,
      };
      console.log("ReportReviewObjectToBeSaved",ReportReviewObject)
      this.returnReviewService.saveUpdateFirmReportReview(ReportReviewObject).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.saveCommentsToPublish();
  
          // SweetAlert success
          Swal.fire({
            icon: 'success',
            title: 'Saved Successfully',
            text: 'The firm report review has been saved successfully!',
            confirmButtonText: 'OK',
            confirmButtonColor: '#B8001F',
          });
          window.location.reload();
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
}
