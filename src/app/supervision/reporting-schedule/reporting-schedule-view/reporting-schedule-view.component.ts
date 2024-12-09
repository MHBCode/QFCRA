import { Component, ElementRef, EventEmitter, Input, Output, QueryList, ViewChildren } from '@angular/core';
import { ReportScheduleService } from 'src/app/ngServices/report-schedule.service';
import { SupervisionService } from '../../supervision.service';
import { SecurityService } from 'src/app/ngServices/security.service';
import { LogformService } from 'src/app/ngServices/logform.service';
import { FrimsObject, ObjectOpType } from 'src/app/app-constants';
import * as constants from 'src/app/app-constants';
import { FirmDetailsService } from 'src/app/firms/firmsDetails.service';
import { catchError, forkJoin, map, of, tap } from 'rxjs';
import Swal from 'sweetalert2';
import { FlatpickrService } from 'src/app/shared/flatpickr/flatpickr.service';
import { DateUtilService } from 'src/app/shared/date-util/date-util.service';
import { SafeHtml } from '@angular/platform-browser';
import { SanitizerService } from 'src/app/shared/sanitizer-string/sanitizer.service';

interface DocumentDetails {
  DocID: number; // Replace with actual type
  documentDetails: any; // Replace with the actual type of document details
}

@Component({
  selector: 'app-reporting-schedule-view',
  templateUrl: './reporting-schedule-view.component.html',
  styleUrls: ['./reporting-schedule-view.component.scss', '../../supervision.scss']
})

export class ReportingScheduleViewComponent {
  @ViewChildren('dateInputs') dateInputs!: QueryList<ElementRef<HTMLInputElement>>;

  @Input() report: any;
  @Input() firmDetails: any;
  @Input() firmId: any;
  @Output() closeRptPopup = new EventEmitter<void>();
  @Output() reloadReportSch = new EventEmitter<void>();
  reportPeriodTypes: any;
  regulatorPeriodTypes: any;
  firmRptDetails: any;
  financialReportingPeriod: any;
  financialReportingDateChanged: number;
  licensedAndAuthorised: string;
  userId = 10044;
  reportType: number = 1;
  isLoading: boolean = false;
  isCreateReportingSch: boolean = false;
  documentTypeList: any = [];
  rptScheduleType: number = 1; // Default value
  successOrErrorCode: number = 0;

  paginatedItems = [];
  pageSize = 5;
  selectedReport: any = null;

  // Validations
  hasValidationErrors: boolean = false;
  errorMessages: { [key: string]: string } = {};

  //dropdowns
  financialYearEndTypes: any = [];
  allRptSubmissionTypes: any = [];
  allReportTypes: any = [];

  /* user access and security */
  firmSectorID: any;
  isFirmAMLSupervisor: boolean = false;
  isFirmSupervisor: boolean = false;
  assignedUserRoles: any = [];
  showPublishPanel: boolean = true;
  canPublish: boolean = true;
  FirmAMLSupervisor: boolean = false;
  ValidFirmSupervisor: boolean = false;
  assignedLevelUsers: any = [];
  isUserAllowed: boolean | null = null;
  DisableField: boolean = false;

  hideEditBtn: boolean = false;
  hideSaveBtn: boolean = false;
  hideCancelBtn: boolean = false;
  hideCreateBtn: boolean = false;
  hideReviseBtn: boolean = false;
  hideDeleteBtn: boolean = false;
  hideExportBtn: boolean = false;

  isEditModeReportingSch: boolean = false;

  firmType: any;
  originalFirmRptDetails: any[] = [];
  filteredFirmRptDetails: any[] = [];
  displayedItems: any[] = [];
  Page = FrimsObject;

  constructor(
    private firmDetailsService: FirmDetailsService,
    private reportScheduleService: ReportScheduleService,
    private supervisionService: SupervisionService,
    private securityService: SecurityService,
    private logForm: LogformService,
    private flatpickrService: FlatpickrService,
    private dateUtilService: DateUtilService,
    private sanitizerService: SanitizerService
  ) {

  }

