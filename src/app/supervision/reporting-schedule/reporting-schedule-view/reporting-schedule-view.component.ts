import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ReportScheduleService } from 'src/app/ngServices/report-schedule.service';
import { SupervisionService } from '../../supervision.service';
import { SecurityService } from 'src/app/ngServices/security.service';
import { LogformService } from 'src/app/ngServices/logform.service';
import { FrimsObject, ObjectOpType } from 'src/app/app-constants';
import * as constants from 'src/app/app-constants';
import { FirmDetailsService } from 'src/app/firms/firmsDetails.service';
import { forkJoin, map, tap } from 'rxjs';

@Component({
  selector: 'app-reporting-schedule-view',
  templateUrl: './reporting-schedule-view.component.html',
  styleUrls: ['./reporting-schedule-view.component.scss', '../../supervision.scss']
})
export class ReportingScheduleViewComponent {
  @Input() report: any;
  @Input() firmDetails: any;
  @Input() firmId: any;
  @Output() closeRptPopup = new EventEmitter<void>();
  isEditable: boolean = false;
  reportPeriodTypes: any;
  firmRptDetails: any;
  financialReportingPeriod: any;
  userId = 30;
  reportType: number = 1;
  isLoading: boolean = false;
  isCreateMode: boolean = false;
  documentTypeList: any = [];

  paginatedItems = [];
  pageSize = 10;
  selectedReport: any = null;

  /* user access and security */
  firmSectorID: any;
  isFirmAMLSupervisor: boolean = false;
  isFirmSupervisor: boolean = false;
  assignedUserRoles: any = [];
  showPublishPanel: boolean = true;
  isEditAllowed: boolean = false;
  canPublish: boolean = true;
  firmType: any;
  originalFirmRptDetails: any[] = [];
  filteredFirmRptDetails: any[] = [];
  constructor(
    private firmDetailsService: FirmDetailsService,
    private reportScheduleService: ReportScheduleService,
    private supervisionService: SupervisionService,
    private securityService: SecurityService,
    private logForm: LogformService
  ) {

  }

  ngOnInit(): void {
    this.getReportPeriodTypes();
    this.loadAssignedUserRoles();
    if (this.firmId) {
      this.isValidFirmAMLSupervisor();
      this.isValidFirmSupervisor();
    }
    if (this.report) {
      this.getFinancialReportingPeriod();
      this.getFirmReportScheduledItemDetail();
    }
    if (this.firmDetails) {
      this.showPublishPanel = this.firmDetails.Publish_RptSch == constants.TEXT_ONE ? true : false;
      this.firmType = this.firmDetails?.FirmTypeID;
      this.applySecurityOnPage(false);
    }
    this.getDocumentType(constants.DocType_DocCategory.AMLMLROReports)
  }




  onClose(): void {
    this.closeRptPopup.emit();
  }

  onCloseReport(){
    this.selectedReport = null;
  }
  getReportPeriodTypes() {
    this.reportScheduleService.getReportPeriodTypes().subscribe(res => {
      this.reportPeriodTypes = res.response;
    })
  }


  getFinancialReportingPeriod() {
    this.reportScheduleService.getFinancialReportingPeriod(this.firmId, this.report.FirmRptSchID).subscribe(res => {
      this.financialReportingPeriod = res.response;
      console.log('financialReportingPeriod', this.financialReportingPeriod);
    })
  }
  getFirmReportScheduledItemDetail() {
    this.isLoading = true;
    this.reportScheduleService.getFirmReportScheduledItemDetail(
      this.firmId,
      this.report.FirmRptSchID,
      true
    ).subscribe({
      next: (res) => {
        this.originalFirmRptDetails = res.response;
        this.firmRptDetails = [...this.originalFirmRptDetails];
        this.filteredFirmRptDetails = [...this.firmRptDetails]; // Initialize filtered data
  
        const documentDetailRequests = this.firmRptDetails
          .filter(item => item.DocID) // Only items with DocID
          .map(item =>
            this.logForm.getDocumentDetails(item.DocID).pipe(
              map(data => ({
                ...item,
                documentDetails: data.response
              }))
            )
          );
  
        // Step 3: Fetch document details (if any)
        if (documentDetailRequests.length > 0) {
          forkJoin(documentDetailRequests).subscribe({
            next: (updatedDetails) => {
              this.firmRptDetails = updatedDetails;
              this.filteredFirmRptDetails = [...this.firmRptDetails];
            },
            error: (err) => {
              console.error('Error fetching document details:', err);
            },
            complete: () => {
              this.isLoading = false;
              this.updatePaginatedItems(
                this.filteredFirmRptDetails.slice(0, this.pageSize) 
              );
            }
          });
        } else {
          this.isLoading = false;
          this.updatePaginatedItems(
            this.filteredFirmRptDetails.slice(0, this.pageSize)
          );
        }
      },
      error: (err) => {
        console.error('Error fetching firm report schedule details:', err);
        this.isLoading = false;
      }
    });
  
  }
  



