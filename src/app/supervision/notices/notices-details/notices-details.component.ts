import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FrimsObject, ObjectOpType, ResponseTypes } from 'src/app/app-constants';
import { FirmDetailsService } from 'src/app/firms/firmsDetails.service';
import { NoticeService } from 'src/app/ngServices/notice.service';
import { SupervisionService } from '../../supervision.service';
import * as constants from 'src/app/app-constants';
import { ObjectwfService } from 'src/app/ngServices/objectwf.service';
import { LogformService } from 'src/app/ngServices/logform.service';
import { SanitizerService } from 'src/app/shared/sanitizer-string/sanitizer.service';
import { SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-notices-details',
  templateUrl: './notices-details.component.html',
  styleUrls: ['./notices-details.component.scss', '../../../shared/popup.scss', '../../supervision.scss']
})
export class NoticesDetailsComponent implements OnInit, OnChanges {
  @Input() notice: any;
  @Input() firmDetails: any;
  @Input() firmId: any;
  @Output() closeNoticePopup = new EventEmitter<void>();
  selectedNotice: any = null;
  isEditable: boolean = false;
  noticeDetailsInfo: any;
  questionnaireDetails: any;
  conditionDetails: any;
  noticeDetails: any;
  filteredConditions: any;
  escalationConditions: any;
  explanationConditions: any;
  userId: number = 30;
  isLoading: boolean = false;
  Page = FrimsObject;
  responseTypes = ResponseTypes;

  // document
  attachmentbyFirm: any = [];
  attachmentNotice: any = [];
  fileLocation: any;

  publishOnWebsite: boolean = false;

  // popups
  showCondtionsPopup: boolean = false;
  showEmailPopup: boolean = false;

  // Security
  hideEditBtn: boolean = false;
  hideSaveBtn: boolean = false;
  hideCancelBtn: boolean = false;
  hideCreateBtn: boolean = false;
  hideReviseBtn: boolean = false;
  hideDeleteBtn: boolean = false;
  hideExportBtn: boolean = false;

  constructor(
    private noticeService: NoticeService,
    private firmDetailsService: FirmDetailsService,
    private supervisionService: SupervisionService,
    private objectWF: ObjectwfService,
    private logForm: LogformService,
    private sanitizerService: SanitizerService,
  ) {

  }

