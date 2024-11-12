import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReportScheduleService } from 'src/app/ngServices/report-schedule.service';
import { SupervisionService } from '../../supervision.service';
import { SecurityService } from 'src/app/ngServices/security.service';
import { LogformService } from 'src/app/ngServices/logform.service';

@Component({
  selector: 'app-reporting-schedule-view',
  templateUrl: './return-review-view.component.html',
  styleUrls: ['./return-review-view.component.scss', '../../../shared/popup.scss', '../../supervision.scss']
})
export class ReturnReviewViewComponent {
  @Input() report: any;
  @Input() firmId: any;
  @Output() closeRptPopup = new EventEmitter<void>();
  isEditable: boolean = false;
  reportPeriodTypes: any;
  firmRptDetails : any;
  financialReportingPeriod:any;
  userId = 30;
  /* user access and security */
  assignedUserRoles: any = [];

  constructor(
    private reportScheduleService: ReportScheduleService,
    private supervisionService: SupervisionService,
    private securityService: SecurityService,
    private logForm : LogformService
  ) {

  }

  ngOnInit(): void {
    console.log(this.report)
    this.loadAssignedUserRoles();
    if(this.report){
      //this.getReturnReviewDetail();
    }
  }

  onClose(): void {
    this.closeRptPopup.emit();
  }

  // getReportPeriodTypes() {
  //   this.reportScheduleService.getReportPeriodTypes().subscribe(res => {
  //     this.reportPeriodTypes = res.response;
  //   })
  // }


  // getFinancialReportingPeriod () {
  //   this.reportScheduleService.getFinancialReportingPeriod(this.firmId,this.report.FirmRptSchID).subscribe(res => {
  //     this.financialReportingPeriod = res.response;
  //     console.log('financialReportingPeriod',this.financialReportingPeriod);
  //   })
  // }

  // getReturnReviewDetail () {
  //   this.reportScheduleService.getReturnReviewDetail(this.firmId,this.report.FirmRptSchID).subscribe(res => {
  //     this.firmRptDetails = res.response;
  //     this.firmRptDetails.forEach((item:any) =>{
  //       if(item.DocID){
  //         this.logForm.getDocumentDetails(item.DocID).subscribe(data => {
  //           item.documentDetails = data.response; 
  //         });
  //       }
  //     })
  //     console.log('firmRptDetails',this.firmRptDetails);
  //   })
  // }


  loadAssignedUserRoles() {
    this.securityService.getUserRoles(this.userId).subscribe((assignedRoles) => {
      this.assignedUserRoles = assignedRoles.response;
    }, error => {
      console.error('Error fetching assigned roles: ', error);
    })
  }

  
}