  loadAssignedUserRoles() {
    this.securityService.getUserRoles(this.userId).subscribe((assignedRoles) => {
      this.assignedUserRoles = assignedRoles.response;
      console.log('this.assignedUserRoles', this.assignedUserRoles);
    }, error => {
      console.error('Error fetching assigned roles: ', error);
    })
  }


  isValidFirmSupervisor() {
    return this.firmDetailsService.isValidFirmAMLSupervisor(this.firmId, this.userId).pipe(
      tap(response => this.isFirmSupervisor = response)
    );
  }

  isValidFirmAMLSupervisor() {
    return this.firmDetailsService.isValidFirmAMLSupervisor(this.firmId, this.userId).pipe(
      tap(response => this.isFirmAMLSupervisor = response)
    );
  }


  getDocumentType(docCategoryTypeID: number) {
    this.logForm.getDocumentType(docCategoryTypeID).subscribe(
      data => {
        this.documentTypeList = data.response;
        console.log("this.documentTypeList", this.documentTypeList)
      },
      error => {
        console.error(error);
      }
    )
  }

  filterReports(event: Event): void {
    const selectedFilter = (event.target as HTMLSelectElement).value;
  
    // Apply the filter logic to create the filtered dataset
    switch (selectedFilter) {
      case '1': // All
        this.filteredFirmRptDetails = [...this.firmRptDetails];
        break;
  
      case '2': // Non - AML Reports
        this.filteredFirmRptDetails = this.firmRptDetails.filter(item =>
          !this.documentTypeList.some(docType => docType.DocTypeID === item.DocTypeID)
        );
        break;
  
      case '3': // AML Reports
        this.filteredFirmRptDetails = this.firmRptDetails.filter(item =>
          this.documentTypeList.some(docType => docType.DocTypeID === item.DocTypeID)
        );
        break;
  
      default:
        this.filteredFirmRptDetails = [...this.firmRptDetails];
    }
  
    // Update paginated items after filtering
    this.updatePaginatedItems(this.filteredFirmRptDetails.slice(0, this.pageSize));
  }


  updatePaginatedItems(items: any[]) {
    this.paginatedItems = items;
  }


  editReport(report: any) {
    this.selectedReport = { ...report }; // Clone the object to avoid modifying directly
  }

  deleteReport(report: any) {
    const index = this.firmRptDetails.indexOf(report);
    if (index > -1) {
      this.firmRptDetails.splice(index, 1);
      this.updatePaginatedItems(this.firmRptDetails.slice(0, this.pageSize));
    }
  }

  saveReport() {
    const index = this.firmRptDetails.findIndex((r) => r === this.selectedReport);
    if (index > -1) {
      this.firmRptDetails[index] = this.selectedReport;
      this.selectedReport = null; // Reset the form
    }
  }

  applySecurityOnPage(isWritableMode: boolean) {
    // this.maskCommandActionsControlsScope();
    this.isLoading = true;
    let currentOpType;

    currentOpType = isWritableMode ? (this.isCreateMode ? ObjectOpType.Create : ObjectOpType.Edit) : ObjectOpType.ListView;

    this.firmDetailsService.applyAppSecurity(this.userId, FrimsObject.ReportingSchedule, currentOpType).then(() => {
      if (this.firmType === constants.TEXT_TWO) {
        if (this.firmDetailsService.isValidAMLSupervisor()) {
          this.isEditAllowed = true;
          this.reportType = constants.TEXT_THREE;
        }
        if ((this.isFirmAMLSupervisor || !this.isEditAllowed) == false) {
          this.canPublish = false;
        }
      }
      else {
        if (this.isFirmSupervisor == false) {
          this.canPublish = false;
        }
        if (this.firmDetailsService.isValidAMLSupervisor()) {
          this.reportType = constants.TEXT_THREE;
        }
        else {
          this.reportType = constants.TEXT_ONE;
        }
      }
      this.isLoading = false;
    });
  }
}