  ngOnInit(): void {
    this.isLoading = true;
    this.loadAssignedUserRoles();
    if (!this.isCreateReportingSch) {
      forkJoin({
        userRoles: this.firmDetailsService.loadAssignedUserRoles(this.userId),
        levelUsers: this.firmDetailsService.loadAssignedLevelUsers(),
        isSupervisor: this.isValidFirmSupervisor(),
        isAMLSupervisor: this.isValidFirmAMLSupervisor(),
      }).subscribe({
        next: ({
          userRoles,
          levelUsers,
          isSupervisor,
          isAMLSupervisor,
        }) => {

          // Assign other data to component properties
          this.assignedUserRoles = userRoles;
          this.assignedLevelUsers = levelUsers;

          this.ValidFirmSupervisor = isSupervisor;
          this.FirmAMLSupervisor = isAMLSupervisor;

          // Apply security after all data is loaded
          this.applySecurityOnPage(this.isEditModeReportingSch);
        },
        error: (err) => {
          console.error('Error initializing page:', err);
        },
      });
    }
    if (this.report) {
      this.isLoading = true;
      this.getFinancialReportingPeriod();
      this.getFirmReportScheduledItemDetail();
    }
    if (this.firmDetails) {
      this.showPublishPanel = this.firmDetails.Publish_RptSch == constants.TEXT_ONE ? true : false;
      this.firmType = this.firmDetails?.FirmTypeID;
    }
    this.getDocumentType(constants.DocType_DocCategory.AMLMLROReports);
    this.getLicensedOrAuthorisedDate();
  }


  ngAfterViewInit() {
    this.dateInputs.changes.subscribe(() => {
      this.flatpickrService.initializeFlatpickr(this.dateInputs.toArray());
    });
    this.flatpickrService.initializeFlatpickr(this.dateInputs.toArray());
  }

  onClose(): void {
    this.closeRptPopup.emit();
  }

  onCloseReport() {
    this.selectedReport = null;
  }

  getReportPeriodTypes() {
    this.reportScheduleService.getReportPeriodTypes().subscribe(res => {
      this.reportPeriodTypes = res.response;
    }, error => {
      console.error('Error Fetching Report Period Types: ', error);
    })
  }

  getRegulatorPeriodTypes() {
    this.filteredFirmRptDetails.forEach(rpt => {
      this.reportScheduleService.getRegulatorPeriodTypes(rpt.DocTypeID).subscribe(res => {
        this.regulatorPeriodTypes = res.response;
      }, error => {
        console.error('Error Fetching Regulator Period Types: ', error);
      })
    })

  }


  getFinancialReportingPeriod() {
    this.reportScheduleService.getFinancialReportingPeriod(this.firmId, this.report.FirmRptSchID).subscribe(res => {
      this.financialReportingPeriod = res.response;
      console.log('financialReportingPeriod', this.financialReportingPeriod);
    })
  }

  // getFirmReportScheduledItemDetail() {
  //   this.isLoading = true;
  //   this.reportScheduleService.getFirmReportScheduledItemDetail(
  //     this.firmId,
  //     this.report.FirmRptSchID,
  //     true
  //   ).subscribe({
  //     next: (res) => {
  //       this.originalFirmRptDetails = res.response;
  //       this.firmRptDetails = [...this.originalFirmRptDetails];
  //       this.filteredFirmRptDetails = [...this.firmRptDetails]; // Initialize filtered data

  //       const documentDetailRequests = this.firmRptDetails
  //         .filter(item => item.DocID) // Only items with DocID
  //         .map(item =>
  //           this.logForm.getDocumentDetails(item.DocID).pipe(
  //             map(data => ({
  //               ...item,
  //               documentDetails: data.response
  //             }))
  //           )
  //         );

  //       // Step 3: Fetch document details (if any)
  //       if (documentDetailRequests.length > 0) {
  //         forkJoin(documentDetailRequests).subscribe({
  //           next: (updatedDetails) => {
  //             this.firmRptDetails = updatedDetails;
  //             this.filteredFirmRptDetails = [...this.firmRptDetails];
  //           },
  //           error: (err) => {
  //             console.error('Error fetching document details:', err);
  //           },
  //           complete: () => {
  //             this.isLoading = false;
  //             this.updatePaginatedItems(
  //               this.filteredFirmRptDetails.slice(0, this.pageSize) 
  //             );
  //           }
  //         });
  //       } else {
  //         this.isLoading = false;
  //         this.updatePaginatedItems(
  //           this.filteredFirmRptDetails.slice(0, this.pageSize)
  //         );
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Error fetching firm report schedule details:', err);
  //       this.isLoading = false;
  //     }
  //   });

  // }


  // new one

