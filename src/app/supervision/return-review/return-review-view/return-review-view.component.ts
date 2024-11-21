import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReturnReviewService } from 'src/app/ngServices/return-review.service';
import { SupervisionService } from '../../supervision.service';
import { SecurityService } from 'src/app/ngServices/security.service';
import { LogformService } from 'src/app/ngServices/logform.service';
import * as constants from 'src/app/app-constants';
import { FirmDetailsService } from 'src/app/firms/firmsDetails.service';
import { ActivatedRoute } from '@angular/router';

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
    private logForm : LogformService
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
  // loadAssignedUserRoles() {
  //   this.securityService.getUserRoles(this.userId).subscribe((assignedRoles) => {
  //     this.assignedUserRoles = assignedRoles.response;
  //   }, error => {
  //     console.error('Error fetching assigned roles: ', error);
  //   })
  // }
  
}
