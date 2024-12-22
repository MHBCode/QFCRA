import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, QueryList, ViewChildren } from '@angular/core';
import { ReportScheduleService } from 'src/app/ngServices/report-schedule.service';
import { SupervisionService } from '../../supervision.service';
import { SecurityService } from 'src/app/ngServices/security.service';
import { LogformService } from 'src/app/ngServices/logform.service';
import { FrimsObject, ObjectOpType } from 'src/app/app-constants';
import * as constants from 'src/app/app-constants';
import { FirmDetailsService } from 'src/app/firms/firmsDetails.service';
import { catchError, forkJoin, map, Observable, of, tap } from 'rxjs';
import Swal from 'sweetalert2';
import { FlatpickrService } from 'src/app/shared/flatpickr/flatpickr.service';
import { DateUtilService } from 'src/app/shared/date-util/date-util.service';
import { SafeHtml } from '@angular/platform-browser';
import { SanitizerService } from 'src/app/shared/sanitizer-string/sanitizer.service';
import { ReturnReviewService } from 'src/app/ngServices/return-review.service';

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
  @Input() isCreateReportingSch: boolean = false;
  @Output() closeRptPopup = new EventEmitter<void>();
  @Output() reloadReportSch = new EventEmitter<void>();
  periodTypes: any;
  reportPeriodTypes: any;
  regulatorPeriodTypes: any;
  firmRptDetails: any;
  financialReportingPeriod: any = {};
  financialReportingDateChanged: number;
  licensedAndAuthorised: string;
  userId = 10044;
  reportType: number = 1;
  isLoading: boolean = false;
  reportsGenerated: boolean = false;

  rptItemExists: { [key: number]: number } = {};
  signatories: { [key: number]: any[] } = {};
  amlReports: any = [];
  prudentialTypes: any = [];
  rptScheduleType: number = 1; // Default value
  successOrErrorCode: number = 0;
  additionalSchedules: any = {};
  reportDocTypes: any = [];

  paginatedItems = [];
  pageSize = 5;
  selectedReport: any = null;

  currentDate = new Date();

  // Validations
  hasValidationErrors: boolean = false;
  errorMessages: { [key: string]: string } = {};
  rptPeriodNotValid: boolean = false;
  isValidReportingPeriodFrom: boolean = true;
  isValidReportingPeriodTo: boolean = true;
  isValidDueDate: boolean = true;
  isValidPeriodType: boolean = true;
  DateValid: boolean = false;


  //dropdowns
  financialYearEndTypes: any = [];
  allRptSubmissionTypes: any = [];
  allReportTypes: any = [];
  allNotRequiredTypes: any = [];

  /* user access and security */
  firmSectorID: any;
  isFirmAMLSupervisor: boolean = false;
  isFirmSupervisor: boolean = false;
  assignedUserRoles: any = [];
  showPublishPanel: number;
  canPublish: boolean = true;
  pnlPublishReportingSch: boolean = true;
  publishDetails: boolean = false;
  publishButtons: boolean = true;
  isEditAllowed: boolean = false;
  FirmAMLSupervisor: boolean = false;
  ValidFirmSupervisor: boolean = false;
  assignedLevelUsers: any = [];
  isUserAllowed: boolean | null = null;
  DisableField: boolean = false;
  publishBtnText: string;

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
  publishedReportIDs: any;
  Page = FrimsObject;

  currentYear = new Date().getFullYear();

  createRptSchObj = {
    FirmFinYearEndTypeID: 0,
    FirmRptFrom: `1/Jan/${this.currentYear}`,
    FirmRptTo: `31/Dec/${this.currentYear}`,
  };

  constructor(
    private firmDetailsService: FirmDetailsService,
    private reportScheduleService: ReportScheduleService,
    private returnReviewService: ReturnReviewService,
    private supervisionService: SupervisionService,
    private securityService: SecurityService,
    private logForm: LogformService,
    private flatpickrService: FlatpickrService,
    private dateUtilService: DateUtilService,
    private sanitizerService: SanitizerService,
    private cdr: ChangeDetectorRef
  ) {

  }

  ngOnInit(): void {
    this.isLoading = true;

    // Base observables
    const observables: Record<string, Observable<any>> = {
      userRoles: this.firmDetailsService.loadAssignedUserRoles(this.userId),
      levelUsers: this.firmDetailsService.loadAssignedLevelUsers(),
      isSupervisor: this.isValidFirmSupervisor(),
      isAMLSupervisor: this.isValidFirmAMLSupervisor(),
      financialYearEnd: of(this.getFinancialYearEnd()),
      firmRptSubmissionTypes: of(this.populateFirmRptSubmissionTypes()),
      notRequiredTypes: of(this.populateNotRequiredTypes()),
      amlReports: of(this.getAMLReports()),
      prudentialTypes: of(this.getPrudentialTypes()),
      xbrlDocTypes: of(this.getXBRLDocTypes()),
      licensedOrAuthorisedDate: of(this.getLicensedOrAuthorisedDate()),
    };

    if (this.firmDetails) {
      this.showPublishPanel = this.firmDetails.Publish_RptSch === 1 ? constants.TEXT_ONE : constants.TEXT_ZERO;
      this.firmType = this.firmDetails?.FirmTypeID;
    }

    // Add report-related observables dynamically if `this.report` exists
    if (this.report) {
      observables['reportingSchedule'] = new Observable((observer) => {
        // Populate dependent values before executing ShowReportingSchedule
        forkJoin({
          userRoles: observables['userRoles'],
          levelUsers: observables['levelUsers'],
          isSupervisor: observables['isSupervisor'],
          isAMLSupervisor: observables['isAMLSupervisor'],
        }).subscribe(() => {
          this.ShowReportingSchedule().subscribe(() => {
            observer.next();
            observer.complete();
          });
        });
      });
      observables['financialReportingPeriod'] = this.getFinancialReportingPeriod();
      observables['firmReportScheduledItemDetail'] = this.getFirmReportScheduledItemDetail();
    }

    // Combine all observables
    forkJoin(observables).subscribe({
      next: (results) => {
        // Assign base results to component properties
        this.assignedUserRoles = results['userRoles'];
        this.assignedLevelUsers = results['levelUsers'];
        this.ValidFirmSupervisor = results['isSupervisor'];
        this.FirmAMLSupervisor = results['isAMLSupervisor'];

        // Post-loading logic
        if (this.report) {
          console.log('Report-related data loaded successfully', {
            reportingSchedule: results['reportingSchedule'],
            financialReportingPeriod: results['financialReportingPeriod'],
            firmReportScheduledItemDetail: results['firmReportScheduledItemDetail'],
          });
        }

        if (!this.firmDetailsService.isValidAMLSupervisor()) {
          if (this.isCreateReportingSch) {
            this.populateReportTypes(constants.ObjectOpType.Create);
          } else {
            this.populateReportTypes(constants.ObjectOpType.Edit);
          }
        }

        this.filteredFirmRptDetails.forEach(report => {
          let rptEndDate = `${this.dateUtilService.convertDateToYYYYMMDD(report.RptPeriodToDate)}T00:00:00`;
          
          this.isReportingToDateValid(report.DocTypeID,rptEndDate);
        });

        const opType = this.isEditModeReportingSch ? this.isEditModeReportingSch : this.isCreateReportingSch;
        this.applySecurityOnPage(opType);

        this.DisableField = this.filteredFirmRptDetails?.some(
          (frsi) => !this.isValueNullOrEmpty(frsi.DocReceivedDate) || frsi.WFileAttached
        );

        console.log('All data loaded successfully');
      },
      error: (err) => {
        console.error('Error loading data:', err);
      },
      complete: () => {
        this.isLoading = false; // Hide loader after all data is fully loaded
      },
    });
  }








  // ngOnInit(): void {
  //   this.isLoading = true;

  //   forkJoin({
  //     userRoles: this.firmDetailsService.loadAssignedUserRoles(this.userId),
  //     levelUsers: this.firmDetailsService.loadAssignedLevelUsers(),
  //     isSupervisor: this.isValidFirmSupervisor(),
  //     isAMLSupervisor: this.isValidFirmAMLSupervisor(),
  //   }).subscribe({
  //     next: ({
  //       userRoles,
  //       levelUsers,
  //       isSupervisor,
  //       isAMLSupervisor,
  //     }) => {

  //       // Assign other data to component properties
  //       this.assignedUserRoles = userRoles;
  //       this.assignedLevelUsers = levelUsers;

  //       this.ValidFirmSupervisor = isSupervisor;
  //       this.FirmAMLSupervisor = isAMLSupervisor;

  //       // Apply security after all data is loaded
  //       let opType;
  //       if (this.isEditModeReportingSch) {
  //         opType = this.isEditModeReportingSch
  //       } else {
  //         opType = this.isCreateReportingSch;
  //       }
  //       this.applySecurityOnPage(opType);
  //     },
  //     error: (err) => {
  //       console.error('Error initializing page:', err);
  //     },
  //   });

  //   if (this.firmDetails) {
  //     this.showPublishPanel = this.firmDetails.Publish_RptSch === 1 ? constants.TEXT_ONE : constants.TEXT_ZERO;
  //     this.firmType = this.firmDetails?.FirmTypeID;
  //   }


  //   if (this.report) {
  //     this.isLoading = true;
  //     this.ShowReportingSchedule();
  //     this.getFinancialReportingPeriod();
  //     this.getFirmReportScheduledItemDetail();
  //   }

  //   if (!this.firmDetailsService.isValidAMLSupervisor()) {
  //     if (this.isCreateReportingSch) {
  //       this.populateReportTypes(constants.ObjectOpType.Create);
  //     } else {
  //       this.populateReportTypes(constants.ObjectOpType.Edit);
  //     }
  //   }

  //   this.DisableField = this.filteredFirmRptDetails.some((frsi) => {
  //     const isFileAttached = frsi.WFileAttached;
  //     return !this.isValueNullOrEmpty(frsi.DocReceivedDate) || isFileAttached;
  //   });

  //   this.getFinancialYearEnd();
  //   this.populateFirmRptSubmissionTypes();
  //   this.populateNotRequiredTypes();
  //   this.getDocumentType(constants.DocType_DocCategory.AMLMLROReports);
  //   this.getXBRLDocTypes();
  //   this.getLicensedOrAuthorisedDate();
  // }


  ngAfterViewInit() {
    this.dateInputs.changes.subscribe(() => {
      this.flatpickrService.initializeFlatpickr(this.dateInputs.toArray());
    });
    this.flatpickrService.initializeFlatpickr(this.dateInputs.toArray());
  }

  onClose(): void {
    this.applySecurityOnPage(false);
    this.closeRptPopup.emit();
  }

  getReportPeriodTypes() {
    this.reportScheduleService.getReportPeriodTypes().subscribe(res => {
      this.reportPeriodTypes = res.response;
    }, error => {
      console.error('Error Fetching Report Period Types: ', error);
    })
  }

  getRegularRptPeriodTypes(docTypeId: number) {
    return this.reportScheduleService.getRegulatorPeriodTypes(docTypeId).pipe(
      map((res: any) => res.response || []), // Extract response
      catchError((error) => {
        console.error('Error fetching regular period types:', error);
        return of([]); // Return an empty array on error
      })
    );
  }



  getFinancialReportingPeriod(): Observable<any> {
    return this.reportScheduleService
      .getFinancialReportingPeriod(this.firmId, this.report.FirmRptSchID)
      .pipe(
        tap((res) => {
          this.financialReportingPeriod = res.response;
          console.log('financialReportingPeriod', this.financialReportingPeriod);
        })
      );
  }


  isRptSchItemExists() {
    this.firmRptDetails.forEach(item => {
      if (!this.isValueNullOrEmpty(item.FirmRptSchItemID))
        this.returnReviewService.isFirmRptSchExists(item.FirmRptSchItemID).subscribe(response => {
          this.rptItemExists[item.FirmRptSchItemID] = response.response;
        }, error => {
          console.error(error);
          this.rptItemExists[item.FirmRptSchItemID] = 0;
        })
    })
  }

  warningsButton() {
    this.firmRptDetails.forEach(item => {
      if (!this.isValueNullOrEmpty(item.FirmRptSchItemID))
        this.returnReviewService.isFirmRptSchExists(item.FirmRptSchItemID).subscribe(response => {
          this.rptItemExists[item.FirmRptSchItemID] = response.response;
        }, error => {
          console.error(error);
          this.rptItemExists[item.FirmRptSchItemID] = 0;
        })
    })
  }

  getRptSchSignatories() {
    this.firmRptDetails.forEach(item => {
      if (!this.isValueNullOrEmpty(item.DocID))
        this.reportScheduleService.getObjectSignatories(item.FirmRptSchItemID, item.DocID).subscribe(data => {
          this.signatories[item.FirmRptSchItemID] = data.response;
        }, error => {
          console.error(error);
          this.signatories[item.FirmRptSchItemID] = [];
        })
    })
  }



  getFirmReportScheduledItemDetail(): Observable<any> {
    return new Observable((observer) => {
      this.isLoading = true;

      if (this.isCreateReportingSch) {
        this.isLoading = false;
        observer.next();
        observer.complete();
        return;
      }

      this.reportScheduleService
        .getFirmReportScheduledItemDetail(this.firmId, this.report.FirmRptSchID, true)
        .subscribe({
          next: (res) => {
            this.originalFirmRptDetails = res.response; // Original reference for comparison
            this.filteredFirmRptDetails = res.response.map((item) => ({ ...item })); // Shallow copy for modifications
            this.firmRptDetails = [...this.filteredFirmRptDetails];

            this.publishedReportIDs = this.firmRptDetails
              .filter((item) => item.WPublished && item.FirmRptSchItemID)
              .map((item) => item.FirmRptSchItemID)
              .join(',');

            this.cdr.detectChanges();

            this.isRptSchItemExists();
            this.getRptSchSignatories();

            if (this.pnlPublishReportingSch) {
              const isAllSchItemsPublished = this.firmRptDetails.filter(
                (item) => item.WSignOffStarted === null
              );

              this.publishButtons = isAllSchItemsPublished.length > 0;
            }

            this.publishBtnText =
              this.firmRptDetails[0].SchItemPublishedCount === constants.TEXT_ZERO
                ? 'Publish Reporting Schedule'
                : 'Re-publish Reporting Schedule';

            const documentDetailRequests = this.filteredFirmRptDetails
              .filter((item) => item.DocID)
              .map((item) =>
                this.logForm.getDocumentDetails(item.DocID).pipe(
                  map((data) => ({
                    ...item,
                    documentDetails: data.response,
                  }))
                )
              );

            if (documentDetailRequests.length > 0) {
              forkJoin<DocumentDetails[]>(documentDetailRequests).subscribe({
                next: (updatedDetails: DocumentDetails[]) => {
                  this.filteredFirmRptDetails = this.filteredFirmRptDetails.map(
                    (item) =>
                      updatedDetails.find((updated) => updated.DocID === item.DocID) || item
                  );
                  this.filteredFirmRptDetails = [...this.filteredFirmRptDetails];
                },
                error: (err) => {
                  console.error('Error fetching document details:', err);
                },
                complete: () => {
                  this.updatePaginationComponent();
                  observer.next();
                  observer.complete();
                },
              });
            } else {
              this.updatePaginationComponent();
              observer.next();
              observer.complete();
            }
          },
          error: (err) => {
            console.error('Error fetching firm report schedule details:', err);
            observer.error(err);
          },
        });
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

  getAMLReports() {
    this.logForm.getDocumentType(constants.DocType_DocCategory.AMLMLROReports).subscribe(
      data => {
        this.amlReports = data.response;
        console.log("this.documentTypeList", this.amlReports)
      },
      error => {
        console.error(error);
      }
    )
  }

  getXBRLDocTypes() {
    const docCategoryTypeID = constants.DocType_DocCategory.XBRLTYPES;
    this.logForm.getDocumentType(docCategoryTypeID).subscribe({
      next: (data) => {
        this.reportDocTypes = data.response;
      }, error: (error) => {
        console.error(`Error fetching Document Types:`, error);
        this.isLoading = false;
      },
    },)
  }

  getPrudentialTypes() {
    this.logForm.getDocumentType(constants.DocType_DocCategory.PrudReturn).subscribe(
      data => {
        this.prudentialTypes = data.response;
        console.log('Prudential Types:', this.prudentialTypes);
      },
      error => {
        console.error('Error fetching Prudential types:', error);
      }
    );
  }

  isXBRLTypeForReport(DocTypeID: any): boolean {
    return this.reportDocTypes.some(
      docType => docType.DocTypeID === parseInt(DocTypeID)
    );
  }

  isPrudentialType(DocTypeID: any): boolean {
    return this.prudentialTypes.some(
      docType => docType.DocTypeID === parseInt(DocTypeID)
    );
  }

  addTypeFlagsToReports(reports: any[]): any[] {
    return reports.map(report => ({
      ...report,
      IsPrudentialType: this.isPrudentialType(report.DocTypeID),
      IsXBRLType: this.isXBRLTypeForReport(report.DocTypeID),
    }));
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
          !this.amlReports.some(docType => docType.DocTypeID === item.DocTypeID)
        );
        break;

      case '3': // AML Reports
        this.filteredFirmRptDetails = this.firmRptDetails.filter(item =>
          this.amlReports.some(docType => docType.DocTypeID === item.DocTypeID)
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


  selectAllUnpublishedCheckbox() {
    this.firmRptDetails.forEach(report => {
      report.WPublished = true;
    })
  }

  //getters and setters
  get firmFinYearEndTypeID() {
    return this.isCreateReportingSch ? this.createRptSchObj.FirmFinYearEndTypeID : this.financialReportingPeriod.FirmFinYearEndTypeID;
  }

  set firmFinYearEndTypeID(value: number) {
    if (this.isCreateReportingSch) {
      this.createRptSchObj.FirmFinYearEndTypeID = value;
    } else {
      this.financialReportingPeriod.FirmFinYearEndTypeID = value;
    }
  }

  get firmRptFrom() {
    return this.isCreateReportingSch ? this.createRptSchObj.FirmRptFrom : this.financialReportingPeriod?.FirmRptFrom;
  }

  set firmRptFrom(value: string) {
    if (this.isCreateReportingSch) {
      this.createRptSchObj.FirmRptFrom = value;
    } else {
      this.financialReportingPeriod.FirmRptFrom = value;
    }
  }

  get firmRptTo() {
    return this.isCreateReportingSch ? this.createRptSchObj.FirmRptTo : this.financialReportingPeriod?.FirmRptTo;
  }

  set firmRptTo(value: string) {
    if (this.isCreateReportingSch) {
      this.createRptSchObj.FirmRptTo = value;
    } else {
      this.financialReportingPeriod.FirmRptTo = value;
    }
  }

  addNewReport() {
    const newReport = {
      FirmRptFrom: this.report.FirmRptFrom,
      FirmRptTo: this.report.FirmRptTo,
      DocTypeID: 0,
      FirmRptSubmissionTypeID: 0,
      WPublished: false,
      RptPeriodTypeID: 0,
      RptPeriodFromDate: null,
      RptPeriodToDate: null,
      ReportName: '',
      FirmRptDueDate: null,
      FirmRptReqdBit: true,
      FirmRptNReqReasonTypeID: 0,
      FirmRptNotes: '',
      AdditionalSheets: null,
      DocReceivedDate: null,
      documentDetails: null,
      ObjectStatusTypeDesc: '',
      ReviewStatusDesc: '',
      errorMessages: {},
      IsPrudentialType: false,
      IsXBRLType: false,
    };

    this.filteredFirmRptDetails.unshift(this.updateReportFlags(newReport));
    this.updatePaginationComponent();
  }

  updateReportFlags(report: any): any {
    return {
      ...report,
      IsPrudentialType: this.isPrudentialType(report.DocTypeID),
      IsXBRLType: this.isXBRLTypeForReport(report.DocTypeID),
    };
  }


  removeReport(index: number) {
    return Swal.fire({
      text: 'Are you sure you want to Remove this record?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok',
      cancelButtonText: 'Cancel',
      reverseButtons: false
    }).then((result) => {
      if (result.isConfirmed) {
        const absoluteIndex = this.filteredFirmRptDetails.indexOf(this.displayedItems[index]);

        if (absoluteIndex > -1) {
          // Remove the item from the full list
          this.filteredFirmRptDetails.splice(absoluteIndex, 1);

          // Adjust pagination if the current page becomes empty
          if (this.displayedItems.length === 1 && this.filteredFirmRptDetails.length > 0) {
            this.updatePaginationComponent(); // Update pagination to move items from next pages
          } else if (this.filteredFirmRptDetails.length === 0) {
            this.displayedItems = []; // Clear the displayed items if the list is empty
          } else {
            this.updatePaginationComponent(); // Refresh pagination
          }
        }
      }
    })
  }


  editReport() {
    this.isEditModeReportingSch = true;

    this.reportScheduleService.getReportPeriodTypes().subscribe({
      next: (reportPeriodTypes) => {
        this.reportPeriodTypes = reportPeriodTypes.response;

        // Loop through each report and fetch regulator period types based on DocTypeID
        this.filteredFirmRptDetails.forEach(report => {
          this.loadRptPeriodTypesForReport(report);
          report.errorMessages = {};
          if (report.DocTypeID == constants.Q100_PRUDENTIALRETURN || report.DocTypeID == constants.Q200_PRUDENTIALRETURN || report.DocTypeID == constants.Q300_PRUDENTIALRETURN) {
            this.loadErrorMessages('rptTypeChanged', constants.ReportingScheduleMessages.DONOTCHANGED_REPORTTYPE, null, null, report)
          }
        });
      },
      error: (error) => {
        console.error('Error fetching report period types:', error);
      }
    });

    this.applySecurityOnPage(this.isEditModeReportingSch);
  }


  async generateReportSch() {
    this.isLoading = true;
    this.financialReportingDateChanged = constants.TEXT_ZERO;
    const isValid = await this.isValidFinancialPeriod(2);

    if (!isValid) {
      this.supervisionService.showErrorAlert(constants.FirmActivitiesEnum.ENTER_ALL_REQUIREDFIELDS, 'error');
      this.isLoading = false;
      return; // Prevent further action if validation fails or the user cancels
    } else if (this.isReportDataChanged()) {
      this.isLoading = false;
      this.confirmGenerate();
    } else {
      this.getStandardReportingScheduleDetails();
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

    if (this.isValueNullOrEmpty(this.firmRptFrom)) {
      this.loadErrorMessages('FirmRptFrom', constants.ReportingScheduleMessages.ENTER_REPORTINPERIODFROM);
      this.hasValidationErrors = false;
    } else {
      delete this.errorMessages['FirmRptFrom'];
    }

    if (this.isValueNullOrEmpty(this.firmRptTo)) {
      this.loadErrorMessages('FirmRptTo', constants.ReportingScheduleMessages.ENTER_REPORTINPERIODTO);
      this.hasValidationErrors = false;
    } else {
      delete this.errorMessages['FirmRptTo'];
    }

    if (this.hasValidationErrors === true) {
      const financialReportingFrom = this.firmRptFrom;
      const financialReportingTo = this.firmRptTo;
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
        this.firmRptFrom = financialReportingFrom.toString();
        this.firmRptTo = financialReportingTo.toString();

        let validateFlag: number = 0;

        validateFlag = flag;

        try {
          const isGenerated = await this.reportScheduleService.isReportingScheduleGenerated(
            this.firmId,
            this.firmRptFrom,
            this.firmRptTo,
            validateFlag
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

      this.filteredFirmRptDetails.forEach(rpt => {
        rpt.errorMessages = {};
        // Validate RptPeriodFromDate
        if (this.isValueNullOrEmpty(rpt.RptPeriodFromDate)) {
          this.loadErrorMessages('RptPeriodFromDate', constants.ReturnReviewMessages.ENTER_PERIODFROM, null, null, rpt);
          this.loadErrorMessages('CorrectReportingSchItem', constants.ReportingScheduleMessages.CORRECT_REPORTLIST)
          this.hasValidationErrors = false;
          this.isValidReportingPeriodFrom = false;
        } else if (rpt.errorMessages['RptPeriodFromDate']) {
          delete rpt.errorMessages['RptPeriodFromDate'];
          delete this.errorMessages['CorrectReportingSchItem'];
        }

        // Validate RptPeriodToDate
        if (this.isValueNullOrEmpty(rpt.RptPeriodToDate)) {
          this.loadErrorMessages('RptPeriodFromTo', constants.ReturnReviewMessages.ENTER_PERIODTO, null, null, rpt);
          this.loadErrorMessages('CorrectReportingSchItem', constants.ReportingScheduleMessages.CORRECT_REPORTLIST)
          this.hasValidationErrors = false;
          this.isValidReportingPeriodTo = false;
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
            this.loadErrorMessages('RptPeriodFromDateGreaterThanRptPeriodDateTo', constants.MessageLogFormReport.INVALID_DATES, null, null, rpt);
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

  private removeErrorMessagesKey(item: any): any {
    const { errorMessages, ...cleanedItem } = item; // Destructure and exclude errorMessages
    return cleanedItem;
  }

  isReportDataChanged(): boolean {
    // Step 1: Check if originalFirmRptDetails and filteredFirmRptDetails exist
    if (!this.originalFirmRptDetails || !this.filteredFirmRptDetails) {
      return false; // No changes detected if one is undefined
    }

    // Step 2: Clean up both arrays - Remove errorMessages keys
    const cleanedOriginal = this.originalFirmRptDetails.map((item) =>
      this.removeErrorMessagesKey(item)
    );
    const cleanedCurrent = this.filteredFirmRptDetails.map((item) =>
      this.removeErrorMessagesKey(item)
    );

    // Step 3: Sort both arrays based on DocTypeID and FirmRptDueDate
    const sortedOriginal = [...cleanedOriginal].sort((a, b) =>
      a.DocTypeID - b.DocTypeID ||
      new Date(a.FirmRptDueDate).getTime() - new Date(b.FirmRptDueDate).getTime()
    );

    const sortedCurrent = [...cleanedCurrent].sort((a, b) =>
      a.DocTypeID - b.DocTypeID ||
      new Date(a.FirmRptDueDate).getTime() - new Date(b.FirmRptDueDate).getTime()
    );

    // Step 4: Check if counts are different
    if (sortedOriginal.length !== sortedCurrent.length) {
      return true; // Arrays are of different lengths, data has changed
    }

    // Step 5: Compare each item in the arrays
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

  async publishReports() {
    try {
      let publishedCounts = this.firmRptDetails[0].SchItemPublishedCount;
      // Separate published and unpublished reports
      const publishedReports = this.firmRptDetails.filter(report => report.WPublished === true);
      const unpublishedReports = this.firmRptDetails.filter(report => report.WPublished === false);

      // Concatenate the published report IDs into a single string
      const publishedItems = this.processPublishedItems();

      if (unpublishedReports.length === 0 && this.publishedReportIDs === publishedItems) {
        this.supervisionService.showErrorAlert(constants.ReportingScheduleMessages.ALLITEM_PUBLISHED, 'info', this.isLoading)
        return;
      }

      // Check for changes in the published count or IDs
      if (
        publishedCounts !== publishedReports.length ||
        this.publishedReportIDs !== publishedItems
      ) {
        const isConfirmed = await this.supervisionService.showPopupAlert(constants.ReportingScheduleMessages.RPTSCH_PUBLISH_WARNINGMSG, this.isLoading, this.publishBtnText);
        if (isConfirmed) {
          const rptSchObj = {
            reportSchID: this.report.FirmRptSchID,
            publishedBy: this.userId,
            csvRptSchItemID: publishedItems,
          };

          this.reportScheduleService.publishRptSch(rptSchObj).subscribe(response => {
            console.log(response);
            this.publishDetails = true;
            this.getFirmReportScheduledItemDetail();
            this.firmDetailsService.showSaveSuccessAlert(constants.ReportingScheduleMessages.RPTSCH_PUBLISHED_SUCCESSFULLY)
          }, error => {
            console.error('Error Publising Reports: ', error);
          })
        }
        return;
      } else {
        this.supervisionService.showErrorAlert(constants.ReportingScheduleMessages.SELECT_RPTSCHITEM_PUBLISH, 'error', this.isLoading)
      }

    } catch (error) {
      console.error('Error while publishing reports:', error);
    }
  }

  processPublishedItems(): string {
    const publishedItems = this.filteredFirmRptDetails
      .filter((item) => item.WPublished && item.FirmRptSchItemID)
      .map((item) => item.FirmRptSchItemID);

    // Join the IDs with commas
    return publishedItems.join(',');
  }



  getFinancialYearEnd() {
    this.reportScheduleService.getFinancialYearEnd(this.firmId).subscribe(data => {
      this.financialYearEndTypes = data.response;
      this.createRptSchObj.FirmFinYearEndTypeID = this.financialYearEndTypes[0].FirmFinYearEndTypeID;
      this.setFirmFinYearEndTypeID();
    }, error => {
      console.error(error);
    })
  }

  setFirmFinYearEndTypeID() {
    if (this.financialYearEndTypes.length > 0) {
      if (this.financialYearEndTypes.length > 1 && this.financialYearEndTypes[0].isWaiverInPlace === 0) {
        this.financialReportingPeriod.FirmFinYearEndTypeID = 12;
      }
    } else {
      this.loadErrorMessages('FinancialYearEnd', constants.ReportingScheduleMessages.FINANCIALYEAREND_NOTSETFROMCRO);
    }
  }

  loadRptPeriodTypesForReport(report: any) {
    if (report.FirmRptSubmissionTypeID === constants.TEXT_ONE) {
      // Fetch regulator period types for this DocTypeID
      this.reportScheduleService.getRegulatorPeriodTypes(report.DocTypeID).subscribe({
        next: (regulatorPeriodTypes) => {
          report.periodTypes = regulatorPeriodTypes.response || [];
        },
        error: (error) => {
          console.error(`Error fetching regulator period types for DocTypeID ${report.DocTypeID}:`, error);
        }
      });
    } else {
      // Ensure this.reportPeriodTypes is valid
      report.periodTypes = Array.isArray(this.reportPeriodTypes) ? [...this.reportPeriodTypes] : [];
    }
  }




  onReportTypeChange(report: any) {
    report.errorMessages = {};
    report.RptPeriodTypeID = 0;
    Object.assign(report, this.updateReportFlags(report));
    if (report.DocTypeID === constants.Q100_PRUDENTIALRETURN || report.DocTypeID === constants.Q200_PRUDENTIALRETURN || report.DocTypeID === constants.Q300_PRUDENTIALRETURN) {
      this.loadErrorMessages('rptTypeChanged', constants.ReportingScheduleMessages.DONOTCHANGED_REPORTTYPE, null, null, report)
    } else {
      delete report?.errorMessages['rptTypeChanged'];
    }
    this.loadRptPeriodTypesForReport(report);
  }

  onSubmissionTypeChange(report: any) {
    if (report.FirmRptSubmissionTypeID == constants.TEXT_ONE) {
      // Fetch regulator period types specific to this report's DocTypeID
      this.reportScheduleService.getRegulatorPeriodTypes(report.DocTypeID).subscribe({
        next: (regulatorPeriodTypes) => {
          report.periodTypes = regulatorPeriodTypes.response || [];
          const isValidPeriodType = report.periodTypes.some(
            (type) => type.RptPeriodTypeID === report.RptPeriodTypeID
          );

          // Reset to "Select" if the current RptPeriodTypeID is not valid
          if (!isValidPeriodType) {
            report.RptPeriodTypeID = 0; // Default to "Select"
          }

          if (this.isXBRLTypeForReport(report.DocTypeID)) {

          }

        },
        error: (error) => {
          console.error(`Error fetching regulator period types for DocTypeID ${report.DocTypeID}:`, error);
        }
      });
    } else {
      report.periodTypes = [...this.reportPeriodTypes];
    }
  }

  onRptPeriodTypeChange(report: any) {
    const rptPeriodFromDate = this.dateUtilService.convertDateToYYYYMMDD(report.RptPeriodFromDate);
    const rptPeriodToDate = this.dateUtilService.convertDateToYYYYMMDD(report.RptPeriodToDate);
    const firmRptDueDate = this.dateUtilService.convertDateToYYYYMMDD(report.FirmRptDueDate);

    this.reportScheduleService.getReportNameForAdditionalSchedules(
      report.DocTypeID,
      report.RptPeriodTypeID,
      rptPeriodFromDate,
      rptPeriodToDate,
      firmRptDueDate
    ).subscribe(data => {
      this.additionalSchedules = data.response;

      this.filteredFirmRptDetails = this.filteredFirmRptDetails.map(rpt => {
        if (rpt.FirmRptSchItemID === report.FirmRptSchItemID) {
          rpt.ReportName = this.additionalSchedules.RptName || rpt.ReportName;
          rpt.FirmRptDueDate = this.additionalSchedules.rptDueDate || rpt.FirmRptDueDate;
          rpt.RptFreqDesc = this.additionalSchedules.RptFreqTypeDesc || rpt.RptFreqDesc;


          if (this.isXBRLTypeForReport(rpt.DocTypeID)) {

          }
        }
        return rpt;
      });
    });
  }




  onRequiredChange(report: any) {
    if (report.FirmRptReqdBit === "false") {
      report.FirmRptNReqReasonTypeID = 0;
    }

    if (this.isXBRLTypeForReport(report.DocTypeID)) {

    }
  }

  deleteReport() {
    Swal.fire({
      text: 'Are you sure you want to delete this record?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok',
      cancelButtonText: 'Cancel',
      reverseButtons: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        if (!this.isValueNullOrEmpty(this.report.FirmRptSchID)) {
          if (this.report.FirmRptSchID == null) return;

          if (!this.checkFileAttached()) {
            if (!this.isReportingSchRefInRetReview()) {
              this.isFirmRptSchItemReferenced().subscribe(isReferenced => {
                if (isReferenced) {
                  this.loadErrorMessages('rptScheduleReferenced', constants.ReportingScheduleMessages.REPORTING_SCHEDULE_REFERENCED);
                } else {
                  if (!this.checkDocumentReceived()) {
                    this.reportScheduleService.deleteRptSch(this.firmId, this.report.FirmRptSchID).subscribe(response => {
                      this.isLoading = false;
                      this.firmDetailsService.showSaveSuccessAlert(constants.ReportingScheduleMessages.REPORTINGSCHEDULE_DELETEDSUCCESSFULLY);
                      this.report = null;
                      this.reloadReportSch.emit();
                      this.closeRptPopup.emit();
                      console.log('Deleted successfully', response);
                    });
                  } else {
                    this.loadErrorMessages('docLinked', constants.ReportingScheduleMessages.DOCUMENTLINKED_CANTDELETE);
                    this.isLoading = false;
                  }
                }
              });
            } else {
              this.loadErrorMessages('scheduleItemRef', constants.ReportingScheduleMessages.SCHEDULEITEMREFERENCED_CANTDELETE);
              this.isLoading = false;
            }
          } else {
            this.loadErrorMessages('fileAttached', constants.ReportingScheduleMessages.FILEATTACHED);
            this.isLoading = false;
          }
          this.isLoading = false;
        }
      }
    })
  }


  checkFileAttached(): boolean {
    return this.filteredFirmRptDetails.some(item => item.WFileAttached === true);
  }

  isReportingSchRefInRetReview(): boolean {
    let isReptSchItemRef = false;

    if (this.filteredFirmRptDetails?.length > 0) {
      this.filteredFirmRptDetails.some(item => {
        const hasReviewLink = this.rptItemExists[item.FirmRptSchItemID] && this.rptItemExists[item.FirmRptSchItemID] !== 0;
        if (hasReviewLink) {
          isReptSchItemRef = true;
          return true;
        }
        return false;
      });
    }

    return isReptSchItemRef;
  }

  isFirmRptSchItemReferenced(): Observable<boolean> {
    if (this.filteredFirmRptDetails?.length > 0) {
      const firmSchItemIds = Array.from(
        new Set(this.filteredFirmRptDetails.map(item => item.FirmRptSchItemID))
      ).join(", ");

      if (firmSchItemIds) {
        return this.reportScheduleService.isFirmRptSchItemReferenced(firmSchItemIds).pipe(
          map(response => response?.response ?? false), // Extract and return the `response` property
          catchError(error => {
            console.error("Error checking Firm Rpt Sch Item Reference:", error);
            return of(false);
          })
        );
      }
    }
    return of(false); // Return false if no valid IDs are found
  }



  checkDocumentReceived(): boolean {
    let isDocumentReceived = false;

    try {
      if (this.filteredFirmRptDetails?.length > 0) {
        isDocumentReceived = this.filteredFirmRptDetails.some(item => {
          const receivedDate = item.DocReceivedDate;
          return !!receivedDate;
        });
      }
    } catch (error) {
      console.error("Error in checkDocumentReceived:", error);
    }

    return isDocumentReceived;
  }


  async isValidateRptSchItems(): Promise<boolean> {
    this.hasValidationErrors = false;


    this.filteredFirmRptDetails.forEach(rpt => {
      rpt.errorMessages = {};
      if (parseInt(rpt.DocTypeID) === 0) {
        this.loadErrorMessages('reportType', constants.ReportingScheduleMessages.SELECT_REPORTTYPE, null, null, rpt);
        this.hasValidationErrors = true;
      } else {
        delete rpt.errorMessages['reportType'];
      }

      if (this.isValueNullOrEmpty(rpt.FirmRptDueDate)) {
        this.loadErrorMessages('dueDate', constants.ReportingScheduleMessages.ENTER_DUEDATE, null, null, rpt);
        this.hasValidationErrors = true;
        this.isValidDueDate = false;
      } else {
        delete rpt.errorMessages['dueDate'];
      }

      if (parseInt(rpt.FirmRptSubmissionTypeID) === 0) {
        this.loadErrorMessages('submissionType', constants.ReportingScheduleMessages.SELECT_REPORTSUBMISSIONTYPE, null, null, rpt);
        this.hasValidationErrors = true;
      } else {
        delete rpt.errorMessages['submissionType'];
      }

      if (parseInt(rpt.RptPeriodTypeID) === 0) {
        this.loadErrorMessages('rptPeriodType', constants.ReportingScheduleMessages.SELECT_REPORTINGPERIODTYPE, null, null, rpt);
        this.hasValidationErrors = true;
        this.isValidPeriodType = false;
      } else {
        delete rpt.errorMessages['rptPeriodType'];
      }

      if (this.isValueNullOrEmpty(rpt.ReportName.trim())) {
        this.loadErrorMessages('reportName', constants.ReportingScheduleMessages.ENTER_REPORTNAME, null, null, rpt);
        this.hasValidationErrors = true;
      } else {
        delete rpt.errorMessages['reportName'];
      }

      if (rpt.FirmRptReqdBit === false && parseInt(rpt.FirmRptNReqReasonTypeID) === 0) {
        this.loadErrorMessages('notRequired', constants.ReportingScheduleMessages.SELECT_NOTREQUIREDREASON, null, null, rpt);
        this.hasValidationErrors = true;
      } else {
        delete rpt.errorMessages['notRequired'];
      }

      if (this.isValidDueDate && this.isValidReportingPeriodFrom && this.isValidReportingPeriodTo) {
        const startDate = new Date(rpt.RptPeriodFromDate);
        const endDate = new Date(rpt.RptPeriodToDate);
        const dueDate = new Date(rpt.FirmRptDueDate);
        const finStartDate = new Date(rpt.FirmRptFrom);
        const finEndDate = new Date(rpt.FirmRptTo);

        if (dueDate > finEndDate || dueDate < finStartDate) {
          this.loadErrorMessages('DUEDATE_SHOULDBE_BETWEEN_REPSCHFROM_TODATE', constants.CROMessages.DUEDATE_SHOULDBE_BETWEEN_REPSCHFROM_TODATE, null, null, rpt);
          this.hasValidationErrors = true;
        } else {
          delete rpt.errorMessages['DUEDATE_SHOULDBE_BETWEEN_REPSCHFROM_TODATE'];
        }

        if (dueDate <= endDate) {
          this.loadErrorMessages('DUEDATE_GREATERTHAN_TODATE', constants.ReportingScheduleMessages.DUEDATE_GREATERTHAN_TODATE, null, null, rpt);
          this.hasValidationErrors = true;
        } else {
          delete rpt.errorMessages['DUEDATE_GREATERTHAN_TODATE'];
        }

        if (rpt.IsXBRLType || rpt.IsPrudentialType) {
          if (this.isValidReportingPeriodFrom) {
            if (rpt.IsXBRLType && parseInt(rpt.FirmRptSubmissionTypeID) === 1) {
              if (startDate.getDate() !== 1) {
                this.loadErrorMessages('REPORTINGSTARTDATE_FIRSTDAY', constants.ReportingScheduleMessages.REPORTINGSTARTDATE_FIRSTDAY, null, null, rpt);
                this.hasValidationErrors = true;
              } else {
                delete rpt.errorMessages['REPORTINGSTARTDATE_FIRSTDAY']
              }
            }
          }

          if (this.isValidReportingPeriodFrom) {
            if (rpt.IsXBRLType && parseInt(rpt.FirmRptSubmissionTypeID) === 1) {
              const lastDayOfMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0).getDate();
              if (endDate.getDate() !== lastDayOfMonth) {
                this.loadErrorMessages('REPORTINGENDDATE_LASTDAY', constants.ReportingScheduleMessages.REPORTINGENDDATE_LASTDAY, null, null, rpt);
                this.hasValidationErrors = true;
              } else {
                delete rpt.errorMessages['REPORTINGENDDATE_LASTDAY']
              }
            }
          }

          if (rpt.IsXBRLType) {
            if (this.isValidReportingPeriodFrom && this.isValidReportingPeriodTo && this.isValidPeriodType && !this.isValueNullOrEmpty(rpt.RptFreqDesc)) {
              if (this.isReportingPeriodValid(rpt.RptFreqDesc, startDate, endDate)) {
                this.loadErrorMessages('REPORTINGDATESINVALIDFORSELECTEDFREQUENCY', constants.ReportingScheduleMessages.REPORTINGDATESINVALIDFORSELECTEDFREQUENCY, null, null, rpt);
                this.hasValidationErrors = true;
              } else {
                delete rpt.errorMessages['REPORTINGDATESINVALIDFORSELECTEDFREQUENCY']
              }


              if (!this.DateValid) {
                this.loadErrorMessages('EFFECTIVEREPORTTYPEDATE', constants.ReportingScheduleMessages.EFFECTIVEREPORTTYPEDATE, null, null, rpt);
                this.hasValidationErrors = true;
              } else {
                delete rpt.errorMessages['EFFECTIVEREPORTTYPEDATE']
              }
            }
          }
        }

      }
    })

    return !this.hasValidationErrors;
  }

  isReportingPeriodValid(rptFreqDesc: string, startDate: Date, endDate: Date): boolean {
    this.rptPeriodNotValid;

    switch (rptFreqDesc) {
      case constants.MONTHLY:
        if (startDate.getMonth() !== endDate.getMonth() || startDate.getFullYear() !== endDate.getFullYear()) {
          this.rptPeriodNotValid = true;
        }
        break;

      case constants.QUARTERLY:
        if (
          startDate.getMonth() !== new Date(endDate.setMonth(endDate.getMonth() - 2)).getMonth() ||
          startDate.getFullYear() !== new Date(endDate).getFullYear()
        ) {
          this.rptPeriodNotValid = true;
        }
        break;

      case constants.SEMI_ANNUALLY:
        if (
          startDate.getMonth() !== new Date(endDate.setMonth(endDate.getMonth() - 5)).getMonth() ||
          startDate.getFullYear() !== new Date(endDate).getFullYear()
        ) {
          this.rptPeriodNotValid = true;
        }
        break;

      case constants.ANNUAL:
        if (
          startDate.getMonth() !== new Date(endDate.setMonth(endDate.getMonth() - 11)).getMonth() ||
          startDate.getFullYear() !== new Date(endDate).getFullYear()
        ) {
          this.rptPeriodNotValid = true;
        }
        break;

      default:
        this.rptPeriodNotValid = false;
        break;
    }

    return this.rptPeriodNotValid;
  }

  isReportingToDateValid(DocTypeID: number, rptPeriodToDate: string) {
    this.reportScheduleService.isReportingToDateValid(DocTypeID,rptPeriodToDate).subscribe(data => {
      this.DateValid = data.response.IsValid;
    }, error => {
      console.error(error);
    })
  }


  async saveReport() {
    this.isLoading = true;

    this.filteredFirmRptDetails = this.addTypeFlagsToReports(this.filteredFirmRptDetails);

    // Validate before saving
    let flag = 1;
    if (this.isCreateReportingSch) {
      flag = 2;
    }

    const isValidFinancial = await this.isValidFinancialPeriod(flag);
    const isValidRptItem = await this.isValidateRptSchItems();

    if (!isValidFinancial || !isValidRptItem) {
      this.supervisionService.showErrorAlert(constants.FirmActivitiesEnum.ENTER_ALL_REQUIREDFIELDS, 'error');
      this.isLoading = false;
      return;
    }

    if (await this.isRptItemDuplicate()) {
      this.supervisionService.showErrorAlert(constants.ReportingScheduleMessages.DUPLICATEREPORTSCHEDULEITEMSPRESENTONPAGE, 'error', false);
      this.isLoading = false;
      return;
    }

    const rptSchDataObj = this.prepareRptSchObject(this.userId);

    this.reportScheduleService.saveReportSchedule(rptSchDataObj).subscribe({
      next: () => {
        console.log('Saved Successfully');
        this.firmDetailsService.showSaveSuccessAlert(constants.ReportingScheduleMessages.REPORTINGSCHEDULE_SAVEDSUCCESSFULLY);
        this.applySecurityOnPage(false);
        this.reloadReportSch.emit();
        this.closeRptPopup.emit();
      }
    })
  }

  async isRptItemDuplicate(): Promise<boolean> {

    // Step 1: Group by detailed criteria and identify duplicates
    const groupedDuplicates: Record<string, any[]> = this.filteredFirmRptDetails.reduce((groups, item) => {
      const key = `${item.DocTypeID}-${this.dateUtilService.convertDateToYYYYMMDD(item.FirmRptDueDate)}-${item.FirmRptSubmissionTypeID}-${this.dateUtilService.convertDateToYYYYMMDD(item.RptPeriodFromDate)}-${this.dateUtilService.convertDateToYYYYMMDD(item.RptPeriodToDate)}-${item.ReportName}-${item.RptFreqDesc}`;
      groups[key] = groups[key] || [];
      groups[key].push(item);
      return groups;
    }, {} as Record<string, any[]>);

    const duplicateItems: any[] = Object.values(groupedDuplicates).filter((group) => group.length > 1).flat();

    // Step 2: Apply error messages only to duplicate items
    if (duplicateItems.length > 0) {
      const errorMessage = constants.ReportingScheduleMessages.DUPLICATEREPORTSCHEDULEITEM;
      const correctionMessage = constants.ReportingScheduleMessages.CORRECT_REPORTLIST;

      this.filteredFirmRptDetails.forEach((item) => {
        item.errorMessages = {}; // Reset errors for each item

        // Check if the current item matches any duplicate
        const isDuplicate = duplicateItems.some((dup) =>
          dup.DocTypeID === item.DocTypeID &&
          this.dateUtilService.convertDateToYYYYMMDD(dup.FirmRptDueDate) === this.dateUtilService.convertDateToYYYYMMDD(item.FirmRptDueDate) &&
          dup.FirmRptSubmissionTypeID === item.FirmRptSubmissionTypeID &&
          this.dateUtilService.convertDateToYYYYMMDD(dup.RptPeriodFromDate) === this.dateUtilService.convertDateToYYYYMMDD(item.RptPeriodFromDate) &&
          this.dateUtilService.convertDateToYYYYMMDD(dup.RptPeriodToDate) === this.dateUtilService.convertDateToYYYYMMDD(item.RptPeriodToDate) &&
          dup.ReportName === item.ReportName &&
          dup.RptFreqDesc === item.RptFreqDesc
        );

        if (isDuplicate) {
          this.loadErrorMessages('duplicateReport', errorMessage, null, null, item);
          this.loadErrorMessages('CorrectReportingSchItem', correctionMessage, null, null, item);
        } else {
          delete item.errorMessages['duplicateReport'];
          delete item.errorMessages['CorrectReportingSchItem'];
        }
      });

      return true; // Duplicates exist
    }

    return false; // No duplicates found
  }








  prepareRptSchObject(userId: number) {
    return {
      objFirmReportSch: {
        firmRptSchID: this.isCreateReportingSch ? null : this.report.FirmRptSchID,
        firmFinYearEndTypeID: this.firmFinYearEndTypeID,
        firmID: this.firmId,
        createdBy: userId,
        lastModifiedBy: userId,
        createdDate: null,
        lastModifiedDate: this.currentDate,
        firmRptFrom: this.dateUtilService.convertDateToYYYYMMDD(this.firmRptFrom),
        firmRptTo: this.dateUtilService.convertDateToYYYYMMDD(this.firmRptTo),
        firmFinYearEndTypeDesc: this.isCreateReportingSch ? null : this.report.FirmFinYearEndTypeDesc,
        isWaiverInPlace: false,
        isPublished: this.isCreateReportingSch ? null : this.report.WPublished,
        publishedBy: this.isCreateReportingSch ? null : this.report.PublishedBy,
        publishedByUserName: this.isCreateReportingSch ? null : this.report.PublishedByUserName,
        publishedDate: this.isCreateReportingSch ? null : this.dateUtilService.convertDateToYYYYMMDD(this.report.WPublishedDate),
        qfcNumber: null,
        lstReportSchItems: null,
        firmRptFinancialStart: null,
        firmRptFinancialEnd: null,
        validateFlag: 0,
        legalStatusTypeDesc: null,
        prudentialCategoryTypeDesc: null,
        sectorTypeDesc: null,
        holdsClientMoney: null
      },
      lstFirmReportSchItems: this.filteredFirmRptDetails.map(rpt => {
        return {
          rowID: null,
          firmRptSchItemID: this.isCreateReportingSch ? null : rpt.FirmRptSchItemID,
          firmRptSchID: this.isCreateReportingSch ? null : rpt.FirmRptSchID,
          docTypeID: rpt.DocTypeID,
          firmRptReqdBit: rpt.FirmRptReqdBit,
          firmRptExclusionReasonTypeID: rpt.FirmRptReqdBit ? rpt.FirmRptNReqReasonTypeID : null,
          firmRptDueDate: this.dateUtilService.convertDateToYYYYMMDD(rpt.FirmRptDueDate),
          firmRptNotes: rpt.FirmRptNotes,
          createdBy: userId,
          reportName: rpt.ReportName,
          rptPeriodFromDate: this.dateUtilService.convertDateToYYYYMMDD(rpt.RptPeriodFromDate),
          rptPeriodToDate: this.dateUtilService.convertDateToYYYYMMDD(rpt.RptPeriodToDate),
          rptPeriodTypeID: rpt.RptPeriodTypeID,
          firmRptReqID: rpt.FirmRptReqID,
          wPublish: rpt.WPublished,
          firmID: this.firmId,
          submissionBeforeRptPeriodEnd: rpt.SubmissionBeforeRptPeriodEnd,

          firmRptSchItemSubItemsList: null,

          isXbrlType: this.isXBRLTypeForReport(rpt.DocTypeID),
          docID: rpt.DocID,
          objectID: this.Page.ReportingSchedule,
          qfcNumber: null,
          rptFreqTypeDesc: rpt.RptFreqDesc,
          firmRptSubmissionTypeID: rpt.FirmRptSubmissionTypeID
        }
      }),
      concatinatedDocRefID: ""
    }
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
        this.errorMessages = {};
        this.applySecurityOnPage(false);
        if (this.isEditModeReportingSch) {
          this.getFirmReportScheduledItemDetail();
        }
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
        }
      });
    });
  }

  getStandardReportingScheduleDetails() {
    this.isLoading = true;
    if (this.isCreateReportingSch) {
      this.reportsGenerated = true;
    }

    const reportScheduleFrom = this.dateUtilService.convertDateToYYYYMMDD(this.firmRptFrom);
    const reportScheduleTo = this.dateUtilService.convertDateToYYYYMMDD(this.firmRptTo);
    const rptScheduleType = this.rptScheduleType;
    let financialYearEndTypeID = null;

    if (this.financialYearEndTypes.length > 0) {
      financialYearEndTypeID = this.firmFinYearEndTypeID;
    }

    if (rptScheduleType === constants.GenerateReportType.FromPrevious) {
      this.isValidReportingFinancialFromPrevious(reportScheduleFrom, reportScheduleTo).subscribe(isFilterdValidated => {
        if (isFilterdValidated) {
          this.getfirmStandardReportScheduledItemDetail(reportScheduleFrom, reportScheduleTo, rptScheduleType, financialYearEndTypeID);
        } else {
          this.isLoading = false;
        }
      });
    } else {
      this.getfirmStandardReportScheduledItemDetail(reportScheduleFrom, reportScheduleTo, rptScheduleType, financialYearEndTypeID);
    }
    this.isLoading = false;
  }


  isValidReportingFinancialFromPrevious(reportScheduleFrom: string, reportScheduleTo: string): Observable<boolean> {
    return this.validateReportingScheduleFromPrevious(reportScheduleFrom, reportScheduleTo).pipe(
      map((response: number) => {
        let isValid = true;

        this.successOrErrorCode = response;

        if (this.successOrErrorCode === 100) {
          this.loadErrorMessages(
            'rptNotScheduleGeneratePreviousReport',
            constants.ReportingScheduleMessages.REPORTSNOTSCHEDULE_GENERATEPREVIOUSREPORT_SCHEDULEPREVIOUESSCHEDULE
          );
          isValid = false;
        } else {
          delete this.errorMessages['rptNotScheduleGeneratePreviousReport'];
        }

        if (this.successOrErrorCode === 101) {
          this.loadErrorMessages(
            'rptNotScheduleForOneYearEarlier',
            constants.ReportingScheduleMessages.REPORTSNOTSCHEDULEDFORONEYEAREARLIER
          );
          isValid = false;
        } else {
          delete this.errorMessages['rptNotScheduleForOneYearEarlier'];
        }

        if (this.successOrErrorCode === 102) {
          this.loadErrorMessages(
            'financialPeriodMonthIsDifferent',
            constants.ReportingScheduleMessages.FINANCIALPERIODMONTHISDIFFERENT
          );
          isValid = false;
        } else {
          delete this.errorMessages['financialPeriodMonthIsDifferent'];
        }

        return isValid;
      })
    );
  }


  validateReportingScheduleFromPrevious(reportScheduleFrom: string, reportScheduleTo: string): Observable<number> {
    return this.reportScheduleService.validateReportingSchedule(this.firmId, reportScheduleFrom, reportScheduleTo);
  }

  getfirmStandardReportScheduledItemDetail(
    reportScheduleFrom: string,
    reportScheduleTo: string,
    rptScheduleType: number,
    financialYearEndTypeID: number | null
  ): void {
    this.isLoading = true;
    if (this.isCreateReportingSch) {
      this.filteredFirmRptDetails = [];
    }

    this.reportScheduleService
      .getfirmStandardReportScheduledItemDetail(
        this.firmId,
        reportScheduleFrom,
        reportScheduleTo,
        rptScheduleType,
        financialYearEndTypeID
      )
      .subscribe({
        next: (data) => {
          const items = data.response || [];

          if (items.length > 0) {
            // Step 1: Merge existing details with new items
            this.filteredFirmRptDetails = this.filteredFirmRptDetails.map((existingItem) => {
              const updatedItem = items.find(
                (newItem) => newItem.FirmRptReqID === existingItem.FirmRptReqID
              );

              return updatedItem
                ? {
                  ...existingItem, // Preserve original keys and values
                  ...updatedItem, // Overwrite with new response values
                  FirmRptReqdBit: rptScheduleType === constants.GenerateReportType.New ? true : updatedItem.FirmRptReqdBit,
                  ReportName: updatedItem.RptName || '',
                  RptPeriodFromDate: updatedItem.RptPeriodFromDate || '',
                  RptPeriodToDate: updatedItem.RptPeriodToDate || '',
                  FirmRptNotes: updatedItem.FirmRptNotes || '',
                  FirmRptDueDate: updatedItem.DueDatewithbuffer || '',
                  WFileAttached: existingItem.WFileAttached ?? false, // Retain original value or default to false
                  DocReceivedDate: existingItem.DocReceivedDate ?? null,
                }
                : existingItem; // Retain the original item if no match is found
            });

            // Step 2: Add new items that do not exist in the current list
            const newItems = items.filter(
              (newItem) =>
                !this.filteredFirmRptDetails.some(
                  (existingItem) => existingItem.FirmRptReqID === newItem.FirmRptReqID
                )
            );

            this.filteredFirmRptDetails = [
              ...this.filteredFirmRptDetails,
              ...newItems.map((item) => ({
                ...item,
                RowID: this.generateGuid(), // Generate a unique RowID for new items
                ReportName: item.RptName || '',
                FirmRptReqdBit: rptScheduleType === constants.GenerateReportType.New ? true : item.FirmRptReqdBit,
                RptPeriodFromDate: item.RptPeriodFromDate || '',
                RptPeriodToDate: item.RptPeriodToDate || '',
                FirmRptNotes: item.FirmRptNotes || '',
                FirmRptDueDate: item.DueDatewithbuffer || '',
                WFileAttached: false, // Default to false for new items
                DocReceivedDate: null,
              })),
            ];
          } else {
            // Step 3: Add an empty item if no items are returned
            this.filteredFirmRptDetails = [
              this.getReportScheduleItemsEmptyObject(),
            ];
          }

          // Step 4: Load period types for reports
          this.filteredFirmRptDetails.forEach((report) =>
            this.loadRptPeriodTypesForReport(report)
          );

          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching report schedule:', err);
          this.isLoading = false;
        },
      });
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

  ShowReportingSchedule(): Observable<void> {
    return new Observable((observer) => {
      if (this.firmType === constants.TEXT_TWO) {
        if (this.firmDetailsService.isValidAMLSupervisor()) {
          this.reportType = 3;
        }
        if ((this.firmDetailsService.isValidAMLSupervisor() || !this.isEditAllowed) === false) {
          this.canPublish = false;
        }
      } else {
        if (!this.ValidFirmSupervisor) {
          this.canPublish = false;
        }
        if (this.firmDetailsService.isValidAMLSupervisor()) {
          this.reportType = 3;
        } else {
          this.reportType = 1;
        }
      }

      if (this.pnlPublishReportingSch && this.showPublishPanel === constants.TEXT_ONE && this.canPublish) {
        let isRptSchPublished: boolean = false;
        if (this.report.FirmRptSchID != null) {
          isRptSchPublished = this.report.WPublished;
        }
        if (isRptSchPublished) {
          this.publishDetails = true;
        } else {
          this.report.PublishedByUserName = '';
          this.report.WPublishedDate = '';
          this.publishDetails = false;
        }
      } else {
        this.pnlPublishReportingSch = false;
      }

      observer.next();
      observer.complete();
    });
  }


  registerMasterPageControlEvents() {
    // Edit mode
    if (this.isEditModeReportingSch || this.isCreateReportingSch) {
      this.hideExportBtn = true;
      return;
    }
    // View mode
    this.hideExportBtn = false;
    this.isLoading = false;
  }

  loadErrorMessages(fieldName: string, msgKey: number, customMessage?: string, placeholderValue?: string, rpt?: any) {
    this.supervisionService.getErrorMessages(fieldName, msgKey, customMessage, placeholderValue, rpt).subscribe(
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

  populateNotRequiredTypes() {
    this.supervisionService.populateNotRequiredTypes(this.userId, constants.ObjectOpType.Create).subscribe(
      notRequiredTypes => {
        this.allNotRequiredTypes = notRequiredTypes;
      },
      error => {
        console.error('Error fetching not required types:', error);
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