  getFirmReportScheduledItemDetail() {
    this.isLoading = true;

    this.reportScheduleService.getFirmReportScheduledItemDetail(
      this.firmId,
      this.report.FirmRptSchID,
      true
    ).subscribe({
      next: (res) => {
        // Step 1: Initialize firm report details
        this.originalFirmRptDetails = res.response;
        this.firmRptDetails = [...this.originalFirmRptDetails];
        this.filteredFirmRptDetails = [...this.firmRptDetails];

        // Step 2: Fetch document details for items with DocID
        const documentDetailRequests = this.firmRptDetails
          .filter(item => item.DocID)
          .map(item =>
            this.logForm.getDocumentDetails(item.DocID).pipe(
              map(data => ({
                ...item,
                documentDetails: data.response
              }))
            )
          );

        if (documentDetailRequests.length > 0) {
          forkJoin<DocumentDetails[]>(documentDetailRequests).subscribe({
            next: (updatedDetails: DocumentDetails[]) => {
              // Merge document details into firmRptDetails
              this.firmRptDetails = this.firmRptDetails.map(item =>
                updatedDetails.find(updated => updated.DocID === item.DocID) || item
              );
              this.filteredFirmRptDetails = [...this.firmRptDetails];
            },
            error: (err) => {
              console.error('Error fetching document details:', err);
            },
            complete: () => {
              this.isLoading = false;

              // Update pagination
              this.updatePaginationComponent();
            }
          });
        }
        else {
          this.isLoading = false;

          // Update pagination directly if no document details are fetched
          this.updatePaginationComponent();
        }
      },
      error: (err) => {
        console.error('Error fetching firm report schedule details:', err);
        this.isLoading = false;
      }
    });
  }

  getLicensedOrAuthorisedDate() {
    this.reportScheduleService.getLicensedOrAuthorisedDate(this.firmId).subscribe(data => {
      this.licensedAndAuthorised = data.response.Column1;
    }, error => {
      console.error(error);
    })
  }

  loadAssignedUserRoles() {
    this.securityService.getUserRoles(this.userId).subscribe((assignedRoles) => {
      this.assignedUserRoles = assignedRoles.response;
    }, error => {
      console.error('Error fetching assigned roles: ', error);
    })
  }


  isValidFirmSupervisor() {
    return this.firmDetailsService.isValidFirmSupervisor(this.firmId, this.userId).pipe(
      tap(response => this.ValidFirmSupervisor = response)
    );
  }

  isValidFirmAMLSupervisor() {
    return this.firmDetailsService.isValidFirmAMLSupervisor(this.firmId, this.userId).pipe(
      tap(response => this.FirmAMLSupervisor = response)
    );
  }

  hideActionButton() {
    this.hideEditBtn = true;
    this.hideSaveBtn = true;
    this.hideCancelBtn = true;
    this.hideCreateBtn = true;
    this.hideDeleteBtn = true;
    this.hideReviseBtn = true;
  }


  getControlVisibility(controlName: string): boolean {
    return this.firmDetailsService.getControlVisibility(controlName);
  }

  getControlEnablement(controlName: string): boolean {
    return this.firmDetailsService.getControlEnablement(controlName);
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

  // filterReports(event: Event): void {
  //   const selectedFilter = (event.target as HTMLSelectElement).value;

  //   // Apply the filter logic to create the filtered dataset
  //   switch (selectedFilter) {
  //     case '1': // All
  //       this.filteredFirmRptDetails = [...this.firmRptDetails];
  //       break;

  //     case '2': // Non - AML Reports
  //       this.filteredFirmRptDetails = this.firmRptDetails.filter(item =>
  //         !this.documentTypeList.some(docType => docType.DocTypeID === item.DocTypeID)
  //       );
  //       break;

  //     case '3': // AML Reports
  //       this.filteredFirmRptDetails = this.firmRptDetails.filter(item =>
  //         this.documentTypeList.some(docType => docType.DocTypeID === item.DocTypeID)
  //       );
  //       break;

  //     default:
  //       this.filteredFirmRptDetails = [...this.firmRptDetails];
  //   }

  //   // Update paginated items after filtering
  //   this.updatePaginatedItems(this.filteredFirmRptDetails.slice(0, this.pageSize));
  // }

  // new one
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

    // Trigger pagination update
    this.updatePaginationComponent();
  }


  onPaginatedItemsChange(items: any[]): void {
    this.displayedItems = items; // Only display the paginated items
  }


  updatePaginationComponent(): void {
    this.filteredFirmRptDetails = [...this.filteredFirmRptDetails]; // Ensure immutability
  }



