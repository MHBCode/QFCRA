import { Component, EventEmitter, Input, Output, ElementRef, QueryList, ViewChildren, ViewChild } from '@angular/core';
import { SupervisionService } from '../../supervision.service';
import { LogformService } from 'src/app/ngServices/logform.service';
import * as constants from 'src/app/app-constants';
import { FirmDetailsService } from 'src/app/firms/firmsDetails.service';
import { ActivatedRoute } from '@angular/router';
import { Bold, ClassicEditor, Essentials, Font, FontColor, FontSize, Heading, Indent, IndentBlock, Italic, Link, List, MediaEmbed, Paragraph, Table, Undo } from 'ckeditor5';
import { ObjectwfService } from 'src/app/ngServices/objectwf.service';
import { FlatpickrService } from 'src/app/shared/flatpickr/flatpickr.service';
import { SanitizerService } from 'src/app/shared/sanitizer-string/sanitizer.service';
import { FirmRptAdminFeeService } from 'src/app/ngServices/firm-rpt-admin-fee.service';
import { SafeHtml } from '@angular/platform-browser';
import { WaiverService } from 'src/app/ngServices/waiver.service';
import { FrimsObject, ObjectOpType } from 'src/app/app-constants';
import { DateUtilService } from 'src/app/shared/date-util/date-util.service';
import { tap, switchMap, forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { ReviewComponent } from 'src/app/shared/review/review.component';
@Component({
  selector: 'app-admin-fee-popup',
  templateUrl: './admin-fee-popup.component.html',
  styleUrls: ['./admin-fee-popup.component.scss', '../../supervision.scss']
})
export class AdminFeePopupComponent {
  @ViewChildren('dateInputs') dateInputs!: QueryList<ElementRef<HTMLInputElement>>;
  @ViewChild(ReviewComponent) reviewComponent!: ReviewComponent;

  @Input() fee: any;
  @Input() firmId: any;
  @Input() firmDetails: any;
  @Output() closeAdminFeePopup = new EventEmitter<void>();
  @Output() reloadAdminFee = new EventEmitter<void>();

  userId: number = 10044;
  isEditModeAdminFee: boolean = false;
  isLoading: boolean = true;
  Page = FrimsObject;
  now = new Date();
  totalLateDays: number = 0;
  currentDate = this.now.toISOString();
  currentDateOnly = new Date(this.currentDate).toISOString().split('T')[0];
  AdminFeeDetials: any;
  showCalculatedFeePopup: boolean = false;
  userObjTasks: any[] = [];
  ResubmissionHistoryList: any;
  CalculatedFee: any;
  dayCount: any;
  rptWFStatus: number = 0;
  fetchedDocumentTypes: any[] = [];
  selectedImposedRadio: boolean = false;

  //dropdowns
  allAdminFeeRates: any[] = [];
  allCurrencyTypes: any[] = [];

  // Validations
  hasValidationErrors: boolean = false;
  errorMessages: { [key: string]: string } = {};

  // Security
  hideEditBtn: boolean = false;
  hideSaveBtn: boolean = false;
  hideCancelBtn: boolean = false;
  hideCreateBtn: boolean = false;
  hideDeleteBtn: boolean = false;
  hideStartWfBtn: boolean = false;
  hideCancelWfBtn: boolean = false;

  hideExportBtn: boolean = false;

  FirmAMLSupervisor: boolean = false;
  UserSupervisorToTheFirm: boolean = false;

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

  constructor(
    private supervisionService: SupervisionService,
    private route: ActivatedRoute,
    private logForm: LogformService,
    private firmDetailsService: FirmDetailsService,
    private objectwfService: ObjectwfService,
    private sanitizerService: SanitizerService,
    private firmRptAdminFeeService: FirmRptAdminFeeService,
    private dateUtilService: DateUtilService
  ) {

  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.firmId = +params['id'];
    });

    forkJoin({
      isUserSupervisor: this.isUserSupervisorToTheFirm(),
      isValidAMLSupervisor: this.isValidFirmAMLSupervisor()
    }).subscribe({
      next: () => {
        this.loadFirmDetails(this.firmId);
        this.getAdminFeeDetials();
        this.getDocumentTypes();
        this.getMessageProperty();
        this.populateAdminFeeRates();
        this.populateCurrencyTypes();
        this.getResubmissionHistoryList();
      },
      error: (err) => {
        console.error('Error executing supervisor checks:', err);
      }
    });
  }


  onClose(): void {
    this.closeAdminFeePopup.emit();
  }

  constructLink(): string {
    if (this.AdminFeeDetials[0]) {
      return this.AdminFeeDetials[0].LinkToReview +
        this.firmId +
        constants.AMPERSAND +
        constants.QUERYSTRING_SCHEDULEITEMID +
        constants.CHAR_EQUAL +
        this.AdminFeeDetials[0].FirmRptSchItemID;
    }
    return '';
  }

  applySecurityOnPage(objectId: FrimsObject) {
    this.isLoading = true;
    const currentOpType = this.isEditModeAdminFee ? ObjectOpType.Edit : ObjectOpType.View;

    this.firmDetailsService
      .applyAppSecurity(this.userId, objectId, currentOpType, this.rptWFStatus, this.fee.FirmrptAdminFeeID)
      .then(() => {
        if (!this.isEditModeAdminFee) {
          this.hideButtonAccordinttoUsers();
        }
        this.registerMasterPageControlEvents();
      })
      .finally(() => {
        this.isLoading = false;
      });
  }


  hideButtonAccordinttoUsers() {
    let isUserTaskInProgress: boolean = false;
    const objectWfStatusID = this.AdminFeeDetials[0].ObjectWfStatusID;
    const docTypeID = this.AdminFeeDetials[0].DocTypeID;
    const firmTypeID = this.firmDetails.FirmTypeID;
    let firmuser = this.UserSupervisorToTheFirm;
    let bShowButton = false;

    if (!this.supervisionService.isNullOrEmpty(objectWfStatusID)) {
      const obj = this.userObjTasks.filter(item => item.wfTaskAssignedToUser === this.userId && item.objectWFStatusTypeID === 1);
      if (obj !== null && obj.length > 0) {
        isUserTaskInProgress = true;
      }
    }

    if (!this.supervisionService.isNullOrEmpty(docTypeID)) {
      if (this.FirmAMLSupervisor) {
        if (this.fetchedDocumentTypes.length > 0 && this.fetchedDocumentTypes.hasOwnProperty(docTypeID)) {
          bShowButton = true;
          firmuser = true;
        } else {
          bShowButton = false;
        }

        if (!bShowButton && isUserTaskInProgress) {
          this.hideActionButton();
        }
      }
      else if (firmuser && firmTypeID == 2) {
        if (this.fetchedDocumentTypes.length > 0 && this.fetchedDocumentTypes.hasOwnProperty(docTypeID)) {
          bShowButton = false;
        } else {
          bShowButton = true;
        }

        if (!bShowButton && !isUserTaskInProgress) {
          this.hideActionButton();
        }
      } else if (firmuser == false) {
        if (!this.supervisionService.isNullOrEmpty(objectWfStatusID)) {
          if (isUserTaskInProgress) {

          } else if (firmuser) {

          } else {
            this.hideActionButton();
          }
        } else {
          this.hideActionButton();
        }
      }
    } else if (firmuser === false) {
      if (!this.supervisionService.isNullOrEmpty(objectWfStatusID)) {
        if (isUserTaskInProgress) {

        } else if (firmuser) {

        } else {
          this.hideActionButton();
        }
      } else {
        this.hideActionButton();
      }
    }

    if (this.rptWFStatus == constants.WorkFlowStatusType.InProgress && firmuser) {
      this.hideCancelWfBtn = false;
    }
  }

  registerMasterPageControlEvents() {
    if (!this.isEditModeAdminFee) {
      this.hideDeleteBtn = true;
      this.hideCancelBtn = true;
      const firmuser = this.UserSupervisorToTheFirm;

      if (!this.supervisionService.isNullOrEmpty(this.firmId) && !this.isEditModeAdminFee) {
        if (this.rptWFStatus == constants.WorkFlowStatusType.InProgress && firmuser) {
          this.hideCancelWfBtn = false;
        }
      }
    } else {
      this.hideExportBtn = true;
      this.hideCancelBtn = false;
    }
  }

  isValidFirmAMLSupervisor() {
    return this.firmDetailsService.isValidFirmAMLSupervisor(this.firmId, this.userId).pipe(
      tap(response => this.FirmAMLSupervisor = response)
    );
  }

  isUserSupervisorToTheFirm() {
    return this.firmDetailsService.isUserSupervisorToTheFirm(this.firmId, this.userId).pipe(
      tap(response => this.UserSupervisorToTheFirm = response)
    );
  }

  getControlVisibility(controlName: string): boolean {
    return this.firmDetailsService.getControlVisibility(controlName);
  }

  getControlEnablement(controlName: string): boolean {
    return this.firmDetailsService.getControlEnablement(controlName);
  }

  hideActionButton() {
    this.hideEditBtn = true;
    this.hideSaveBtn = true;
    this.hideCancelBtn = true;
    this.hideCreateBtn = true;
    this.hideDeleteBtn = true;
    this.hideStartWfBtn = true;
    this.hideCancelWfBtn = true;
  }

  loadFirmDetails(firmId: number) {
    this.firmDetailsService.loadFirmDetails(firmId).subscribe(
      data => {
        this.firmDetails = data.firmDetails;
      },
      error => {
        console.error(error);
      }
    );
  }

  getAdminFeeDetials() {
    this.isLoading = true;
    const firmRptFeeID = this.fee.FirmrptAdminFeeID;

    this.firmRptAdminFeeService.getAdminFeeDetials(firmRptFeeID).pipe(
      tap(res => {
        this.AdminFeeDetials = res.response;
        this.AdminFeeDetials.forEach(data => {
          data.FirmRptDueDate = this.dateUtilService.formatDateToCustomFormat(data.FirmRptDueDate);
          data.RptPeriodFromDate = this.dateUtilService.formatDateToCustomFormat(data.RptPeriodFromDate);
          data.RptPeriodToDate = this.dateUtilService.formatDateToCustomFormat(data.RptPeriodToDate);
        });
        console.log(this.AdminFeeDetials);
      }),
      switchMap(() => {
        return this.objectwfService.getObjectInstanceWorkflowStatus(
          this.Page.LateAdminFee,
          this.fee.FirmrptAdminFeeID,
          constants.TEXT_ONE
        );
      })
    ).subscribe({
      next: data => {
        this.rptWFStatus = data.response;
        this.applySecurityOnPage(this.Page.LateAdminFee);
      },
      error: error => {
        console.error('Error in processing workflow or applying security:', error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  // getObjectWorkFlow() {
  //   const firmRptAdminFeeID = this.AdminFeeDetials[0].FirmrptAdminFeeID;
  //   const firmRptReviewRevNum = this.AdminFeeDetials[0].FirmRptReviewRevNum;
  //   this.objectwfService.getObjectWorkflow(this.Page.LateAdminFee, firmRptAdminFeeID, firmRptReviewRevNum).subscribe(data => {
  //     this.objWorkFlow = data.response;
  //   })
  // }


  getResubmissionHistoryList() {
    const firmRptSchItemId = this.fee.FirmRptSchItemID
    const firmRptReviewId = this.fee.FirmRptReviewID
    const firmRptReviewRevId = this.fee.FirmRptReviewRevNum
    const firmRptAdminFeeID = this.fee.FirmrptAdminFeeID
    this.firmRptAdminFeeService.getResubmissionHistoryList(firmRptSchItemId, firmRptReviewId, firmRptReviewRevId, firmRptAdminFeeID).subscribe({
      next: (res) => {
        this.ResubmissionHistoryList = res.response;
        console.log("ResubmissionHistoryList", this.ResubmissionHistoryList)
        this.totalLateDays = this.ResubmissionHistoryList.reduce((sum, item) => sum + parseInt(item.noLateDaysForDisplay, 10), 0);
      },
      error: (error) => {
        console.error('Error fitching ResubmissionHistoryList', error);
      },
    });
  }

  onReviewDataReceived(tasks: any) {
    this.userObjTasks = tasks;
    console.log('Received review data:', this.userObjTasks);
  }

  getDocumentTypes() {
    const docTypeId = constants.DocType_DocCategory.AMLMLROReports;
    this.objectwfService.getDocumentType(docTypeId).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.fetchedDocumentTypes = res.response;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error Fetching Document Types For Admin Fee', error);
      },
    });
  }

  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizerService.sanitizeHtml(html);
  }

  getCalculatedFee() {
    this.showCalculatedFeePopup = true
    const adminFeeRateID = this.fee.AdminFeeRateID;

    const day = parseInt(this.dayCount, 10);
    this.firmRptAdminFeeService.getCalculatedFee(adminFeeRateID, day).subscribe({
      next: (res) => {
        this.CalculatedFee = res.response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching calculated fee', error);
      },
    });
    setTimeout(() => {
      const popupWrapper = document.querySelector('.calculatedFeePopup') as HTMLElement;
      if (popupWrapper) {
        popupWrapper.style.display = 'flex';
      } else {
        console.error('Element with class .calculatedFeePopup not found');
      }
    }, 0);
  }

  closeCalculatedFeePopup() {
    this.showCalculatedFeePopup = false;
  }

  getMessageProperty() {
    const messageKey = "LateAdminFee_day";
    this.logForm.getMessageProperty(messageKey).subscribe({
      next: (res) => {
        this.dayCount = res.response;
        console.log("dayCount", this.dayCount)
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fitching userObjTasks', error);
      },
    });
  }

  editAdminFee() {
    this.isEditModeAdminFee = true;
    this.reviewComponent.ngOnInit();
    this.applySecurityOnPage(this.Page.LateAdminFee);
  }

  cancelAdminFee() {
    Swal.fire({
      text: 'Are you sure you want to cancel your changes ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok',
      cancelButtonText: 'Cancel',
      reverseButtons: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.isEditModeAdminFee = false;
        this.closeAdminFeePopup.emit();
        this.applySecurityOnPage(this.Page.LateAdminFee);
      }
    });
  }

  imposeAnAdministrativeonChange(): void {
    this.selectedImposedRadio = this.AdminFeeDetials[0].feeImposed;
    if (this.selectedImposedRadio) {
      this.AdminFeeDetials[0].ImposedAmount = this.AdminFeeDetials[0].CalculatedAmount;
    } else {
      this.AdminFeeDetials[0].ImposedAmount = 0;
    }
  }

  populateAdminFeeRates() {
    this.supervisionService.populateAdminFeeRates(this.userId, constants.ObjectOpType.Create).subscribe(adminFeeRates => {
      this.allAdminFeeRates = adminFeeRates;
    }, error => {
      console.error(error);
    })
  }

  populateCurrencyTypes() {
    this.supervisionService.populateCurrenyTypes(this.userId, constants.ObjectOpType.Create).subscribe(currencyTypes => {
      this.allCurrencyTypes = currencyTypes;
    }, error => {
      console.error(error);
    })
  }

  async validateAdminFee(flag: number): Promise<boolean> {
    this.hasValidationErrors = false;

    if (this.AdminFeeDetials[0].feeImposed === false && this.supervisionService.isNullOrEmpty(this.AdminFeeDetials[0].Justification)) {
      this.loadErrorMessages('ENTER_JUSTIFICATION', constants.LateAdminFeeMSG.ENTER_JUSTIFICATION);
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['ENTER_JUSTIFICATION'];
    }

    if (this.AdminFeeDetials[0].feeImposed === true && this.supervisionService.isNullOrEmpty(this.AdminFeeDetials[0].ImposedAmount)) {
      this.loadErrorMessages('ENTER_IMPOSEDAMOUNT', constants.LateAdminFeeMSG.ENTER_IMPOSEDAMOUNT);
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['ENTER_IMPOSEDAMOUNT'];
    }

    if (this.AdminFeeDetials[0].feeImposed === true && !this.supervisionService.isNullOrEmpty(this.AdminFeeDetials[0].ImposedAmount)) {
      const imposedAmount = parseFloat(this.AdminFeeDetials[0].ImposedAmount);
      if (!this.dateUtilService.isPositiveNonDecimal(imposedAmount)) {
        this.loadErrorMessages('VALID_IMPOSEDAMOUNT', constants.LateAdminFeeMSG.VALID_IMPOSEDAMOUNT);
        this.hasValidationErrors = true;
      } else {
        delete this.errorMessages['VALID_IMPOSEDAMOUNT'];
      }
    }

    if (parseInt(this.AdminFeeDetials[0].AdminFeeRateID) === 0) {
      this.loadErrorMessages('RULES_CALCULATION', constants.LateAdminFeeMSG.RULES_CALCULATION);
      this.hasValidationErrors = true;
    } else {
      delete this.errorMessages['RULES_CALCULATION'];
    }

    if (flag === 1) {

    }

    return this.hasValidationErrors;
  }

  prepareAdminFeeObject(userId: number) {
    return {
      objFirmRptAdminFee: {
        firmRptAdminFeeID: 0,
        firmRptSchItemID: 0,
        feeImposed: true,
        calculatedAmount: "string",
        imposedAmount: "string",
        recommendation: "string",
        justification: "string",
        objectWFStatusID: 0,
        createdBy: 0,
        lastModifiedBy: 0,
        objectId: 0,
        firmRptReviewItemID: 0,
        adminFeeRateID: 0,
        calculatedAmountCurrencyTypeID: 0,
        imposedAmountCurrencyTypeID: 0,
      },
      objWFStatus: {
        objectWFStatusID: 0,
        objectID: 0,
        objectInstanceID: 0,
        objectInstanceRevisionNo: 0,
        objectWFStatusTypeID: 0,
        createdBy: 0,
        lastModifiedBy: 0,
        comments: "string",
        firmID: 0,
        reportName: "string",
        individualsName: "string",
        objectWFTaskStatusID: 0,
        objectWFLastModifiedByName: "string",
        objectWFLastModifiedByDate: "string",
      },
      lstWFTasks: [
        {
          objectWFTaskStatusID: 0,
          objectWFStatusID: 0,
          objectWFTaskTypeID: 0,
          objectWFTaskSequenceNo: 0,
          wfTaskAssignedToUser: 0,
          wfTaskAssignedToRole: 0,
          wfTaskAssignedDate: "string",
          wfTaskCompletedDate: "string",
          wfTaskDueDate: "string",
          objectWFStatusTypeID: 0,
          objectWFTaskTypeDescription: "string",
          wfTaskAssignedToRoleDescription: "string",
          lastModifiedBy: 0,
          emailToAddress: "string",
          emailCCAddress: "string",
          emailToIDs: "string",
          emailCCIDs: "string",
          userComments: "string",
          taskSRNo: 0,
          userName: "string",
          objectWFStatusTypeDesc: "string",
          objectWFCommentID: 0,
          commentsDate: "string",
          objectWFTaskStart: true,
          objectWFTaskMandatory: true,
          isNewTask: true,
          firmName: "string",
          fileName: "string",
          objectID: 0,
          objectName: "string",
          objectNum: "string",
          firmID: 0,
          objectLink: "string",
          objectIdentifierID: "string",
          objectRevNum: "string",
          isEnabled: true,
          groupTaskFlag: true,
          objectEditableFlag: true,
          isEditableTask: true,
          objectWFTaskDefsID: 0,
          completionEmailTO: "string",
          completionEmailCC: "string",
          completionEmailCCIds: "string",
          completionAssignToUserID: 0,
          completionUserName: "string",
          completionAssignToRoleID: 0,
          completionAppRoleDesc: "string",
          completionEmailToIds: "string",
          wfTaskCompletedBy: "string",
          reviewInitiatedBy: "string",
          reviewInitiatedDate: "string",
          taskInitiatedBy: 0,
          taskInitiatedDate: "string",
          taskInitiatedByName: "string",
          reasonForEsclation: "string",
          statusSetBy: "string",
          defaultUserID: 0,
        },
      ],
      lstWFTaskNotification: [
        {
          objectWFTaskNotificationID: 0,
          objectWFStatusID: 0,
          objectWFTaskStatusID: 0,
          appRoleID: 0,
          userID: 0,
          emailTo: true,
          emailCC: true,
          objectWFTaskSequenceNo: 0,
          appRoleDescription: "string",
          lastModifiedBy: 0,
          userName: "string",
          emailToAddress: "string",
          emailCCAddress: "string",
          taskSRNo: 0,
          completionNotificationFlag: 0,
        },
      ],
    }
  }

  async saveAdminFee() {
    this.isLoading = true;
    const isValid = await this.validateAdminFee(0);

    if (isValid) {
      this.supervisionService.showErrorAlert(constants.AISMessages.AISSAVEERROR, 'error');
      this.isLoading = false;
      return;
    }

    const AdminFeeDataObj = this.prepareAdminFeeObject(this.userId);

    this.firmRptAdminFeeService.saveLateAdminFee(AdminFeeDataObj).subscribe({
      next: (response) => {
        this.isEditModeAdminFee = false;
        this.isLoading = false;
        this.closeAdminFeePopup.emit();
        this.reloadAdminFee.emit();
        this.applySecurityOnPage(this.Page.LateAdminFee);
      },
      error: (err) => {
        console.error('Error saving late admin fee:', err);
        this.isLoading = false;
      },
      complete: () => {
        this.firmDetailsService.showSaveSuccessAlert(constants.LateAdminFeeMSG.SAVED_MSG);
        console.log('Save late admin fee request completed.');
      },
    });

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

}
