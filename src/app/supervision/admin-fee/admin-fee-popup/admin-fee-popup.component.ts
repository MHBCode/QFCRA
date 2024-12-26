import { Component, EventEmitter, Input, Output, ChangeDetectorRef, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { SupervisionService } from '../../supervision.service';
import { SecurityService } from 'src/app/ngServices/security.service';
import { LogformService } from 'src/app/ngServices/logform.service';
import * as constants from 'src/app/app-constants';
import { FirmDetailsService } from 'src/app/firms/firmsDetails.service';
import { ActivatedRoute } from '@angular/router';
import { RegisteredfundService } from 'src/app/ngServices/registeredfund.service';
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
import { isNullOrUndef } from 'chart.js/dist/helpers/helpers.core';
@Component({
  selector: 'app-admin-fee-popup',
  templateUrl: './admin-fee-popup.component.html',
  styleUrls: ['./admin-fee-popup.component.scss', '../../supervision.scss']
})
export class AdminFeePopupComponent {
  @ViewChildren('dateInputs') dateInputs!: QueryList<ElementRef<HTMLInputElement>>;

  @Input() fee: any;
  @Input() firmId: any;
  @Input() firmDetails: any;
  @Output() closeRegPopup = new EventEmitter<void>();
  @Output() fundDeleted = new EventEmitter<void>();

  userId: number = 10044;
  isEditable: boolean = false;
  isLoading: boolean = true;
  Page = FrimsObject;
  now = new Date();
  totalLateDays: number = 0;
  currentDate = this.now.toISOString();
  currentDateOnly = new Date(this.currentDate).toISOString().split('T')[0];
  AdminFeeDetials: any;
  showCalculatedFeePopup: boolean = false;
  showPreviousCommentsModal: boolean = false;
  UserObjectWfTasks: any[] = [];
  ResubmissionHistoryList: any;
  RevisionCommentsList: any;
  CalculatedFee: any;
  dayCount: any;
  rptWFStatus: number = 0;
  fetchedDocumentTypes: any[] = [];

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
    private securityService: SecurityService,
    private route: ActivatedRoute,
    private logForm: LogformService,
    private registeredFundService: RegisteredfundService,
    private firmDetailsService: FirmDetailsService,
    private objectwfService: ObjectwfService,
    private flatpickrService: FlatpickrService,
    private sanitizerService: SanitizerService,
    private firmRptAdminFeeService: FirmRptAdminFeeService,
    private waiverService: WaiverService,
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
      },
      error: (err) => {
        console.error('Error executing supervisor checks:', err);
      }
    });
  }


  onClose(): void {
    this.closeRegPopup.emit();
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
    const currentOpType = ObjectOpType.View;
    this.firmDetailsService.applyAppSecurity(this.userId, objectId, currentOpType, this.rptWFStatus, this.fee.FirmrptAdminFeeID).then(() => {
      this.hideButtonAccordinttoUsers();
      this.registerMasterPageControlEvents();
    })
    this.isLoading = false;
  }

  hideButtonAccordinttoUsers() {
    let isUserTaskInProgress: boolean = false;
    const objectWfStatusID = this.AdminFeeDetials[0].ObjectWfStatusID;
    const docTypeID = this.AdminFeeDetials[0].DocTypeID;
    const firmTypeID = this.firmDetails.FirmTypeID;
    let firmuser = this.UserSupervisorToTheFirm;
    let bShowButton = false;

    if (!this.supervisionService.isNullOrEmpty(objectWfStatusID)) {
      const obj = this.UserObjectWfTasks.filter(item => item.wfTaskAssignedToUser === this.userId && item.objectWFStatusTypeID === 1);
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
    this.hideDeleteBtn = true;
    this.hideCancelBtn = true;
    const firmuser = this.UserSupervisorToTheFirm;

    if (!this.supervisionService.isNullOrEmpty(this.firmId)) {
      if (this.rptWFStatus == constants.WorkFlowStatusType.InProgress && firmuser) {
        this.hideCancelWfBtn = false;
      }
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
        this.getResubmissionHistoryList();
        this.getUserObjectWfTasks();
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

  getObjectInstanceWorkflowStatus() {

  }

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

  getRevisionCommentsByWaiver() {
    this.showPreviousCommentsModal = true;
    const objectWFStatusID = this.fee.ObjectWfStatusID;
    this.waiverService.getRevisionCommentsByWaiver(objectWFStatusID).subscribe({
      next: (res) => {
        this.RevisionCommentsList = res.response;
        console.log("RevisionCommentsList", this.RevisionCommentsList)
      },
      error: (error) => {
        console.error('Error fitching RevisionCommentsList', error);
      },
    });
  }

  getUserObjectWfTasks() {
    const ObjectWFStatusID = this.fee.ObjectWfStatusID;
    this.objectwfService.getUserObjectWfTasks(ObjectWFStatusID).subscribe({
      next: (res) => {
        this.UserObjectWfTasks = res.response;
        console.log("UserObjectWfTasks", this.UserObjectWfTasks)
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fitching UserObjectWfTasks', error);
        this.isLoading = false;
      },
    });
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
        console.error('Error fitching UserObjectWfTasks', error);
      },
    });
  }

  closePreviousCommentsModal() {
    this.showPreviousCommentsModal = false;
  }

  editFee() {
    this.isEditable = true
  }
  saveFee() {

  }
}