  // updatePaginatedItems(items: any[]) {
  //   this.paginatedItems = items;
  // }


  editReport() {
    this.isEditModeReportingSch = true;
    this.getFinancialYearEnd();
    this.setFirmFinYearEndTypeID();
    this.getReportPeriodTypes();
    this.getRegulatorPeriodTypes();
    this.applySecurityOnPage(this.isEditModeReportingSch);
    this.populateFirmRptSubmissionTypes();

    this.DisableField = this.firmRptDetails.some((frsi) => {
      const isFileAttached = frsi.WFileAttached;
      return !this.isValueNullOrEmpty(frsi.DocReceivedDate) || isFileAttached;
    });

    if (!this.firmDetailsService.isValidAMLSupervisor()) {
      if (this.isCreateReportingSch) {
        this.populateReportTypes(constants.ObjectOpType.Create);
      } else if (this.isEditModeReportingSch) {
        this.populateReportTypes(constants.ObjectOpType.Edit);
      }
    }
  }

  async generateReportSch() {
    this.financialReportingDateChanged = constants.TEXT_ZERO;
    const isValid = await this.isValidFinancialPeriod(2);


    if (!isValid) {
      this.firmDetailsService.showErrorAlert(constants.FirmActivitiesEnum.ENTER_ALL_REQUIREDFIELDS);
      this.isLoading = false;
      return; // Prevent further action if validation fails or the user cancels
    } else if (this.isReportDataChanged()) {
      this.confirmGenerate();
    }
  }

