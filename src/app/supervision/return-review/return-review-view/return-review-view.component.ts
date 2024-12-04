import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  isEditable: boolean = false;
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
    console.log(this.review)
    //this.loadAssignedUserRoles();
 
      this.getReturnReviewDetail();

  }

  onClose(): void {
    this.closeRevPopup.emit();
  }
  
  getReturnReviewDetail() {
    this.isLoading=true;
    const params = {
      firmRptReviewId: this.review.RptReviewID,
      firmRptReviewRevNum: this.review.RptReviewRevNum,
      roleId: 5001,
      objectOpTypeId: constants.ObjectOpType.View,
    };
  
    this.returnReviewService.getReturnReviewDetilas(params).subscribe({
      next: (res) => {
        // Assign full response to firmRevDetails
        this.firmRevDetails = res.response;
  
        // Extract the `reportReceivedDesc` and parse `reportingBasis`
        const reportDesc = this.firmRevDetails?.firmRptReviewItems?.[0]?.reportReceivedDesc;
        this.reportReceivedDate = this.firmRevDetails?.firmRptReviewItems?.[0]?.receivedDate;
        if (reportDesc) {
          const match = reportDesc.match(/\(([^)]+)\)/);
          this.reportingBasis = match ? match[1] : '';
        }
        this.getReportingBasis();
        this.getRegulatorData();
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
    const firmRptShcItemID = this.review.FirmRptSchItemID;
    const firmId = this.firmId;
    this.returnReviewService.getReportingBasis(firmId,firmRptShcItemID).subscribe({
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
    const ObjectWFStatusID = this.review.ObjectWfStatusID;
    this.objectwfService.getUserObjectWfTasks(ObjectWFStatusID).subscribe({
      next: (res) => {
        this.UserObjectWfTasks = res.response;
        console.log("UserObjectWfTasks",this.UserObjectWfTasks)
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fitching UserObjectWfTasks', error);
      },
    });
  }
  /////// ask mosatafa abbas before doing any thing
// DocumentFileServerPaths: any[] = []; 
// getDocumentFileServerPaths() {
//   if (this.review && this.review.firmRptReviewItems && this.review.firmRptReviewItems.length > 0) {
//     this.DocumentFileServerPaths = []; 
//     this.isLoading = true; 
//     this.review.firmRptReviewItems.forEach((item, index) => {
//       const rptDocID = item.rptDocID;
//       this.logForm.getDocumentFileServerPathByDocId(rptDocID).subscribe({
//         next: (res) => {
//           this.DocumentFileServerPaths[index] = res.response; 
//           console.log(`Document File Server Path for item ${index}:`, res.response);
//           if (this.DocumentFileServerPaths.length === this.review.firmRptReviewItems.length) {
//             this.isLoading = false; 
//           }
//         },
//         error: (error) => {
//           console.error(`Error fetching Document File Server Path for item ${index}:`, error);
//           this.isLoading = false;
//         },
//       });
//     });
//   } else {
//     console.error("No firmRptReviewItems to process");
//   }
// }
// DocumentType: any[] = [];
// getDocumentType(){
//   if (this.review && this.review.firmRptReviewItems && this.review.firmRptReviewItems.length > 0){
//      this.DocumentType = [];
//      this.isLoading = true; 
//      this.review.firmRptReviewItems.forEach((item, index) => {
//       const docCategoryTypeID = constants.DocType_DocCategory.XBRLTYPES;
//       this.logForm.getDocumentType(docCategoryTypeID).subscribe({
//         next: (res) => {
//           this.DocumentType[index] = res.response; 
//           console.log(`Document Type  ${index}:`, res.response);
//           if (this.DocumentType.length === this.review.firmRptReviewItems.length) {
//             this.isLoading = false; 
//           }
//         },
//         error: (error) => {
//           console.error(`Error fetching Document Type for item ${index}:`, error);
//           this.isLoading = false;
//         },
//       });
//     });
//   }else {
//     console.error("No firmRptReviewItems to process");
//   }
// }
// XbrlReportCheck : any[] = [];
// CheckXbrlReportTypes(){
//   if (this.review && this.review.firmRptReviewItems && this.review.firmRptReviewItems.length > 0){
//     this.XbrlReportCheck = [];
//     this.isLoading = true; 
//     this.review.firmRptReviewItems.forEach((item, index) => {
//     const Report = this.review.firmRptReviewItems.docTypeId;
// }



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

}