  ngOnInit(): void {
    this.loadAdditionalDocument();
    this.loadAdditionalDocumentByFirm();
    this.applySecurityOnPage(this.Page.Notices);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['notice'] && changes['notice'].currentValue) {
      this.getFirmsNotices();
    }
  }

  applySecurityOnPage(objectId: FrimsObject) {
    this.isLoading = true;
    const currentOpType = ObjectOpType.List;

    this.firmDetailsService.applyAppSecurity(this.userId, objectId, currentOpType,null,null).then(() => {
      this.registerMasterPageControlEvents();
    });
  }

  registerMasterPageControlEvents() {
    if (!this.supervisionService.isNullOrEmpty(this.notice.NoticeTypeID) && this.notice.NoticeTypeID === constants.TEXT_ONE) {
      this.hideExportBtn = false;
    }
    this.isLoading = false;
  }

  hideActionButton() {
    this.hideEditBtn = true;
    this.hideSaveBtn = true;
    this.hideCancelBtn = true;
    this.hideCreateBtn = true;
    this.hideDeleteBtn = true;
    this.hideReviseBtn = true;
  }

  editNotice(notice: any) {
    this.selectedNotice = { ...notice }; // Clone the object to avoid modifying directly
  }

  deleteNotice(notice: any) {
  }

  saveReport() {

  }


  getFirmsNotices() {
    if (this.firmId && this.notice.FirmNoticeID) {
      this.noticeService.getFirmNoticeDetails(this.firmId, this.notice.FirmNoticeID).subscribe(
        data => {
          this.noticeDetailsInfo = data.response;
          this.noticeDetails = (this.noticeDetailsInfo.find(item => item.key === "ResultSet1")?.value)[0];
          this.questionnaireDetails = (this.noticeDetailsInfo.find(item => item.key === "ResultSet2")?.value);
          this.conditionDetails = (this.noticeDetailsInfo.find(item => item.key === "ResultSet3")?.value);
          console.log('noticeDetailsInfo', this.noticeDetailsInfo)
        },
        error => {
          console.error('Error fetching noticeTypes ', error);
        }
      );
    }
  }

  loadAdditionalDocumentByFirm() {
    this.objectWF.getDocument(this.Page.NoticesResponse, this.notice.FirmNoticeID, 1).pipe(
    ).subscribe(
      data => {
        this.attachmentbyFirm = data.response; 
        this.logForm.constructDocUrl(this.attachmentbyFirm).subscribe(
          response => {
            if (response) {
              this.attachmentbyFirm = this.attachmentbyFirm.map((doc, index) => ({
                ...doc,
                fileLoc: response.response[index]?.fileLoc || ''
              }));
            }
          },
          error => {
            console.error('Error constructing document URL:', error);
          }
        );
      },
      error => {
        console.error('Error loading document:', error);
        this.attachmentbyFirm = [];

      }
    );
  }

  loadAdditionalDocument() {
    this.objectWF.getDocument(this.Page.Notices, this.notice.NoticeID, 1).pipe(
    ).subscribe(
      data => {
        this.attachmentNotice = data.response; 
        this.logForm.constructDocUrl(this.attachmentNotice).subscribe(
          response => {
            if (response) {
              this.attachmentNotice = this.attachmentNotice.map((doc, index) => ({
                ...doc,
                fileLoc: response.response[index]?.fileLoc || ''
              }));
            }
          },
          error => {
            console.error('Error constructing document URL:', error);
          }
        );
      },
      error => {
        console.error('Error loading document:', error);
        this.attachmentNotice = [];

      }
    );
  }

  openEmailNotifPopup() {
    this.showEmailPopup = true;
    

    setTimeout(() => {
      const popupWrapper = document.querySelector('.emailPopup') as HTMLElement;
      if (popupWrapper) {
        popupWrapper.style.display = 'flex';
      } else {
        console.error('Element with class .emailPopup not found');
      }
    }, 0);
  }

  closeEmailNotifPopup() {
    this.showEmailPopup = false;
  }

  openConditionsPopup(noticeQuestionnaireItemID: number) {
    this.showCondtionsPopup = true;
    this.filteredConditions = this.conditionDetails.filter(condition =>
      condition.NoticeQuestionnaireItemID === noticeQuestionnaireItemID
    );

    this.explanationConditions = this.filteredConditions.filter(condition =>
      condition.EvaluationReasonTypeID === 1
    );

    this.escalationConditions = this.filteredConditions.filter(condition =>
      condition.EvaluationReasonTypeID === 2
    );

    setTimeout(() => {
      const popupWrapper = document.querySelector('.conditionsPopup') as HTMLElement;
      if (popupWrapper) {
        popupWrapper.style.display = 'flex';
      } else {
        console.error('Element with class .conditionsPopup not found');
      }
    }, 0);
  }

  closeCondtionsPopup() {
    this.showCondtionsPopup = false;
  }

  onClose(): void {
    this.closeNoticePopup.emit();
  }

  hasEscalationOrExplanationCriteria(noticeQuestionnaireItemID: number): boolean {
    return this.conditionDetails.some(
      condition => condition.NoticeQuestionnaireItemID === noticeQuestionnaireItemID
    );
  }
  

  getSanitizedHtml(response: string | null | undefined): SafeHtml {
    return this.sanitizerService.sanitizeHtml(response || '');
  }
  

  shouldShowHr(response: string | null, responseTypeID: any, explanationRequired: any): boolean {
    if (!responseTypeID || explanationRequired === 0) {
      return false;
    }

    if (response?.trim() && !response.includes("No Response provided")) {
      return true;
    }

    return false;
  }


}