  async isValidFinancialPeriod(flag: number): Promise<boolean> {
    this.hasValidationErrors = true;

    if (this.financialReportingPeriod.length <= 0) {
      this.loadErrorMessages('financialReportingPeriod', constants.ReportingScheduleMessages.FINANCIALYEAREND_NOTSETFROMCRO);
      this.hasValidationErrors = false;
    } else {
      delete this.errorMessages['financialReportingPeriod'];
    }

    if (this.isValueNullOrEmpty(this.financialReportingPeriod.FirmRptFrom)) {
      this.loadErrorMessages('FirmRptFrom', constants.ReportingScheduleMessages.ENTER_REPORTINPERIODFROM);
      this.hasValidationErrors = false;
    } else {
      delete this.errorMessages['FirmRptFrom'];
    }

    if (this.isValueNullOrEmpty(this.financialReportingPeriod.FirmRptTo)) {
      this.loadErrorMessages('FirmRptTo', constants.ReportingScheduleMessages.ENTER_REPORTINPERIODTO);
      this.hasValidationErrors = false;
    } else {
      delete this.errorMessages['FirmRptTo'];
    }

    if (this.hasValidationErrors === true) {
      const financialReportingFrom = this.financialReportingPeriod.FirmRptFrom; 
      const financialReportingTo = this.financialReportingPeriod.FirmRptTo; 
      const financialDiffNotMoreThanYear = this.dateUtilService.addDays(
        this.dateUtilService.addYears(financialReportingFrom, 1),
        -1
      );

      if (this.dateUtilService.convertDateToYYYYMMDD(financialReportingFrom) >= this.dateUtilService.convertDateToYYYYMMDD(financialReportingTo)) {
        this.loadErrorMessages(
          'FinancialDateFromCannotOrEqualLaterFinancialDateTo',
          constants.ReportingScheduleMessages.FINANCIALREPORTINGFROM_CANTEQUALORLATER_FINANCIALREPORTINGTODATE
        );
        this.hasValidationErrors = false;
      } else {
        delete this.errorMessages['FinancialDateFromCannotOrEqualLaterFinancialDateTo'];
      }

      if (this.isValueNullOrEmpty(this.licensedAndAuthorised) && this.dateUtilService.convertDateToYYYYMMDD(financialReportingFrom) < this.dateUtilService.convertDateToYYYYMMDD(this.licensedAndAuthorised)) {
        this.loadErrorMessages('DateFromEarlierThanLicensedAndAuthorised', constants.ReportingScheduleMessages.FIRMLICENSEDAUTHORISEDDATE, '#FirmLicensedOrAuthorisedDate#');
        this.hasValidationErrors = false;
      } else {
        delete this.errorMessages['DateFromEarlierThanLicensedAndAuthorised'];
      }

      if (this.dateUtilService.convertDateToYYYYMMDD(financialReportingTo) > this.dateUtilService.convertDateToYYYYMMDD(financialDiffNotMoreThanYear)) {
        this.loadErrorMessages('FinancialSpanMoreThanAYear', constants.ReportingScheduleMessages.CORRECTREPORTINGSPAN_NOTMORETHANYEAR);
        this.hasValidationErrors = false;
      } else {
        this.errorMessages['FinancialSpanMoreThanAYear'];
      }

      if (this.hasValidationErrors === true) {
        this.financialReportingPeriod.FirmRptFrom = financialReportingFrom.toString();
        this.financialReportingPeriod.FirmRptTo = financialReportingTo.toString();
        this.financialReportingPeriod.ValidateFlag = flag;

        try {
          const isGenerated = await this.reportScheduleService.isReportingScheduleGenerated(
            this.firmId,
            this.financialReportingPeriod.FirmRptFrom,
            this.financialReportingPeriod.FirmRptTo,
            this.financialReportingPeriod.ValidateFlag
          );

          if (isGenerated) {
            this.loadErrorMessages(
              'ReportingScheduleGenerated',
              constants.ReportingScheduleMessages.REPORTINGSCHEDULEGENERATED_FINANCIALPERIOD
            );
            this.hasValidationErrors = false;
          } else {
            delete this.errorMessages['ReportingScheduleGenerated'];
          }
        } catch (err) {
          console.error('Error while checking reporting schedule:', err);
        }
      }

      this.displayedItems.forEach(rpt => {
        rpt.errorMessages = {};
        // Validate RptPeriodFromDate
        if (this.isValueNullOrEmpty(rpt.RptPeriodFromDate)) {
          this.loadErrorMessages('RptPeriodFromDate', constants.ReturnReviewMessages.ENTER_PERIODFROM, null, rpt);
          this.loadErrorMessages('CorrectReportingSchItem', constants.ReportingScheduleMessages.CORRECT_REPORTLIST)
          this.hasValidationErrors = false;
        } else if (rpt.errorMessages['RptPeriodFromDate']) {
          delete rpt.errorMessages['RptPeriodFromDate'];
          delete this.errorMessages['CorrectReportingSchItem'];
        }

        // Validate RptPeriodToDate
        if (this.isValueNullOrEmpty(rpt.RptPeriodToDate)) {
          this.loadErrorMessages('RptPeriodFromTo', constants.ReturnReviewMessages.ENTER_PERIODTO, null, rpt);
          this.loadErrorMessages('CorrectReportingSchItem', constants.ReportingScheduleMessages.CORRECT_REPORTLIST)
          this.hasValidationErrors = false;
        } else if (rpt.errorMessages['RptPeriodFromTo']) {
          delete rpt.errorMessages['RptPeriodFromTo'];
          delete this.errorMessages['CorrectReportingSchItem'];
        }

        // Validate Date Range if both dates are valid
        if (
          !this.isValueNullOrEmpty(rpt.RptPeriodFromDate) &&
          !this.isValueNullOrEmpty(rpt.RptPeriodToDate)
        ) {
          const fromDate = this.dateUtilService.convertDateToYYYYMMDD(rpt.RptPeriodFromDate);
          const toDate = this.dateUtilService.convertDateToYYYYMMDD(rpt.RptPeriodToDate);

          if (fromDate > toDate) {
            this.loadErrorMessages('RptPeriodFromDateGreaterThanRptPeriodDateTo', constants.MessageLogFormReport.INVALID_DATES, null, rpt);
            this.loadErrorMessages('CorrectReportingSchItem', constants.ReportingScheduleMessages.CORRECT_REPORTLIST)
            this.hasValidationErrors = false;
          } else if (rpt.errorMessages['RptPeriodFromDateGreaterThanRptPeriodDateTo']) {
            delete rpt.errorMessage['RptPeriodFromDateGreaterThanRptPeriodDateTo'];
            delete this.errorMessages['CorrectReportingSchItem'];
          }
        }
      });

    }

    return this.hasValidationErrors;
  }

  isReportDataChanged(): boolean {
    // Step 1: Check if originalFirmRptDetails and firmRptDetails exist
    if (!this.originalFirmRptDetails || !this.displayedItems) {
      return false; // No changes detected if one is undefined
    }

    // Step 2: Sort both arrays based on DocTypeID and FirmRptDueDate for consistent comparison
    const sortedOriginal = [...this.originalFirmRptDetails].sort((a, b) =>
      a.DocTypeID - b.DocTypeID || new Date(a.FirmRptDueDate).getTime() - new Date(b.FirmRptDueDate).getTime()
    );
    const sortedCurrent = [...this.displayedItems].sort((a, b) =>
      a.DocTypeID - b.DocTypeID || new Date(a.FirmRptDueDate).getTime() - new Date(b.FirmRptDueDate).getTime()
    );

    // Step 3: Check if counts are different
    if (sortedOriginal.length !== sortedCurrent.length) {
      return true; // Arrays are of different lengths, data has changed
    }

    // Step 4: Compare each item in the arrays
    for (let i = 0; i < sortedOriginal.length; i++) {
      if (!this.areItemsEqual(sortedOriginal[i], sortedCurrent[i])) {
        return true; // A mismatch detected, data has changed
      }
    }

    return false; // No changes detected
  }

  areItemsEqual(item1: any, item2: any): boolean {
    return item1.DocTypeID === item2.DocTypeID &&
      item1.FirmRptDueDate === item2.FirmRptDueDate &&
      JSON.stringify(item1) === JSON.stringify(item2); // Deep comparison for additional fields
  }

  getFinancialYearEnd() {
    this.reportScheduleService.getFinancialYearEnd(this.firmId).subscribe(data => {
      this.financialYearEndTypes = data.response;
    }, error => {
      console.error(error);
    })
  }

  setFirmFinYearEndTypeID() {
    if (this.financialYearEndTypes.length > 0) {
      if (this.financialYearEndTypes.length > 1 && this.financialYearEndTypes[0].isWaiverInPlace === 0) {
        this.financialReportingPeriod.FirmFinYearEndTypeID = '12';
      }
    } else {
      this.loadErrorMessages('FinancialYearEnd', constants.ReportingScheduleMessages.FINANCIALYEAREND_NOTSETFROMCRO);
    }
  }

  onSubmissionTypeChange() {

  }

  // deleteReport(report: any) {
  //   const index = this.firmRptDetails.indexOf(report);
  //   if (index > -1) {
  //     this.firmRptDetails.splice(index, 1);
  //     this.updatePaginatedItems(this.firmRptDetails.slice(0, this.pageSize));
  //   }
  // }

  // new one
  deleteReport(report: any) {

  }


  saveReport() {

  }

  cancelReport() {
    Swal.fire({
      text: 'Are you sure you want to cancel your changes ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok',
      cancelButtonText: 'Cancel',
      reverseButtons: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.isEditModeReportingSch = false;
        this.errorMessages = {};
        this.applySecurityOnPage(this.isEditModeReportingSch);
        this.getFirmReportScheduledItemDetail();
        this.reloadReportSch.emit();
        this.closeRptPopup.emit();
      }
    });
  }

  confirmGenerate() {
    this.logForm.errorMessages(constants.FirmActivitiesEnum.UNSAVECHANGES_MSG).subscribe((response) => {
      Swal.fire({
        html: response.response,
        showCancelButton: true,
        confirmButtonText: 'Ok',
        cancelButtonText: 'Cancel',
        reverseButtons: false
      }).then((result) => {
        if (result.isConfirmed) {
          this.errorMessages = {}
          this.getStandardReportingScheduleDetails();
          this.isLoading = false;
        }
      });
    });
  }

  getStandardReportingScheduleDetails() {
    this.isLoading = true;
    let reportScheduleFrom = this.dateUtilService.convertDateToYYYYMMDD(this.financialReportingPeriod.FirmRptFrom);
    let reportScheduleTo = this.dateUtilService.convertDateToYYYYMMDD(this.financialReportingPeriod.FirmRptTo);
    let rptScheduleType = this.rptScheduleType;
    let financialYearEndTypeID = null;
    if (this.financialYearEndTypes.length > 0) {
      financialYearEndTypeID = this.financialReportingPeriod.FirmFinYearEndTypeID;
    }
    let isFilterdValidated = true;
    if (rptScheduleType === constants.GenerateReportType.FromPrevious) {
      isFilterdValidated = this.isValidReportingFinancialFromPrevious(reportScheduleFrom, reportScheduleTo);
    }

    if (isFilterdValidated) {
      this.getfirmStandardReportScheduledItemDetail(reportScheduleFrom, reportScheduleTo, rptScheduleType, financialYearEndTypeID);
    }
  }

  isValidReportingFinancialFromPrevious(reportScheduleFrom: string, reportScheduleTo: string): boolean {
    let isValid = true;

    this.successOrErrorCode = this.validateReportingScheduleFromPrevious(reportScheduleFrom, reportScheduleTo);

    if (this.successOrErrorCode === 100) {
      this.loadErrorMessages('rptNotScheduleGeneratePreviousReport', constants.ReportingScheduleMessages.REPORTSNOTSCHEDULE_GENERATEPREVIOUSREPORT_SCHEDULEPREVIOUESSCHEDULE);
      isValid = false;
    } else {
      delete this.errorMessages['rptNotScheduleGeneratePreviousReport'];
    }

    if (this.successOrErrorCode === 101) {
      this.loadErrorMessages('rptNotScheduleForOneYearEarlier', constants.ReportingScheduleMessages.REPORTSNOTSCHEDULEDFORONEYEAREARLIER);
      isValid = false;
    } else {
      delete this.errorMessages['rptNotScheduleForOneYearEarlier'];
    }

    if (this.successOrErrorCode === 102) {
      this.loadErrorMessages('financialPeriodMonthIsDifferent', constants.ReportingScheduleMessages.FINANCIALPERIODMONTHISDIFFERENT);
      isValid = false;
    } else {
      delete this.errorMessages['financialPeriodMonthIsDifferent'];
    }

    return isValid
  }

  validateReportingScheduleFromPrevious(reportScheduleFrom: string, reportScheduleTo: string): number {
    this.reportScheduleService
      .validateReportingSchedule(this.firmId, reportScheduleFrom, reportScheduleTo)
      .subscribe((response) => {
        this.successOrErrorCode = response;
      });
    return this.successOrErrorCode;
  }

  getfirmStandardReportScheduledItemDetail(
    reportScheduleFrom: string,
    reportScheduleTo: string,
    rptScheduleType: number,
    financialYearEndTypeID: number | null
  ): void {
    this.isLoading = true;
    this.reportScheduleService
      .getfirmStandardReportScheduledItemDetail(
        this.firmId,
        reportScheduleFrom,
        reportScheduleTo,
        rptScheduleType,
        financialYearEndTypeID
      )
      .subscribe(
        (data) => {
          const items = data.response;

          if (items && items.length > 0) {
            // Update the full dataset (filteredFirmRptDetails)
            this.filteredFirmRptDetails = this.filteredFirmRptDetails.map((existingItem) => {
              const updatedItem = items.find((newItem) => newItem.FirmRptReqID === existingItem.FirmRptReqID);

              return updatedItem
                ? {
                  ...existingItem, // Preserve original properties
                  ...updatedItem, // Overwrite with new values
                  FirmRptReqdBit: rptScheduleType === constants.GenerateReportType.New ? true : updatedItem.FirmRptReqdBit,
                  DocTypeID: updatedItem.DocTypeID || null,
                  RptPeriodTypeID: updatedItem.RptPeriodTypeID || null,
                  ReportName: updatedItem.RptName || '',
                  RptPeriodFromDate: updatedItem.RptPeriodFromDate || '',
                  RptPeriodToDate: updatedItem.RptPeriodToDate || '',
                  FirmRptNotes: updatedItem.FirmRptNotes || '',
                  FirmRptDueDate: updatedItem.DueDatewithbuffer || '', // Map DueDatewithbuffer
                  WPublished: existingItem.WPublished = false,
                }
                : existingItem; // If no match, retain the original item
            });

            // Add new items from the response
            const newItems = items.filter(
              (newItem) => !this.filteredFirmRptDetails.some((existingItem) => existingItem.FirmRptReqID === newItem.FirmRptReqID)
            );

            this.filteredFirmRptDetails = [...this.filteredFirmRptDetails, ...newItems];
            this.isLoading = false;
          } else {
            // Handle empty response case
            const emptyItem = this.getReportScheduleItemsEmptyObject();
            this.filteredFirmRptDetails = [emptyItem];
            this.isLoading = false;
          }
        },
        (error) => {
          console.error(error);
          this.isLoading = false;
        }
      );
  }






  getReportScheduleItemsEmptyObject(): any {
    return {
      RowID: this.generateGuid(), // Generates a unique GUID
      DocTypeID: 0,
      FirmRptDueDate: null,
      FirmRptReqdBit: true,
      FirmRptNReqReasonTypeID: 0,
      DocReceivedDate: '',
      LinkToReturnReview: '',
      //LinkToReturnReview: `${this.URL_RETURNREVIEWLIST}${this.firmId}&${this.constants.QUERYSTRING_SCHEDULEITEMID}=${this.constants.TEXT_ZERO}`, // Constructed URL
      FirmRptNotes: '',
      DocID: null,
      ReviewStatusDesc: '',
      ReportName: '',
      RptPeriodFromDate: null,
      RptPeriodToDate: null,
      RptPeriodTypeID: null,
      WPublished: false,
      WpublishedCom: false,
      SubmissionBeforeRptPeriodEnd: false,
    };
  }


  generateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }



  userHasRestrictedAccess() {
    this.isLoading = true;
    this.securityService.isUserAllowedToAccessFirm(this.userId, this.firmId, this.Page.ReportingSchedule).subscribe({
      next: data => {
        this.isUserAllowed = data.response;
        this.isLoading = false;
        if (!this.isUserAllowed) {
          this.hideActionButton();
        }
      },
      error: err => {
        console.error('Error checking access permissions:', err);
        this.isLoading = false;
      }
    });
  }

  applySecurityOnPage(isWritableMode: boolean) {
    this.isLoading = true;
    let currentOpType;

    currentOpType = isWritableMode ? (this.isCreateReportingSch ? ObjectOpType.Create : ObjectOpType.Edit) : ObjectOpType.ListView;

    this.firmDetailsService.applyAppSecurity(this.userId, this.Page.ReportingSchedule, currentOpType).then(() => {
      if (this.firmType == constants.TEXT_TWO) {
        if (!this.isFirmAMLSupervisor) {
          this.hideActionButton();
        }
      } else if (this.firmType == constants.TEXT_ONE) {
        if (this.FirmAMLSupervisor) {
          this.hideDeleteBtn = true;
          this.hideCreateBtn = true;
        } else if (this.ValidFirmSupervisor == false) {
          this.hideActionButton();
        }
      } else {
        if (this.ValidFirmSupervisor == false) {
          this.hideActionButton();
        }
      }

      this.registerMasterPageControlEvents();
      this.userHasRestrictedAccess();
      // if (this.firmType === constants.TEXT_TWO) {
      //   if (this.isFirmAMLSupervisor) {

      //     this.reportType = constants.TEXT_THREE;
      //   }
      //   if ((this.isFirmAMLSupervisor) == false) {
      //     this.canPublish = false;
      //   }
      // }
      // else {
      //   if (this.isFirmSupervisor == false) {
      //     this.canPublish = false;
      //   }
      //   if (this.firmDetailsService.isValidAMLSupervisor()) {
      //     this.reportType = constants.TEXT_THREE;
      //   }
      //   else {
      //     this.reportType = constants.TEXT_ONE;
      //   }
      // }
      // this.isLoading = false;
    });
  }

  registerMasterPageControlEvents() {
    // Edit mode
    if (this.isEditModeReportingSch) {
      this.hideExportBtn = true;
    }
    // View mode
    this.hideExportBtn = false;
    this.isLoading = false;
  }

  loadErrorMessages(fieldName: string, msgKey: number, customMessage?: string, placeholderValue?: string, rpt?: any) {
    this.supervisionService.getErrorMessages(fieldName, msgKey, customMessage, rpt, placeholderValue).subscribe(
      () => {
        this.errorMessages[fieldName] = this.supervisionService.errorMessages[fieldName];
        console.log(`Error message for ${fieldName} loaded successfully`);
      },
      error => {
        console.error(`Error loading error message for ${fieldName}:`, error);
      }
    );
  }

  populateFirmRptSubmissionTypes() {
    this.supervisionService.populateFirmRptSubmissionTypes(this.userId, constants.ObjectOpType.Create).subscribe(
      rptSubmissionTypes => {
        this.allRptSubmissionTypes = rptSubmissionTypes;
      },
      error => {
        console.error('Error fetching submission types:', error);
      }
    );
  }

  populateReportTypes(OpType: number) {
    this.supervisionService.populateReportTypes(this.userId, OpType).subscribe(
      reportTypes => {
        this.allReportTypes = reportTypes.sort((a, b) => {
          return a.DocTypeDesc.localeCompare(b.DocTypeDesc);
        });
      },
      error => {
        console.error('Error fetching report types:', error);
      }
    );
  }


  isValueNullOrEmpty(value: any): boolean {
    return this.supervisionService.isNullOrEmpty(value);
  }

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizerService.sanitizeHtml(html);
  }
}
